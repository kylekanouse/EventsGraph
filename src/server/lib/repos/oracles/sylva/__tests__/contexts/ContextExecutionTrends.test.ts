import { describe, it, expect, vi, beforeEach } from 'vitest'
import ContextExecutionTrends from '../../contexts/ContextExecutionTrends'
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

describe('ContextExecutionTrends', () => {
  let context: ContextExecutionTrends
  let mockAnalytics: SylvaAnalyticsService

  beforeEach(() => {
    const mockConn = { fetch: vi.fn() } as unknown as SylvaConnectionManager
    const mockObservability = new SylvaObservabilityClient(mockConn)
    mockAnalytics = new SylvaAnalyticsService(mockConn, mockObservability)
    vi.spyOn(mockAnalytics, 'computeExecutionTrends')
    context = new ContextExecutionTrends(mockAnalytics)
  })

  it('should have the correct context ID', () => {
    expect(context.getID()).toBe('execution-trends')
  })

  it('should report as not streamable', () => {
    expect(context.isStreamable()).toBe(false)
  })

  it('should return graph data from analytics service', async () => {
    const mockGraphData = {
      nodes: [{ id: 'bucket-1', group: 1, label: 'test', val: 10, desc: '', icon: '', type: 'time-bucket', url: '', color: '#00FF00' }],
      links: [],
    }
    vi.mocked(mockAnalytics.computeExecutionTrends).mockResolvedValue(mockGraphData)

    const request = {
      collection: 'sylva',
      context: 'execution-trends',
      isStream: false,
      params: { timeRange: '24h', bucketSize: 'hour' },
    }

    const res = await context.getData(request)
    expect(res.collection).toBe('sylva')
    expect(res.context).toBe('execution-trends')
    expect(res.rootNodeID).toBe('bucket-1')
    expect(res.graphData).toBeDefined()

    expect(mockAnalytics.computeExecutionTrends).toHaveBeenCalledWith({
      timeRange: '24h',
      bucketSize: 'hour',
    })
  })

  it('should use default params when none provided', async () => {
    vi.mocked(mockAnalytics.computeExecutionTrends).mockResolvedValue({ nodes: [], links: [] })

    const request = {
      collection: 'sylva',
      context: 'execution-trends',
      isStream: false,
      params: {},
    }

    await context.getData(request)
    expect(mockAnalytics.computeExecutionTrends).toHaveBeenCalledWith({
      timeRange: '24h',
      bucketSize: 'hour',
    })
  })

  it('should return error on getDataStream', () => {
    const request = {
      collection: 'sylva',
      context: 'execution-trends',
      isStream: true,
      params: {},
    }

    const cb = vi.fn()
    context.getDataStream(request, cb)
    expect(cb).toHaveBeenCalledWith(expect.any(Error))
  })
})
