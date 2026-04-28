import { logger } from '../../../logger'
import type { SylvaAuthResponse } from './types'

const _warnedLegacyKeys = new Set<string>()

/**
 * readSylvaEnv
 *
 * Reads `SYLVA_<name>` from the environment, falling back to the
 * legacy `TRELLIS_<name>` key when unset. Emits a one-time
 * deprecation warning per legacy key per process.
 */
function readSylvaEnv(name: string): string | undefined {
  const sylvaKey = `SYLVA_${name}`
  const legacyKey = `TRELLIS_${name}`
  const sylvaVal = process.env[sylvaKey]
  if (sylvaVal !== undefined) return sylvaVal
  const legacyVal = process.env[legacyKey]
  if (legacyVal !== undefined) {
    if (!_warnedLegacyKeys.has(legacyKey)) {
      _warnedLegacyKeys.add(legacyKey)
      logger.warn(`SYLVA: ${legacyKey} is deprecated, use ${sylvaKey}`)
    }
    return legacyVal
  }
  return undefined
}

export class SylvaConnectionManager {
  private _baseUrl: string
  private _did: string
  private _workspaceId: string
  private _token: string | null = null
  private _tokenExpiry: Date | null = null
  private _disposed = false
  private _refreshTimer: ReturnType<typeof setTimeout> | null = null

  constructor() {
    this._baseUrl = readSylvaEnv('BASE_URL') || 'http://localhost:3100'
    this._did = readSylvaEnv('DID') || ''
    this._workspaceId = readSylvaEnv('WORKSPACE_ID') || 'default'
  }

  get baseUrl(): string {
    return this._baseUrl
  }

  /**
   * authenticate
   *
   * Acquires a JWT token from the Sylva auth endpoint.
   * Schedules automatic refresh before expiry.
   */
  async authenticate(): Promise<void> {
    const res = await fetch(`${this._baseUrl}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        did: this._did,
        workspaceId: this._workspaceId,
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Sylva auth failed: ${res.status} ${body}`)
    }

    const data: SylvaAuthResponse = await res.json() as SylvaAuthResponse
    this._token = data.token
    this._tokenExpiry = new Date(data.expiresAt)

    this._scheduleRefresh()

    logger.info('Sylva: authenticated successfully')
  }

  /**
   * fetch
   *
   * Authenticated fetch wrapper. Automatically re-authenticates
   * if token is missing or within 60 seconds of expiry.
   * Retries once on 401.
   */
  async fetch(path: string, options: RequestInit = {}): Promise<Response> {
    await this._ensureAuthenticated()

    const res = await fetch(`${this._baseUrl}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this._token}`,
        'Content-Type': 'application/json',
      },
    })

    // Retry once on 401 (token may have been revoked)
    if (res.status === 401) {
      logger.warn('Sylva: received 401, re-authenticating')
      await this.authenticate()
      return fetch(`${this._baseUrl}${path}`, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${this._token}`,
          'Content-Type': 'application/json',
        },
      })
    }

    return res
  }

  /**
   * isConnected
   *
   * Checks if the Sylva instance is reachable.
   */
  async isConnected(): Promise<boolean> {
    try {
      const res = await fetch(`${this._baseUrl}/health`)
      return res.ok
    } catch {
      return false
    }
  }

  /**
   * getToken
   *
   * Returns the current JWT token (for SSE connections in Phase 2).
   */
  async getToken(): Promise<string> {
    await this._ensureAuthenticated()
    return this._token!
  }

  /**
   * dispose
   *
   * Tears down the connection manager.
   */
  dispose(): void {
    this._disposed = true
    this._token = null
    this._tokenExpiry = null
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer)
      this._refreshTimer = null
    }
  }

  // --- Private ---

  private async _ensureAuthenticated(): Promise<void> {
    const needsAuth =
      !this._token ||
      !this._tokenExpiry ||
      this._tokenExpiry.getTime() - Date.now() < 60_000

    if (needsAuth) {
      await this.authenticate()
    }
  }

  private _scheduleRefresh(): void {
    if (this._disposed || !this._tokenExpiry) return

    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer)
    }

    // Refresh 5 minutes before expiry
    const msUntilExpiry = this._tokenExpiry.getTime() - Date.now()
    const refreshIn = Math.max(msUntilExpiry - 300_000, 0)

    this._refreshTimer = setTimeout(async () => {
      if (!this._disposed) {
        try {
          await this.authenticate()
        } catch (err) {
          logger.error({ err }, 'Sylva: token refresh failed')
        }
      }
    }, refreshIn)
  }
}
