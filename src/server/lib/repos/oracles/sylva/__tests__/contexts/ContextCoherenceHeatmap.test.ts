import { describe, it, expect, vi, beforeEach } from 'vitest'
import ContextCoherenceHeatmap from '../../contexts/ContextCoherenceHeatmap'
import { SylvaAnalyticsService } from '../../services/SylvaAnalyticsService'
import { SylvaObservabilityClient } from '../../services/SylvaObservabilityClient'
import { SylvaEventBridge } from '../../SylvaEventBridge'
import { SylvaConnectionManager } from '../../SylvaConnectionManager'

vi.mock('../../../../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ContextCoherenceHeatmap', () => {
  let context: ContextCoherenceHeatmap
  let mockAnalytics: SylvaAnalyticsService
  let mockBridge: SylvaEventBridge

  const mockGraphData = {
    nodes: [{ id: 'bucket-80-100%', group: 1, label: '80-100% (1)', val: 40, desc: '1 entities in range 80-100%', icon: '', type: 'coherence-bucket', url: '', color: '#00FF00' }],
    links: [],
  }

  beforeEach(() => {
    const mockConn = { fetch: vi.fn() } as unknown as SylvaConnectionManager
    const mockObservability = new SylvaObservabilityClient(mockConn)
    mockAnalytics = new SylvaAnalyticsService(mockConn, mockObservability)
    vi.spyOn(mockAnalytics, 'computeCoherenceHeatmap')

    mockBridge = {
      subscribe: vi.fn().mockReturnValue(() => {}),
      dispose: vi.fn(),
    } as unknown as SylvaEventBridge

    context = new ContextCoherenceHeatmap(mockAnalytics, mockBridge)
  })

  it('should have the correct context ID', () => {
    expect(context.getID()).toBe('coherence-heatmap')
  })

  it('should report as streamable', () => {
    expect(context.isStreamable()).toBe(true)
  })

  it('should return graph data from analytics service', async () => {
    vi.mocked(mockAnalytics.computeCoherenceHeatmap).mockResolvedValue(mockGraphData)

    const request = {
      collection: 'sylva',
      context: 'coherence-heatmap',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    expect(res.collection).toBe('sylva')
    expect(res.context).toBe('coherence-heatmap')
    expect(res.rootNodeID).toBe('bucket-80-100%')
    expect(mockAnalytics.computeCoherenceHeatmap).toHaveBeenCalled()
  })

  it('should subscribe to coherence and alert events on stream', async () => {
    vi.mocked(mockAnalytics.computeCoherenceHeatmap).mockResolvedValue(mockGraphData)

    const request = {
      collection: 'sylva',
      context: 'coherence-heatmap',
      isStream: true,
      params: {},
    }

    const cb = vi.fn()
    context.getDataStream(request, cb)

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(mockBridge.subscribe).toHaveBeenCalledWith(
      ['governance.coherence', 'governance.alert'],
      expect.any(Function),
    )
    expect(cb).toHaveBeenCalledWith(null, expect.any(Object), expect.any(Function))
  })

  it('should call error callback when analytics computation fails', async () => {
    vi.mocked(mockAnalytics.computeCoherenceHeatmap).mockRejectedValue(new Error('Coherence fetch failed'))

    const request = {
      collection: 'sylva',
      context: 'coherence-heatmap',
      isStream: true,
      params: {},
    }

    const cb = vi.fn()
    context.getDataStream(request, cb)

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(cb).toHaveBeenCalledWith(expect.any(Error))
  })

  it('should unsubscribe on closeStream', async () => {
    const mockUnsub = vi.fn()
    vi.mocked(mockBridge.subscribe).mockReturnValue(mockUnsub)
    vi.mocked(mockAnalytics.computeCoherenceHeatmap).mockResolvedValue(mockGraphData)

    const request = {
      collection: 'sylva',
      context: 'coherence-heatmap',
      isStream: true,
      params: {},
    }

    const cb = vi.fn()
    context.getDataStream(request, cb)

    await new Promise((resolve) => setTimeout(resolve, 10))

    const closeStream = cb.mock.calls[0][2] as () => void
    expect(closeStream).toBeDefined()
    closeStream()
    expect(mockUnsub).toHaveBeenCalled()
  })
})
