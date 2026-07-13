import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SylvaAnalyticsService } from '../../services/SylvaAnalyticsService'
import { SylvaConnectionManager } from '../../SylvaConnectionManager'
import { SylvaObservabilityClient } from '../../services/SylvaObservabilityClient'

vi.mock('../../../../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

/**
 * Creates a mock observability client that returns null for all endpoints
 * (simulates no observability support — forces fallback path).
 */
function createNoOpObservability(): SylvaObservabilityClient {
  return {
    probeFeatures: vi.fn().mockResolvedValue({
      executionSummary: false,
      complianceSummary: false,
      fleetHealth: false,
      violationSummary: false,
      coherenceSummary: false,
    }),
    getFeatures: vi.fn().mockResolvedValue({
      executionSummary: false,
      complianceSummary: false,
      fleetHealth: false,
      violationSummary: false,
      coherenceSummary: false,
    }),
    isAvailable: vi.fn().mockResolvedValue(false),
    resetFeatures: vi.fn(),
    getExecutionSummary: vi.fn().mockResolvedValue(null),
    getComplianceSummary: vi.fn().mockResolvedValue(null),
    getFleetHealth: vi.fn().mockResolvedValue(null),
    getViolationSummary: vi.fn().mockResolvedValue(null),
    getCoherenceSummary: vi.fn().mockResolvedValue(null),
  } as unknown as SylvaObservabilityClient
}

describe('SylvaAnalyticsService', () => {
  let mockConn: SylvaConnectionManager
  let mockObs: SylvaObservabilityClient
  let service: SylvaAnalyticsService

  beforeEach(() => {
    mockConn = {
      fetch: vi.fn(),
    } as unknown as SylvaConnectionManager
    mockObs = createNoOpObservability()
    service = new SylvaAnalyticsService(mockConn, mockObs)
  })

  describe('computeExecutionTrends', () => {
    it('should produce time-bucket nodes with sequential links', async () => {
      vi.mocked(mockConn.fetch).mockImplementation((path: string) => {
        if (path === '/api/gpa') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ items: [{ id: 'gpa-1', name: 'Test' }] }),
          } as Response)
        }
        if (path.includes('/executions')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              items: [
                {
                  id: 'exec-1',
                  gpaId: 'gpa-1',
                  status: 'completed',
                  startedAt: '2025-06-01T10:00:00Z',
                  completedAt: '2025-06-01T10:01:00Z',
                  consequence: 'PASS',
                  steps: [],
                },
                {
                  id: 'exec-2',
                  gpaId: 'gpa-1',
                  status: 'completed',
                  startedAt: '2025-06-01T11:00:00Z',
                  completedAt: '2025-06-01T11:02:00Z',
                  consequence: 'FAIL',
                  steps: [],
                },
              ],
            }),
          } as Response)
        }
        return Promise.resolve({ ok: false, status: 404 } as Response)
      })

      const result = await service.computeExecutionTrends({ timeRange: '24h', bucketSize: 'hour' })
      expect(result.nodes.length).toBeGreaterThan(0)
      expect(result.nodes[0].type).toBe('time-bucket')
      // Two executions in different hours = 2 bucket nodes and 1 link
      expect(result.nodes).toHaveLength(2)
      expect(result.links).toHaveLength(1)
      expect(result.links[0].type).toBe('timeline')
    })

    it('should return empty graph when no GPAs exist', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      } as Response)

      const result = await service.computeExecutionTrends({ timeRange: '24h' })
      expect(result.nodes).toHaveLength(0)
      expect(result.links).toHaveLength(0)
    })

    it('should use cache on second call within TTL', async () => {
      vi.mocked(mockConn.fetch).mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ items: [] }),
        } as Response),
      )

      await service.computeExecutionTrends({ timeRange: '24h' })
      await service.computeExecutionTrends({ timeRange: '24h' })

      // fetch should only be called once for GPA list (cached after first call)
      const gpaCalls = vi.mocked(mockConn.fetch).mock.calls.filter(
        ([path]) => path === '/api/gpa',
      )
      expect(gpaCalls.length).toBe(1)
    })

    it('should throw when GPA fetch fails', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response)

      await expect(service.computeExecutionTrends({})).rejects.toThrow('GPA fetch failed: 500')
    })

    it('should color time buckets by pass rate', async () => {
      vi.mocked(mockConn.fetch).mockImplementation((path: string) => {
        if (path === '/api/gpa') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ items: [{ id: 'gpa-1', name: 'Test' }] }),
          } as Response)
        }
        if (path.includes('/executions')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              items: [
                {
                  id: 'exec-1',
                  gpaId: 'gpa-1',
                  status: 'completed',
                  startedAt: '2025-06-01T10:00:00Z',
                  completedAt: '2025-06-01T10:01:00Z',
                  consequence: 'PASS',
                  steps: [],
                },
              ],
            }),
          } as Response)
        }
        return Promise.resolve({ ok: false, status: 404 } as Response)
      })

      const result = await service.computeExecutionTrends({ timeRange: '24h', bucketSize: 'hour' })
      // 100% pass rate = green
      expect(result.nodes[0].color).toBe('#00FF00')
    })
  })

  describe('computeComplianceCoverage', () => {
    it('should produce channel nodes with compliance grouping', async () => {
      vi.mocked(mockConn.fetch).mockImplementation((path: string) => {
        if (path === '/api/channels') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              items: [
                { id: 'ch-1', name: 'Channel A' },
                { id: 'ch-2', name: 'Channel B' },
              ],
            }),
          } as Response)
        }
        if (path.includes('/api/governance/receipts')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              items: [
                { id: 'r1', channelId: 'ch-1', consequence: 'PASS', gpaId: 'g1', receiptType: 'execution', governanceTier: 'standard', timestamp: '2025-01-01T00:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
                { id: 'r2', channelId: 'ch-1', consequence: 'PASS', gpaId: 'g1', receiptType: 'execution', governanceTier: 'standard', timestamp: '2025-01-01T00:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
                { id: 'r3', channelId: 'ch-2', consequence: 'FAIL', gpaId: 'g1', receiptType: 'execution', governanceTier: 'standard', timestamp: '2025-01-01T00:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
              ],
            }),
          } as Response)
        }
        return Promise.resolve({ ok: false, status: 404 } as Response)
      })

      const result = await service.computeComplianceCoverage()
      expect(result.nodes).toHaveLength(2)
      expect(result.nodes[0].type).toBe('compliance-channel')

      // ch-1 has 100% pass rate, ch-2 has 0% - different groups, no link
      const ch1Node = result.nodes.find((n) => n.id === 'ch-1')!
      const ch2Node = result.nodes.find((n) => n.id === 'ch-2')!
      expect(ch1Node.group).toBe(1) // >90% pass
      expect(ch2Node.group).toBe(3) // <70% pass
    })

    it('should throw when channels fetch fails', async () => {
      vi.mocked(mockConn.fetch).mockImplementation((path: string) => {
        if (path === '/api/channels') {
          return Promise.resolve({ ok: false, status: 500 } as Response)
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ items: [] }),
        } as Response)
      })

      await expect(service.computeComplianceCoverage()).rejects.toThrow('Channels fetch failed: 500')
    })

    it('should cache compliance results', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      } as Response)

      await service.computeComplianceCoverage()
      await service.computeComplianceCoverage()

      const channelCalls = vi.mocked(mockConn.fetch).mock.calls.filter(
        ([path]) => path === '/api/channels',
      )
      expect(channelCalls.length).toBe(1)
    })
  })

  describe('computeFleetHealth', () => {
    it('should produce GPA health nodes with cluster links', async () => {
      vi.mocked(mockConn.fetch).mockImplementation((path: string) => {
        if (path === '/api/gpa') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              items: [
                {
                  id: 'gpa-1', name: 'Agent A', status: 'running',
                  executionBudgetTotal: 100, executionBudgetUsed: 10,
                  workspaceId: 'ws-1', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
                },
                {
                  id: 'gpa-2', name: 'Agent B', status: 'stopped',
                  executionBudgetTotal: 100, executionBudgetUsed: 95,
                  workspaceId: 'ws-1', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
                },
              ],
            }),
          } as Response)
        }
        if (path === '/api/governance/coherence') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              items: [
                { entityId: 'gpa-1', entityType: 'gpa', entityName: 'Agent A', coherenceScore: 0.9, trajectory: 'stable', measurementCount: 10, lastMeasuredAt: '2025-01-01T00:00:00Z' },
              ],
            }),
          } as Response)
        }
        return Promise.resolve({ ok: false, status: 404 } as Response)
      })

      const result = await service.computeFleetHealth()
      expect(result.nodes).toHaveLength(2)
      expect(result.nodes[0].type).toBe('fleet-gpa')

      // Agent A: running, 90% budget, 0.9 coherence → high health
      const agentA = result.nodes.find((n) => n.id === 'gpa-1')!
      expect(agentA.group).toBe(1) // healthy

      // Agent B: stopped, 5% budget, 0.5 default coherence → low health
      const agentB = result.nodes.find((n) => n.id === 'gpa-2')!
      expect(agentB.group).toBeGreaterThan(agentA.group)
    })

    it('should handle coherence endpoint failure gracefully', async () => {
      vi.mocked(mockConn.fetch).mockImplementation((path: string) => {
        if (path === '/api/gpa') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              items: [{
                id: 'gpa-1', name: 'Agent', status: 'running',
                executionBudgetTotal: 100, executionBudgetUsed: 0,
                workspaceId: 'ws-1', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
              }],
            }),
          } as Response)
        }
        // Coherence endpoint fails
        return Promise.resolve({ ok: false, status: 503 } as Response)
      })

      const result = await service.computeFleetHealth()
      expect(result.nodes).toHaveLength(1)
      // Should still compute with fallback coherence of 0.5
      expect(result.nodes[0].desc).toContain('Coherence: 50%')
    })
  })

  describe('computeViolationNetwork', () => {
    it('should create bipartite GPA-channel graph from FAIL receipts', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          items: [
            { id: 'r1', gpaId: 'gpa-1', channelId: 'ch-1', consequence: 'FAIL', receiptType: 'verification', governanceTier: 'standard', timestamp: '2025-01-01T00:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
            { id: 'r2', gpaId: 'gpa-1', channelId: 'ch-2', consequence: 'FAIL', receiptType: 'verification', governanceTier: 'standard', timestamp: '2025-01-01T00:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
            { id: 'r3', gpaId: 'gpa-2', channelId: 'ch-1', consequence: 'FAIL', receiptType: 'verification', governanceTier: 'standard', timestamp: '2025-01-01T00:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
          ],
        }),
      } as Response)

      const result = await service.computeViolationNetwork()
      // 2 GPA nodes + 2 channel nodes = 4
      expect(result.nodes.length).toBe(4)
      // 3 unique GPA→Channel pairs
      expect(result.links.length).toBe(3)

      const gpaNodes = result.nodes.filter((n) => n.type === 'violator-gpa')
      const channelNodes = result.nodes.filter((n) => n.type === 'violated-channel')
      expect(gpaNodes).toHaveLength(2)
      expect(channelNodes).toHaveLength(2)
    })

    it('should return empty graph when no violations exist', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      } as Response)

      const result = await service.computeViolationNetwork()
      expect(result.nodes).toHaveLength(0)
      expect(result.links).toHaveLength(0)
    })

    it('should aggregate multiple violations for the same GPA-channel pair', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          items: [
            { id: 'r1', gpaId: 'gpa-1', channelId: 'ch-1', consequence: 'FAIL', receiptType: 'verification', governanceTier: 'standard', timestamp: '2025-01-01T00:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
            { id: 'r2', gpaId: 'gpa-1', channelId: 'ch-1', consequence: 'FAIL', receiptType: 'verification', governanceTier: 'standard', timestamp: '2025-01-01T01:00:00Z', createdAt: '2025-01-01T01:00:00Z' },
          ],
        }),
      } as Response)

      const result = await service.computeViolationNetwork()
      expect(result.nodes).toHaveLength(2) // 1 GPA + 1 channel
      expect(result.links).toHaveLength(1) // 1 aggregated link
      expect(result.links[0].label).toBe('2 violations')
    })

    it('should cache violation network results', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      } as Response)

      await service.computeViolationNetwork()
      await service.computeViolationNetwork()

      expect(vi.mocked(mockConn.fetch)).toHaveBeenCalledTimes(1)
    })
  })

  describe('computeCoherenceHeatmap', () => {
    it('should bucket entities by coherence score', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          items: [
            { entityId: 'e1', entityType: 'gpa', entityName: 'Agent A', coherenceScore: 0.95, trajectory: 'stable', measurementCount: 5, lastMeasuredAt: '2025-01-01T00:00:00Z' },
            { entityId: 'e2', entityType: 'channel', entityName: 'Channel B', coherenceScore: 0.3, trajectory: 'declining', measurementCount: 3, lastMeasuredAt: '2025-01-01T00:00:00Z' },
            { entityId: 'e3', entityType: 'gpa', entityName: 'Agent C', coherenceScore: 0.55, trajectory: 'improving', measurementCount: 8, lastMeasuredAt: '2025-01-01T00:00:00Z' },
          ],
        }),
      } as Response)

      const result = await service.computeCoherenceHeatmap()

      // 5 bucket root nodes + 3 entity nodes = 8
      expect(result.nodes).toHaveLength(8)

      // Bucket nodes
      const bucketNodes = result.nodes.filter((n) => n.type === 'coherence-bucket')
      expect(bucketNodes).toHaveLength(5)

      // Entity nodes
      const entityNodes = result.nodes.filter((n) => n.type.startsWith('heatmap-'))
      expect(entityNodes).toHaveLength(3)

      // 3 entity→bucket links + 4 bucket-sequence links = 7
      const memberLinks = result.links.filter((l) => l.type === 'bucket-member')
      const seqLinks = result.links.filter((l) => l.type === 'bucket-sequence')
      expect(memberLinks).toHaveLength(3)
      expect(seqLinks).toHaveLength(4)
    })

    it('should produce empty heatmap with only bucket nodes when no data', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      } as Response)

      const result = await service.computeCoherenceHeatmap()
      // 5 bucket root nodes, 0 entities
      expect(result.nodes).toHaveLength(5)
      expect(result.nodes.every((n) => n.type === 'coherence-bucket')).toBe(true)
    })

    it('should throw when coherence fetch fails', async () => {
      vi.mocked(mockConn.fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response)

      await expect(service.computeCoherenceHeatmap()).rejects.toThrow('Coherence fetch failed: 500')
    })
  })
})
