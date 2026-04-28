import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SylvaAnalyticsService } from '../../services/SylvaAnalyticsService'
import { SylvaObservabilityClient } from '../../services/SylvaObservabilityClient'
import { SylvaConnectionManager } from '../../SylvaConnectionManager'
import type {
  ObservabilityExecutionSummary,
  ObservabilityComplianceSummary,
  ObservabilityFleetHealth,
  ObservabilityViolationSummary,
  ObservabilityCoherenceSummary,
} from '../../types'

vi.mock('../../../../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

describe('SylvaAnalyticsService — Observability Integration', () => {
  let mockConn: SylvaConnectionManager
  let mockObs: SylvaObservabilityClient
  let service: SylvaAnalyticsService

  beforeEach(() => {
    mockConn = {
      fetch: vi.fn(),
    } as unknown as SylvaConnectionManager
    mockObs = {
      probeFeatures: vi.fn(),
      getFeatures: vi.fn(),
      isAvailable: vi.fn(),
      resetFeatures: vi.fn(),
      getExecutionSummary: vi.fn().mockResolvedValue(null),
      getComplianceSummary: vi.fn().mockResolvedValue(null),
      getFleetHealth: vi.fn().mockResolvedValue(null),
      getViolationSummary: vi.fn().mockResolvedValue(null),
      getCoherenceSummary: vi.fn().mockResolvedValue(null),
    } as unknown as SylvaObservabilityClient
    service = new SylvaAnalyticsService(mockConn, mockObs)
  })

  describe('with observability endpoints available', () => {
    it('computeExecutionTrends should use observability data with P95', async () => {
      const obsData: ObservabilityExecutionSummary = {
        timeRange: '24h',
        bucketSize: 'hour',
        buckets: [
          {
            timestamp: '2025-06-01T10:00:00Z',
            executionCount: 20,
            passCount: 18,
            failCount: 2,
            avgDurationMs: 150,
            p95DurationMs: 400,
          },
          {
            timestamp: '2025-06-01T11:00:00Z',
            executionCount: 15,
            passCount: 10,
            failCount: 5,
            avgDurationMs: 200,
            p95DurationMs: 550,
          },
        ],
        totals: {
          totalExecutions: 35,
          totalPasses: 28,
          totalFails: 7,
          overallPassRate: 0.8,
          avgDurationMs: 175,
        },
      }
      vi.mocked(mockObs.getExecutionSummary).mockResolvedValue(obsData)

      const result = await service.computeExecutionTrends({ timeRange: '24h', bucketSize: 'hour' })

      expect(result.nodes).toHaveLength(2)
      expect(result.links).toHaveLength(1)
      expect(result.nodes[0].type).toBe('time-bucket')
      expect(result.nodes[0].desc).toContain('P95 duration')
      expect(result.nodes[0].desc).toContain('400ms')
      expect(result.links[0].type).toBe('timeline')
      // Should NOT have called the fallback (no conn.fetch for /api/gpa)
      expect(mockConn.fetch).not.toHaveBeenCalled()
    })

    it('computeComplianceCoverage should use observability data with coverage grades', async () => {
      const obsData: ObservabilityComplianceSummary = {
        channels: [
          {
            channelId: 'ch-1',
            channelName: 'Alpha',
            governanceTier: 'standard',
            totalReceipts: 100,
            passCount: 95,
            failCount: 3,
            warnCount: 2,
            passRate: 0.95,
            lastReceiptAt: '2025-06-01T12:00:00Z',
            coverageGrade: 'A',
          },
          {
            channelId: 'ch-2',
            channelName: 'Beta',
            governanceTier: 'basic',
            totalReceipts: 50,
            passCount: 25,
            failCount: 20,
            warnCount: 5,
            passRate: 0.5,
            lastReceiptAt: '2025-06-01T11:00:00Z',
            coverageGrade: 'D',
          },
        ],
        summary: {
          overallPassRate: 0.73,
          totalChannels: 2,
          compliantChannels: 1,
          atRiskChannels: 1,
        },
      }
      vi.mocked(mockObs.getComplianceSummary).mockResolvedValue(obsData)

      const result = await service.computeComplianceCoverage()

      expect(result.nodes).toHaveLength(2)
      expect(result.nodes[0].type).toBe('compliance-channel')
      expect(result.nodes[0].label).toContain('(A)')
      expect(result.nodes[0].desc).toContain('Grade: A')
      expect(result.nodes[1].label).toContain('(D)')
      expect(mockConn.fetch).not.toHaveBeenCalled()
    })

    it('computeFleetHealth should use observability data with health grades', async () => {
      const obsData: ObservabilityFleetHealth = {
        gpas: [
          {
            gpaId: 'gpa-1',
            gpaName: 'Agent A',
            status: 'running',
            healthScore: 0.92,
            budgetUtilization: 0.15,
            coherenceScore: 0.88,
            recentPassRate: 0.95,
            lastExecutionAt: '2025-06-01T12:00:00Z',
            healthGrade: 'healthy',
          },
          {
            gpaId: 'gpa-2',
            gpaName: 'Agent B',
            status: 'paused',
            healthScore: 0.35,
            budgetUtilization: 0.9,
            coherenceScore: 0.3,
            recentPassRate: 0.4,
            lastExecutionAt: '2025-06-01T10:00:00Z',
            healthGrade: 'critical',
          },
        ],
        summary: {
          totalGpas: 2,
          healthyCount: 1,
          warningCount: 0,
          criticalCount: 1,
          offlineCount: 0,
          averageHealthScore: 0.635,
        },
      }
      vi.mocked(mockObs.getFleetHealth).mockResolvedValue(obsData)

      const result = await service.computeFleetHealth()

      expect(result.nodes).toHaveLength(2)
      expect(result.nodes[0].type).toBe('fleet-gpa')
      expect(result.nodes[0].desc).toContain('healthy')
      expect(result.nodes[0].desc).toContain('Recent pass rate')
      expect(result.nodes[1].desc).toContain('critical')
      expect(mockConn.fetch).not.toHaveBeenCalled()
    })

    it('computeViolationNetwork should use observability data with named entities', async () => {
      const obsData: ObservabilityViolationSummary = {
        violations: [
          {
            gpaId: 'gpa-1',
            gpaName: 'Rogue Agent',
            channelId: 'ch-1',
            channelName: 'Secure Channel',
            violationCount: 5,
            lastViolationAt: '2025-06-01T12:00:00Z',
            violationType: 'guard-denial',
          },
        ],
        summary: {
          totalViolations: 5,
          uniqueGpas: 1,
          uniqueChannels: 1,
          mostViolatedChannel: 'Secure Channel',
          topViolator: 'Rogue Agent',
        },
      }
      vi.mocked(mockObs.getViolationSummary).mockResolvedValue(obsData)

      const result = await service.computeViolationNetwork()

      expect(result.nodes).toHaveLength(2)
      const gpaNode = result.nodes.find((n) => n.type === 'violator-gpa')!
      const chNode = result.nodes.find((n) => n.type === 'violated-channel')!
      expect(gpaNode.label).toBe('Rogue Agent')
      expect(chNode.label).toBe('Secure Channel')
      expect(result.links).toHaveLength(1)
      expect(result.links[0].label).toBe('5 violations')
      expect(mockConn.fetch).not.toHaveBeenCalled()
    })

    it('computeCoherenceHeatmap should use observability data with distribution buckets', async () => {
      const obsData: ObservabilityCoherenceSummary = {
        entities: [
          {
            entityId: 'e1',
            entityName: 'Agent A',
            entityType: 'gpa',
            coherenceScore: 0.85,
            trajectory: 'improving',
            measurementCount: 10,
            lastMeasuredAt: '2025-06-01T12:00:00Z',
          },
        ],
        distribution: [
          { bucketLabel: '80-100%', min: 0.8, max: 1.0, count: 1 },
        ],
        summary: {
          averageCoherence: 0.85,
          medianCoherence: 0.85,
          improvingCount: 1,
          decliningCount: 0,
          stableCount: 0,
        },
      }
      vi.mocked(mockObs.getCoherenceSummary).mockResolvedValue(obsData)

      const result = await service.computeCoherenceHeatmap()

      const bucketNodes = result.nodes.filter((n) => n.type === 'coherence-bucket')
      const entityNodes = result.nodes.filter((n) => n.type.startsWith('heatmap-'))
      expect(bucketNodes).toHaveLength(1)
      expect(entityNodes).toHaveLength(1)
      expect(entityNodes[0].desc).toContain('Trajectory: improving')
      expect(mockConn.fetch).not.toHaveBeenCalled()
    })
  })

  describe('without observability endpoints (fallback)', () => {
    it('computeExecutionTrends should fall back to REST aggregation', async () => {
      // Observability returns null
      vi.mocked(mockObs.getExecutionSummary).mockResolvedValue(null)

      // Set up REST fallback mocks
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
              items: [{
                id: 'exec-1', gpaId: 'gpa-1', status: 'completed',
                startedAt: '2025-06-01T10:00:00Z', completedAt: '2025-06-01T10:01:00Z',
                consequence: 'PASS', steps: [],
              }],
            }),
          } as Response)
        }
        return Promise.resolve({ ok: false, status: 404 } as Response)
      })

      const result = await service.computeExecutionTrends({ timeRange: '24h' })

      expect(result.nodes.length).toBeGreaterThan(0)
      expect(result.nodes[0].type).toBe('time-bucket')
      // Fallback does NOT have P95
      expect(result.nodes[0].desc).not.toContain('P95')
      // Should have used conn.fetch
      expect(mockConn.fetch).toHaveBeenCalled()
    })

    it('computeComplianceCoverage should fall back to REST aggregation', async () => {
      vi.mocked(mockObs.getComplianceSummary).mockResolvedValue(null)

      vi.mocked(mockConn.fetch).mockImplementation((path: string) => {
        if (path === '/api/channels') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              items: [{ id: 'ch-1', name: 'Channel A' }],
            }),
          } as Response)
        }
        if (path.includes('/api/governance/receipts')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              items: [
                { id: 'r1', channelId: 'ch-1', consequence: 'PASS', gpaId: 'g1', receiptType: 'execution', governanceTier: 'standard', timestamp: '2025-01-01T00:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
              ],
            }),
          } as Response)
        }
        return Promise.resolve({ ok: false, status: 404 } as Response)
      })

      const result = await service.computeComplianceCoverage()

      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0].type).toBe('compliance-channel')
      // Fallback does not show grade letters
      expect(result.nodes[0].label).not.toMatch(/\([A-F]\)/)
      expect(mockConn.fetch).toHaveBeenCalled()
    })

    it('computeFleetHealth should fall back to REST aggregation', async () => {
      vi.mocked(mockObs.getFleetHealth).mockResolvedValue(null)

      vi.mocked(mockConn.fetch).mockImplementation((path: string) => {
        if (path === '/api/gpa') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              items: [{
                id: 'gpa-1', name: 'Agent', status: 'running',
                executionBudgetTotal: 100, executionBudgetUsed: 10,
                workspaceId: 'ws-1', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
              }],
            }),
          } as Response)
        }
        if (path === '/api/governance/coherence') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ items: [] }),
          } as Response)
        }
        return Promise.resolve({ ok: false, status: 404 } as Response)
      })

      const result = await service.computeFleetHealth()

      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0].type).toBe('fleet-gpa')
      expect(mockConn.fetch).toHaveBeenCalled()
    })

    it('computeViolationNetwork should fall back to REST aggregation', async () => {
      vi.mocked(mockObs.getViolationSummary).mockResolvedValue(null)

      vi.mocked(mockConn.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          items: [
            { id: 'r1', gpaId: 'gpa-1', channelId: 'ch-1', consequence: 'FAIL', receiptType: 'verification', governanceTier: 'standard', timestamp: '2025-01-01T00:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
          ],
        }),
      } as Response)

      const result = await service.computeViolationNetwork()

      expect(result.nodes).toHaveLength(2)
      expect(result.links).toHaveLength(1)
      expect(mockConn.fetch).toHaveBeenCalled()
    })

    it('computeCoherenceHeatmap should fall back to REST aggregation', async () => {
      vi.mocked(mockObs.getCoherenceSummary).mockResolvedValue(null)

      vi.mocked(mockConn.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          items: [
            { entityId: 'e1', entityType: 'gpa', entityName: 'Agent A', coherenceScore: 0.85, trajectory: 'stable', measurementCount: 5, lastMeasuredAt: '2025-01-01T00:00:00Z' },
          ],
        }),
      } as Response)

      const result = await service.computeCoherenceHeatmap()

      const bucketNodes = result.nodes.filter((n) => n.type === 'coherence-bucket')
      expect(bucketNodes.length).toBeGreaterThan(0)
      expect(mockConn.fetch).toHaveBeenCalled()
    })
  })

  describe('mixed availability', () => {
    it('should use observability for some methods and fallback for others', async () => {
      // Execution trends: observability available
      const obsExec: ObservabilityExecutionSummary = {
        timeRange: '24h',
        bucketSize: 'hour',
        buckets: [{
          timestamp: '2025-06-01T10:00:00Z',
          executionCount: 10, passCount: 9, failCount: 1,
          avgDurationMs: 100, p95DurationMs: 250,
        }],
        totals: { totalExecutions: 10, totalPasses: 9, totalFails: 1, overallPassRate: 0.9, avgDurationMs: 100 },
      }
      vi.mocked(mockObs.getExecutionSummary).mockResolvedValue(obsExec)

      // Fleet health: observability NOT available
      vi.mocked(mockObs.getFleetHealth).mockResolvedValue(null)

      vi.mocked(mockConn.fetch).mockImplementation((path: string) => {
        if (path === '/api/gpa') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              items: [{
                id: 'gpa-1', name: 'Agent', status: 'running',
                executionBudgetTotal: 100, executionBudgetUsed: 10,
                workspaceId: 'ws-1', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
              }],
            }),
          } as Response)
        }
        if (path === '/api/governance/coherence') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ items: [] }),
          } as Response)
        }
        return Promise.resolve({ ok: false, status: 404 } as Response)
      })

      // Execution trends uses observability (no conn.fetch)
      const execResult = await service.computeExecutionTrends({ timeRange: '24h' })
      expect(execResult.nodes[0].desc).toContain('P95')

      // Fleet health uses fallback (conn.fetch called)
      const fleetResult = await service.computeFleetHealth()
      expect(fleetResult.nodes[0].type).toBe('fleet-gpa')
      expect(mockConn.fetch).toHaveBeenCalledWith('/api/gpa')
    })
  })
})
