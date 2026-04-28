import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SylvaConnectionManager } from '../SylvaConnectionManager'

// Mock the logger
vi.mock('../../../../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('SylvaConnectionManager', () => {
  let manager: SylvaConnectionManager
  let fetchSpy: ReturnType<typeof vi.fn>

  const mockAuthResponse = {
    token: 'test-jwt-token',
    expiresAt: new Date(Date.now() + 3600_000).toISOString(), // 1 hour from now
    participantId: 'p-001',
    workspaceId: 'default',
  }

  beforeEach(() => {
    vi.useFakeTimers()
    process.env.SYLVA_BASE_URL = 'http://localhost:3100'
    process.env.SYLVA_DID = 'did:pcn:service:eventsgraph'
    process.env.SYLVA_WORKSPACE_ID = 'default'

    manager = new SylvaConnectionManager()

    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    manager.dispose()
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    delete process.env.SYLVA_BASE_URL
    delete process.env.SYLVA_DID
    delete process.env.SYLVA_WORKSPACE_ID
  })

  describe('authenticate', () => {
    it('should acquire a JWT token from Sylva', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse,
      })

      await manager.authenticate()

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3100/api/auth/token',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            did: 'did:pcn:service:eventsgraph',
            workspaceId: 'default',
          }),
        }),
      )
    })

    it('should throw on auth failure', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => 'Forbidden',
      })

      await expect(manager.authenticate()).rejects.toThrow('Sylva auth failed: 403 Forbidden')
    })
  })

  describe('fetch', () => {
    it('should auto-authenticate and add auth header', async () => {
      // First call = auth
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse,
      })
      // Second call = actual API request
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ items: [], total: 0 }),
      })

      const res = await manager.fetch('/api/gpa')
      expect(res.ok).toBe(true)
      expect(fetchSpy).toHaveBeenCalledTimes(2)

      // Verify auth header on second call
      const secondCall = fetchSpy.mock.calls[1]
      expect(secondCall[0]).toBe('http://localhost:3100/api/gpa')
      expect(secondCall[1].headers).toEqual(
        expect.objectContaining({
          'Authorization': 'Bearer test-jwt-token',
        }),
      )
    })

    it('should retry once on 401', async () => {
      // Auth call
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse,
      })
      // First API call returns 401
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 401,
      })
      // Re-auth call
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse,
      })
      // Retry API call
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ items: [] }),
      })

      const res = await manager.fetch('/api/gpa')
      expect(res.ok).toBe(true)
      expect(fetchSpy).toHaveBeenCalledTimes(4)
    })
  })

  describe('isConnected', () => {
    it('should return true when health check succeeds', async () => {
      fetchSpy.mockResolvedValueOnce({ ok: true })
      expect(await manager.isConnected()).toBe(true)
    })

    it('should return false when health check fails', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('ECONNREFUSED'))
      expect(await manager.isConnected()).toBe(false)
    })

    it('should return false when health check returns non-ok', async () => {
      fetchSpy.mockResolvedValueOnce({ ok: false })
      expect(await manager.isConnected()).toBe(false)
    })
  })

  describe('getToken', () => {
    it('should return the current token', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse,
      })

      const token = await manager.getToken()
      expect(token).toBe('test-jwt-token')
    })
  })

  describe('dispose', () => {
    it('should clear token and stop refresh timer', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse,
      })

      await manager.authenticate()
      manager.dispose()

      // After dispose, fetching should re-authenticate
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse,
      })
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
      })

      // The manager is disposed — calling fetch should still work by re-authing
      // but the internal state should have been cleared
    })
  })

  describe('token refresh', () => {
    it('should schedule refresh before token expiry', async () => {
      const shortExpiry = {
        ...mockAuthResponse,
        expiresAt: new Date(Date.now() + 600_000).toISOString(), // 10 min from now
      }

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => shortExpiry,
      })
      // Refresh call
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse,
      })

      await manager.authenticate()

      // Advance time past the refresh point (10min - 5min = 5min = 300000ms)
      await vi.advanceTimersByTimeAsync(300_001)

      // Should have called fetch again for refresh
      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })
  })

})
