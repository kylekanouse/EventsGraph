import { logger } from '../../../logger'
import { SylvaConnectionManager } from './SylvaConnectionManager'
import { sylvaSSEToEventData } from './mappers/event.mapper'
import IEventData from '../../../../domain/IEventData'

/**
 * Filters for SSE event stream subscription.
 * Maps to query params on GET /api/events/stream.
 */
export interface EventStreamFilters {
  eventTypes?: string[]
  channelIds?: string[]
  gpaIds?: string[]
  tier?: string
  consequence?: string
}

/**
 * Raw SSE event shape from Sylva /api/events/stream.
 */
export interface SylvaSSEEvent {
  type: string
  data: {
    id?: string
    sourceId?: string
    targetId?: string
    gpaId?: string
    channelId?: string
    participantId?: string
    consequence?: string
    tier?: string
    coherenceScore?: number
    timestamp?: string
    [key: string]: unknown
  }
}

type EventHandler = (event: IEventData) => void

/**
 * SylvaEventBridge
 *
 * Manages a single SSE connection to Sylva and fans out events
 * to context-specific handlers. Starts lazily on first subscription.
 *
 * Usage:
 *   const unsub = bridge.subscribe(['governance.receipt', ...], handler)
 *   // ... later
 *   unsub()  // unsubscribes; if last subscriber, closes SSE
 */
export class SylvaEventBridge {
  private _conn: SylvaConnectionManager
  private _handlers: Map<string, Set<EventHandler>> = new Map()
  private _abortController: AbortController | null = null
  private _connected = false
  private _disposed = false
  private _reconnectAttempts = 0
  private _maxReconnectAttempts = 5
  private _reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private _subscriberCount = 0

  constructor(conn: SylvaConnectionManager) {
    this._conn = conn
  }

  /**
   * subscribe
   *
   * Register a handler for specific event types.
   * Starts the SSE connection if not already running.
   * Returns an unsubscribe function.
   */
  subscribe(eventTypes: string[], handler: EventHandler): () => void {
    if (this._disposed) {
      throw new Error('SylvaEventBridge is disposed')
    }

    for (const type of eventTypes) {
      if (!this._handlers.has(type)) {
        this._handlers.set(type, new Set())
      }
      this._handlers.get(type)!.add(handler)
    }

    this._subscriberCount++

    // Lazy connect on first subscriber
    if (!this._connected) {
      this._connect()
    }

    // Return unsubscribe function
    return () => {
      for (const type of eventTypes) {
        const handlers = this._handlers.get(type)
        if (handlers) {
          handlers.delete(handler)
          if (handlers.size === 0) {
            this._handlers.delete(type)
          }
        }
      }

      this._subscriberCount--

      // Close connection when no subscribers remain
      if (this._subscriberCount <= 0) {
        this._subscriberCount = 0
        this._disconnect()
      }
    }
  }

  /**
   * dispose
   *
   * Tears down the event bridge completely.
   */
  dispose(): void {
    this._disposed = true
    this._disconnect()
    this._handlers.clear()
  }

  // --- Private ---

  /**
   * _connect
   *
   * Opens the SSE connection to Sylva /api/events/stream.
   * Uses fetch with ReadableStream to consume SSE since
   * native EventSource doesn't support custom auth headers.
   */
  private async _connect(): Promise<void> {
    if (this._connected || this._disposed) return

    try {
      const token = await this._conn.getToken()
      this._abortController = new AbortController()

      // Build query params from all registered event types
      const registeredTypes = [...this._handlers.keys()]
      const queryParams = new URLSearchParams()
      if (registeredTypes.length > 0) {
        queryParams.set('eventTypes', registeredTypes.join(','))
      }

      const url = `${this._conn.baseUrl}/api/events/stream?${queryParams.toString()}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
        signal: this._abortController.signal,
      })

      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('SSE response has no body')
      }

      this._connected = true
      this._reconnectAttempts = 0

      logger.info('SylvaEventBridge: SSE connected')

      // Read the SSE stream
      this._readStream(response.body)

    } catch (err) {
      if (!this._disposed) {
        logger.error({ err }, 'SylvaEventBridge: connection failed')
        this._connected = false
        this._scheduleReconnect()
      }
    }
  }

  /**
   * _readStream
   *
   * Reads the SSE byte stream and parses events.
   * SSE format: "event: <type>\ndata: <json>\n\n"
   */
  private async _readStream(body: ReadableStream<Uint8Array>): Promise<void> {
    const reader = body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Split on double newline (SSE event separator)
        const events = buffer.split('\n\n')
        buffer = events.pop() || '' // Keep incomplete event in buffer

        for (const rawEvent of events) {
          if (rawEvent.trim()) {
            this._parseAndDispatch(rawEvent)
          }
        }
      }
    } catch (err: unknown) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError'
      if (!isAbort && !this._disposed) {
        logger.error({ err }, 'SylvaEventBridge: stream read error')
        this._connected = false
        this._scheduleReconnect()
      }
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * _parseAndDispatch
   *
   * Parses a raw SSE event string and dispatches to registered handlers.
   */
  private _parseAndDispatch(rawEvent: string): void {
    let eventType = 'message'
    let eventData = ''

    for (const line of rawEvent.split('\n')) {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim()
      } else if (line.startsWith('data:')) {
        eventData = line.slice(5).trim()
      }
    }

    if (!eventData) return

    try {
      const parsed: SylvaSSEEvent = {
        type: eventType,
        data: JSON.parse(eventData),
      }

      const transformed = sylvaSSEToEventData(parsed)
      if (!transformed) return

      // Dispatch to handlers registered for this event type
      const handlers = this._handlers.get(eventType)
      if (handlers) {
        for (const handler of handlers) {
          try {
            handler(transformed)
          } catch (err) {
            logger.error({ err, eventType }, 'SylvaEventBridge: handler error')
          }
        }
      }

      // Also dispatch to wildcard handlers (registered as '*')
      const wildcardHandlers = this._handlers.get('*')
      if (wildcardHandlers) {
        for (const handler of wildcardHandlers) {
          try {
            handler(transformed)
          } catch (err) {
            logger.error({ err, eventType }, 'SylvaEventBridge: wildcard handler error')
          }
        }
      }

    } catch (err) {
      logger.warn({ err, rawEvent: rawEvent.substring(0, 200) }, 'SylvaEventBridge: failed to parse event')
    }
  }

  /**
   * _disconnect
   *
   * Closes the SSE connection.
   */
  private _disconnect(): void {
    if (this._abortController) {
      this._abortController.abort()
      this._abortController = null
    }
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer)
      this._reconnectTimer = null
    }
    this._connected = false
  }

  /**
   * _scheduleReconnect
   *
   * Exponential backoff reconnection: 1s, 2s, 4s, 8s, 16s, max 30s.
   * Gives up after _maxReconnectAttempts consecutive failures.
   */
  private _scheduleReconnect(): void {
    if (this._disposed || this._subscriberCount <= 0) return

    this._reconnectAttempts++

    if (this._reconnectAttempts > this._maxReconnectAttempts) {
      logger.error(
        `SylvaEventBridge: giving up after ${this._maxReconnectAttempts} reconnect attempts`,
      )
      return
    }

    const delay = Math.min(1000 * Math.pow(2, this._reconnectAttempts - 1), 30_000)
    logger.info(
      { attempt: this._reconnectAttempts, delay },
      'SylvaEventBridge: scheduling reconnect',
    )

    this._reconnectTimer = setTimeout(() => {
      this._connect()
    }, delay)
  }
}
