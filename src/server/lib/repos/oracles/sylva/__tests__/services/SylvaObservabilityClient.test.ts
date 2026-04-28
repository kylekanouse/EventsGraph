import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SylvaObservabilityClient } from '../../services/SylvaObservabilityClient'
import { SylvaConnectionManager } from '../../SylvaConnectionManager'

vi.mock('../../../../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

describe('SylvaObservabilityClient', () => {
  let mockConn: SylvaConnectionManager
  let client: SylvaObservabilityClient

  beforeEach(() => {
    mockConn = {
      fetch: vi.fn(),
    } as unknown as SylvaConnectionManager
    client = new SylvaObservabilityClient(mockConn)
  })

  describe('probeFeatures', () => {
    it('should detect available endpoints', async () => {
      vi.mocked(mockConn.fetch).mockImplementation((path: string, opts?: any) => {
        if (opts?.method === 'HEAD') {
          const available = [
            '/api/observability/executions/summary',
            '/api/observability/fleet/health',
          ]
          return Promise.resolve({ ok: available.includes(path) } as Response)
        }
        return Promise.resolve({ ok: false } as Response)
      })

      const features = await client.probeFeatures()
      expect(features.executionSummary).toBe(true)
      expect(features.fleetHealth).toBe(true)
      expect(features.complianceSummary).toBe(false)
      expect(features.violationSummary).toBe(false)
      expect(features.coherenceSummary).toBe(false)
    })

    it('should cache results after first probe', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({ ok: true } as Response)

      await client.probeFeatures()
      await client.probeFeatures()

      // HEAD requests should only happen once (5 endpoints)
      const headCalls = vi.mocked(mockConn.fetch).mock.calls.filter(
        ([, opts]) => (opts as any)?.method === 'HEAD',
      )
      expect(headCalls.length).toBe(5)
    })

    it('should deduplicate concurrent probes', async () => {
      let resolveCount = 0
      vi.mocked(mockConn.fetch).mockImplementation(() => {
        resolveCount++
        return Promise.resolve({ ok: true } as Response)
      })

      // Fire two probes concurrently
      const [features1, features2] = await Promise.all([
        client.probeFeatures(),
        client.probeFeatures(),
      ])

      expect(features1).toEqual(features2)
      // Only 5 HEAD requests (not 10)
      expect(resolveCount).toBe(5)
    })

    it('should handle network errors gracefully', async () => {
      vi.mocked(mockConn.fetch).mockRejectedValue(new Error('Network error'))

      const features = await client.probeFeatures()
      expect(features.executionSummary).toBe(false)
      expect(features.fleetHealth).toBe(false)
      expect(features.complianceSummary).toBe(false)
      expect(features.violationSummary).toBe(false)
      expect(features.coherenceSummary).toBe(false)
    })

    it('should mark non-ok responses as unavailable', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({ ok: false, status: 404 } as Response)

      const features = await client.probeFeatures()
      expect(features.executionSummary).toBe(false)
      expect(features.complianceSummary).toBe(false)
    })
  })

  describe('getFeatures', () => {
    it('should probe on first call', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({ ok: true } as Response)

      const features = await client.getFeatures()
      expect(features.executionSummary).toBe(true)
      expect(vi.mocked(mockConn.fetch)).toHaveBeenCalled()
    })

    it('should return cached features on subsequent calls', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({ ok: true } as Response)

      await client.getFeatures()
      vi.mocked(mockConn.fetch).mockClear()
      const features = await client.getFeatures()

      expect(features.executionSummary).toBe(true)
      // No new HEAD calls
      const headCalls = vi.mocked(mockConn.fetch).mock.calls.filter(
        ([, opts]) => (opts as any)?.method === 'HEAD',
      )
      expect(headCalls.length).toBe(0)
    })
  })

  describe('isAvailable', () => {
    it('should return true for available endpoints', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({ ok: true } as Response)
      expect(await client.isAvailable('executionSummary')).toBe(true)
    })

    it('should return false for unavailable endpoints', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({ ok: false } as Response)
      expect(await client.isAvailable('executionSummary')).toBe(false)
    })
  })

  describe('resetFeatures', () => {
    it('should clear cached features and re-probe', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({ ok: true } as Response)

      await client.probeFeatures()
      client.resetFeatures()
      await client.probeFeatures()

      // Should have 10 HEAD calls (5 per probe)
      const headCalls = vi.mocked(mockConn.fetch).mock.calls.filter(
        ([, opts]) => (opts as any)?.method === 'HEAD',
      )
      expect(headCalls.length).toBe(10)
    })
  })

  describe('getExecutionSummary', () => {
    it('should return null when endpoint unavailable', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({ ok: false } as Response)
      await client.probeFeatures()

      const result = await client.getExecutionSummary()
      expect(result).toBeNull()
    })

    it('should return data when endpoint available', async () => {
      const mockData = { timeRange: '24h', buckets: [], totals: {} }
      vi.mocked(mockConn.fetch).mockImplementation((path: string, opts?: any) => {
        if (opts?.method === 'HEAD') return Promise.resolve({ ok: true } as Response)
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        } as Response)
      })

      await client.probeFeatures()
      const result = await client.getExecutionSummary()
      expect(result).toEqual(mockData)
    })

    it('should pass query params to endpoint', async () => {
      vi.mocked(mockConn.fetch).mockImplementation((path: string, opts?: any) => {
        if (opts?.method === 'HEAD') return Promise.resolve({ ok: true } as Response)
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ timeRange: '7d', buckets: [], totals: {} }),
        } as Response)
      })

      await client.probeFeatures()
      await client.getExecutionSummary({ timeRange: '7d', bucketSize: 'day' })

      const getCalls = vi.mocked(mockConn.fetch).mock.calls.filter(
        ([path, opts]) => !(opts as any)?.method && path.includes('/api/observability/executions/summary'),
      )
      expect(getCalls.length).toBe(1)
      expect(getCalls[0][0]).toContain('timeRange=7d')
      expect(getCalls[0][0]).toContain('bucketSize=day')
    })

    it('should return null on fetch error', async () => {
      let callCount = 0
      vi.mocked(mockConn.fetch).mockImplementation((_path: string, opts?: any) => {
        if (opts?.method === 'HEAD') return Promise.resolve({ ok: true } as Response)
        callCount++
        return Promise.reject(new Error('Connection refused'))
      })

      await client.probeFeatures()
      const result = await client.getExecutionSummary()
      expect(result).toBeNull()
      expect(callCount).toBe(1)
    })

    it('should return null on non-ok GET response', async () => {
      vi.mocked(mockConn.fetch).mockImplementation((_path: string, opts?: any) => {
        if (opts?.method === 'HEAD') return Promise.resolve({ ok: true } as Response)
        return Promise.resolve({ ok: false, status: 500 } as Response)
      })

      await client.probeFeatures()
      const result = await client.getExecutionSummary()
      expect(result).toBeNull()
    })
  })

  describe('getComplianceSummary', () => {
    it('should return null when endpoint unavailable', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({ ok: false } as Response)
      await client.probeFeatures()

      const result = await client.getComplianceSummary()
      expect(result).toBeNull()
    })

    it('should return data when endpoint available', async () => {
      const mockData = { channels: [], summary: {} }
      vi.mocked(mockConn.fetch).mockImplementation((_path: string, opts?: any) => {
        if (opts?.method === 'HEAD') return Promise.resolve({ ok: true } as Response)
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        } as Response)
      })

      await client.probeFeatures()
      const result = await client.getComplianceSummary()
      expect(result).toEqual(mockData)
    })
  })

  describe('getFleetHealth', () => {
    it('should return null when endpoint unavailable', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({ ok: false } as Response)
      await client.probeFeatures()

      const result = await client.getFleetHealth()
      expect(result).toBeNull()
    })

    it('should return data when endpoint available', async () => {
      const mockData = { gpas: [], summary: {} }
      vi.mocked(mockConn.fetch).mockImplementation((_path: string, opts?: any) => {
        if (opts?.method === 'HEAD') return Promise.resolve({ ok: true } as Response)
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        } as Response)
      })

      await client.probeFeatures()
      const result = await client.getFleetHealth()
      expect(result).toEqual(mockData)
    })
  })

  describe('getViolationSummary', () => {
    it('should return null when endpoint unavailable', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({ ok: false } as Response)
      await client.probeFeatures()

      const result = await client.getViolationSummary()
      expect(result).toBeNull()
    })

    it('should return data when endpoint available', async () => {
      const mockData = { violations: [], summary: {} }
      vi.mocked(mockConn.fetch).mockImplementation((_path: string, opts?: any) => {
        if (opts?.method === 'HEAD') return Promise.resolve({ ok: true } as Response)
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        } as Response)
      })

      await client.probeFeatures()
      const result = await client.getViolationSummary()
      expect(result).toEqual(mockData)
    })
  })

  describe('getCoherenceSummary', () => {
    it('should return null when endpoint unavailable', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({ ok: false } as Response)
      await client.probeFeatures()

      const result = await client.getCoherenceSummary()
      expect(result).toBeNull()
    })

    it('should return data when endpoint available', async () => {
      const mockData = { entities: [], distribution: [], summary: {} }
      vi.mocked(mockConn.fetch).mockImplementation((_path: string, opts?: any) => {
        if (opts?.method === 'HEAD') return Promise.resolve({ ok: true } as Response)
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        } as Response)
      })

      await client.probeFeatures()
      const result = await client.getCoherenceSummary()
      expect(result).toEqual(mockData)
    })
  })
})
