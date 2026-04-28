import { describe, it, expect, vi, beforeEach } from 'vitest'
import ContextFleetHealth from '../../contexts/ContextFleetHealth'
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

describe('ContextFleetHealth', () => {
  let context: ContextFleetHealth
  let mockAnalytics: SylvaAnalyticsService
  let mockBridge: SylvaEventBridge

  const mockGraphData = {
    nodes: [{ id: 'gpa-1', group: 1, label: 'Agent A (85%)', val: 60, desc: 'Status: running', icon: '', type: 'fleet-gpa', url: '', color: '#00FF00' }],
    links: [],
  }

  beforeEach(() => {
    const mockConn = { fetch: vi.fn() } as unknown as SylvaConnectionManager
    const mockObservability = new SylvaObservabilityClient(mockConn)
    mockAnalytics = new SylvaAnalyticsService(mockConn, mockObservability)
    vi.spyOn(mockAnalytics, 'computeFleetHealth')

    mockBridge = {
      subscribe: vi.fn().mockReturnValue(() => {}),
      dispose: vi.fn(),
    } as unknown as SylvaEventBridge

    context = new ContextFleetHealth(mockAnalytics, mockBridge)
  })

  it('should have the correct context ID', () => {
    expect(context.getID()).toBe('fleet-health')
  })

  it('should report as streamable', () => {
    expect(context.isStreamable()).toBe(true)
  })

  it('should return graph data from analytics service', async () => {
    vi.mocked(mockAnalytics.computeFleetHealth).mockResolvedValue(mockGraphData)

    const request = {
      collection: 'sylva',
      context: 'fleet-health',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    expect(res.collection).toBe('sylva')
    expect(res.context).toBe('fleet-health')
    expect(res.rootNodeID).toBe('gpa-1')
    expect(mockAnalytics.computeFleetHealth).toHaveBeenCalled()
  })

  it('should subscribe to lifecycle and execution events on stream', async () => {
    vi.mocked(mockAnalytics.computeFleetHealth).mockResolvedValue(mockGraphData)

    const request = {
      collection: 'sylva',
      context: 'fleet-health',
      isStream: true,
      params: {},
    }

    const cb = vi.fn()
    context.getDataStream(request, cb)

    // Wait for async getData to resolve
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(mockBridge.subscribe).toHaveBeenCalledWith(
      ['governance.lifecycle', 'gpa.execution.started', 'gpa.execution.completed'],
      expect.any(Function),
    )
    expect(cb).toHaveBeenCalledWith(null, expect.any(Object), expect.any(Function))
  })

  it('should call error callback when analytics computation fails', async () => {
    vi.mocked(mockAnalytics.computeFleetHealth).mockRejectedValue(new Error('GPA fetch failed'))

    const request = {
      collection: 'sylva',
      context: 'fleet-health',
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
    vi.mocked(mockAnalytics.computeFleetHealth).mockResolvedValue(mockGraphData)

    const request = {
      collection: 'sylva',
      context: 'fleet-health',
      isStream: true,
      params: {},
    }

    const cb = vi.fn()
    context.getDataStream(request, cb)

    await new Promise((resolve) => setTimeout(resolve, 10))

    // Extract the closeStream function from the callback
    const closeStream = cb.mock.calls[0][2] as () => void
    expect(closeStream).toBeDefined()
    closeStream()
    expect(mockUnsub).toHaveBeenCalled()
  })
})
