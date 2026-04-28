import { describe, it, expect, vi, beforeEach } from 'vitest'
import ContextViolationNetwork from '../../contexts/ContextViolationNetwork'
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

describe('ContextViolationNetwork', () => {
  let context: ContextViolationNetwork
  let mockAnalytics: SylvaAnalyticsService

  beforeEach(() => {
    const mockConn = { fetch: vi.fn() } as unknown as SylvaConnectionManager
    const mockObservability = new SylvaObservabilityClient(mockConn)
    mockAnalytics = new SylvaAnalyticsService(mockConn, mockObservability)
    vi.spyOn(mockAnalytics, 'computeViolationNetwork')
    context = new ContextViolationNetwork(mockAnalytics)
  })

  it('should have the correct context ID', () => {
    expect(context.getID()).toBe('violation-network')
  })

  it('should report as not streamable', () => {
    expect(context.isStreamable()).toBe(false)
  })

  it('should return graph data from analytics service', async () => {
    const mockGraphData = {
      nodes: [
        { id: 'gpa-1', group: 1, label: 'GPA gpa-1', val: 15, desc: 'Violations: 2', icon: '', type: 'violator-gpa', url: '', color: '#FF4444' },
        { id: 'ch-1', group: 2, label: 'Channel ch-1', val: 15, desc: 'Violations: 2', icon: '', type: 'violated-channel', url: '', color: '#FF8C00' },
      ],
      links: [{ source: 'gpa-1', target: 'ch-1', label: '2 violations', val: 2, type: 'violation' }],
    }
    vi.mocked(mockAnalytics.computeViolationNetwork).mockResolvedValue(mockGraphData)

    const request = {
      collection: 'sylva',
      context: 'violation-network',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    expect(res.collection).toBe('sylva')
    expect(res.context).toBe('violation-network')
    expect(res.rootNodeID).toBe('gpa-1')
    expect(res.graphData).toBeDefined()
    expect(mockAnalytics.computeViolationNetwork).toHaveBeenCalled()
  })

  it('should handle empty violation data', async () => {
    vi.mocked(mockAnalytics.computeViolationNetwork).mockResolvedValue({ nodes: [], links: [] })

    const request = {
      collection: 'sylva',
      context: 'violation-network',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    expect(res.rootNodeID).toBe('')
  })

  it('should propagate analytics errors', async () => {
    vi.mocked(mockAnalytics.computeViolationNetwork).mockRejectedValue(new Error('Receipts fetch failed'))

    const request = {
      collection: 'sylva',
      context: 'violation-network',
      isStream: false,
      params: {},
    }

    await expect(context.getData(request)).rejects.toThrow('Receipts fetch failed')
  })

  it('should return error on getDataStream', () => {
    const request = {
      collection: 'sylva',
      context: 'violation-network',
      isStream: true,
      params: {},
    }

    const cb = vi.fn()
    context.getDataStream(request, cb)
    expect(cb).toHaveBeenCalledWith(expect.any(Error))
  })
})
