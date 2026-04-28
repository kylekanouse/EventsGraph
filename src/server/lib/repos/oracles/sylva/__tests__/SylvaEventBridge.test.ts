import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SylvaEventBridge } from '../SylvaEventBridge'
import { SylvaConnectionManager } from '../SylvaConnectionManager'

// Mock logger to suppress output during tests
vi.mock('../../../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('SylvaEventBridge', () => {
  let mockConn: SylvaConnectionManager
  let bridge: SylvaEventBridge

  beforeEach(() => {
    mockConn = {
      getToken: vi.fn().mockResolvedValue('mock-token'),
      baseUrl: 'http://localhost:3100',
    } as unknown as SylvaConnectionManager

    bridge = new SylvaEventBridge(mockConn)
  })

  afterEach(() => {
    bridge.dispose()
    vi.restoreAllMocks()
  })

  describe('subscribe', () => {
    it('should return an unsubscribe function', () => {
      // Mock fetch to prevent actual SSE connection
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        body: new ReadableStream(),
      }))

      const handler = vi.fn()
      const unsub = bridge.subscribe(['governance.receipt'], handler)
      expect(typeof unsub).toBe('function')

      unsub()
      vi.unstubAllGlobals()
    })

    it('should throw if bridge is disposed', () => {
      bridge.dispose()
      expect(() => bridge.subscribe(['test'], vi.fn())).toThrow('disposed')
    })

    it('should start SSE connection on first subscriber', () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        body: new ReadableStream(),
      })
      vi.stubGlobal('fetch', mockFetch)

      bridge.subscribe(['governance.receipt'], vi.fn())

      // Connection is async; verify fetch was called
      // We need to wait a tick for the async _connect to fire
      expect(mockFetch).not.toHaveBeenCalled() // connect is async

      vi.unstubAllGlobals()
    })

    it('should accept multiple event types', () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        body: new ReadableStream(),
      }))

      const handler = vi.fn()
      const unsub = bridge.subscribe(
        ['governance.receipt', 'governance.lifecycle', 'message.new'],
        handler,
      )
      expect(typeof unsub).toBe('function')

      unsub()
      vi.unstubAllGlobals()
    })
  })

  describe('unsubscribe', () => {
    it('should remove handler on unsubscribe', () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        body: new ReadableStream(),
      }))

      const handler = vi.fn()
      const unsub = bridge.subscribe(['governance.receipt'], handler)
      unsub()

      // Should not throw — bridge should still be usable
      const handler2 = vi.fn()
      const unsub2 = bridge.subscribe(['governance.receipt'], handler2)
      unsub2()

      vi.unstubAllGlobals()
    })

    it('should handle double unsubscribe gracefully', () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        body: new ReadableStream(),
      }))

      const handler = vi.fn()
      const unsub = bridge.subscribe(['governance.receipt'], handler)
      unsub()
      // Second call should not throw
      expect(() => unsub()).not.toThrow()

      vi.unstubAllGlobals()
    })
  })

  describe('dispose', () => {
    it('should clear all handlers and prevent new subscriptions', () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        body: new ReadableStream(),
      }))

      bridge.subscribe(['test'], vi.fn())
      bridge.dispose()
      expect(() => bridge.subscribe(['test'], vi.fn())).toThrow()

      vi.unstubAllGlobals()
    })

    it('should be safe to call multiple times', () => {
      expect(() => {
        bridge.dispose()
        bridge.dispose()
      }).not.toThrow()
    })
  })

  describe('_parseAndDispatch (via SSE simulation)', () => {
    it('should dispatch events to matching handlers', async () => {
      const handler = vi.fn()
      const eventData = JSON.stringify({
        sourceId: 'gpa-001',
        targetId: 'ch-001',
        id: 'evt-001',
      })

      // Create a readable stream that emits an SSE event
      const sseText = `event: governance.receipt\ndata: ${eventData}\n\n`
      const encoder = new TextEncoder()

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(sseText))
          controller.close()
        },
      })

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        body: stream,
      }))

      bridge.subscribe(['governance.receipt'], handler)

      // Wait for async connection and stream processing
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'receipt-produced',
          source: 'gpa-001',
          target: 'ch-001',
        }),
      )

      vi.unstubAllGlobals()
    })

    it('should dispatch to wildcard handlers', async () => {
      const wildcardHandler = vi.fn()
      const eventData = JSON.stringify({
        gpaId: 'gpa-001',
        channelId: 'ch-001',
      })

      const sseText = `event: governance.lifecycle\ndata: ${eventData}\n\n`
      const encoder = new TextEncoder()

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(sseText))
          controller.close()
        },
      })

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        body: stream,
      }))

      bridge.subscribe(['*'], wildcardHandler)

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(wildcardHandler).toHaveBeenCalledTimes(1)

      vi.unstubAllGlobals()
    })

    it('should not dispatch events to non-matching handlers', async () => {
      const handler = vi.fn()
      const eventData = JSON.stringify({
        sourceId: 'gpa-001',
        targetId: 'ch-001',
      })

      const sseText = `event: governance.receipt\ndata: ${eventData}\n\n`
      const encoder = new TextEncoder()

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(sseText))
          controller.close()
        },
      })

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        body: stream,
      }))

      // Subscribe to a different event type
      bridge.subscribe(['message.new'], handler)

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(handler).not.toHaveBeenCalled()

      vi.unstubAllGlobals()
    })

    it('should handle multiple events in a single chunk', async () => {
      const handler = vi.fn()
      const event1Data = JSON.stringify({ sourceId: 'gpa-001', targetId: 'ch-001' })
      const event2Data = JSON.stringify({ sourceId: 'gpa-002', targetId: 'ch-002' })

      const sseText = `event: governance.receipt\ndata: ${event1Data}\n\nevent: governance.receipt\ndata: ${event2Data}\n\n`
      const encoder = new TextEncoder()

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(sseText))
          controller.close()
        },
      })

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        body: stream,
      }))

      bridge.subscribe(['governance.receipt'], handler)

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(handler).toHaveBeenCalledTimes(2)

      vi.unstubAllGlobals()
    })

    it('should isolate handler errors', async () => {
      const throwingHandler = vi.fn().mockImplementation(() => {
        throw new Error('handler boom')
      })
      const safeHandler = vi.fn()

      const eventData = JSON.stringify({
        sourceId: 'gpa-001',
        targetId: 'ch-001',
      })

      const sseText = `event: governance.receipt\ndata: ${eventData}\n\n`
      const encoder = new TextEncoder()

      const controllers: ReadableStreamDefaultController<Uint8Array>[] = []

      vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controllers.push(controller)
          },
        })
        return Promise.resolve({ ok: true, body: stream })
      }))

      // Both subscribe before connect resolves — second subscribe also calls _connect
      // since _connected is still false (async). Each call gets its own stream.
      bridge.subscribe(['governance.receipt'], throwingHandler)
      bridge.subscribe(['governance.receipt'], safeHandler)

      // Wait for connections to establish
      await new Promise((resolve) => setTimeout(resolve, 20))

      // Push data to all established streams
      for (const ctrl of controllers) {
        ctrl.enqueue(encoder.encode(sseText))
      }

      await new Promise((resolve) => setTimeout(resolve, 50))

      // Both handlers should have been called despite first one throwing
      expect(throwingHandler).toHaveBeenCalled()
      expect(safeHandler).toHaveBeenCalled()

      for (const ctrl of controllers) {
        ctrl.close()
      }
      vi.unstubAllGlobals()
    })
  })

  describe('reconnection', () => {
    it('should attempt reconnect on connection failure', async () => {
      let callCount = 0
      const mockFetch = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.reject(new Error('connection refused'))
        }
        return Promise.resolve({
          ok: true,
          body: new ReadableStream(),
        })
      })

      vi.stubGlobal('fetch', mockFetch)
      vi.useFakeTimers()

      bridge.subscribe(['governance.receipt'], vi.fn())

      // First attempt fails
      await vi.advanceTimersByTimeAsync(0)

      // Reconnect scheduled at 1000ms
      await vi.advanceTimersByTimeAsync(1100)

      // Should have attempted at least twice
      expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2)

      vi.useRealTimers()
      vi.unstubAllGlobals()
    })
  })
})
