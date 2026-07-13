import { describe, it, expect, vi, beforeEach } from 'vitest'
import ContextComplianceOverview from '../../contexts/ContextComplianceOverview'
import { SylvaAnalyticsService } from '../../services/SylvaAnalyticsService'
import { SylvaObservabilityClient } from '../../services/SylvaObservabilityClient'
import { SylvaConnectionManager } from '../../SylvaConnectionManager'

vi.mock('../../../../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ContextComplianceOverview', () => {
  let context: ContextComplianceOverview
  let mockAnalytics: SylvaAnalyticsService

  beforeEach(() => {
    const mockConn = { fetch: vi.fn() } as unknown as SylvaConnectionManager
    const mockObservability = new SylvaObservabilityClient(mockConn)
    mockAnalytics = new SylvaAnalyticsService(mockConn, mockObservability)
    vi.spyOn(mockAnalytics, 'computeComplianceCoverage')
    context = new ContextComplianceOverview(mockAnalytics)
  })

  it('should have the correct context ID', () => {
    expect(context.getID()).toBe('compliance-overview')
  })

  it('should report as not streamable', () => {
    expect(context.isStreamable()).toBe(false)
  })

  it('should return graph data from analytics service', async () => {
    const mockGraphData = {
      nodes: [{ id: 'ch-1', group: 1, label: 'Channel A (95%)', val: 66, desc: '', icon: '', type: 'compliance-channel', url: '', color: '#00FF00' }],
      links: [],
    }
    vi.mocked(mockAnalytics.computeComplianceCoverage).mockResolvedValue(mockGraphData)

    const request = {
      collection: 'sylva',
      context: 'compliance-overview',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    expect(res.collection).toBe('sylva')
    expect(res.context).toBe('compliance-overview')
    expect(res.rootNodeID).toBe('ch-1')
    expect(res.graphData).toBeDefined()
    expect(mockAnalytics.computeComplianceCoverage).toHaveBeenCalled()
  })

  it('should handle empty graph data', async () => {
    vi.mocked(mockAnalytics.computeComplianceCoverage).mockResolvedValue({ nodes: [], links: [] })

    const request = {
      collection: 'sylva',
      context: 'compliance-overview',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    expect(res.rootNodeID).toBe('')
  })

  it('should return error on getDataStream', () => {
    const request = {
      collection: 'sylva',
      context: 'compliance-overview',
      isStream: true,
      params: {},
    }

    const cb = vi.fn()
    context.getDataStream(request, cb)
    expect(cb).toHaveBeenCalledWith(expect.any(Error))
  })
})
