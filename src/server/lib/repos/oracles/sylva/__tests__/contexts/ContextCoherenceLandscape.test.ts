import { describe, it, expect, vi, beforeEach } from 'vitest'
import ContextCoherenceLandscape from '../../contexts/ContextCoherenceLandscape'
import { SylvaConnectionManager } from '../../SylvaConnectionManager'
import { SylvaEventBridge } from '../../SylvaEventBridge'
import type { SylvaCoherenceListResponse } from '../../types'

vi.mock('../../../../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ContextCoherenceLandscape', () => {
  let context: ContextCoherenceLandscape
  let mockConn: SylvaConnectionManager
  let mockBridge: SylvaEventBridge

  const mockCoherenceResponse: SylvaCoherenceListResponse = {
    items: [
      {
        entityId: 'gpa-001',
        entityType: 'gpa',
        entityName: 'Agent Alpha',
        coherenceScore: 0.95,
        trajectory: 'improving',
        measurementCount: 100,
        lastMeasuredAt: '2025-06-01T12:00:00Z',
      },
      {
        entityId: 'ch-001',
        entityType: 'channel',
        entityName: 'General Channel',
        coherenceScore: 0.70,
        trajectory: 'stable',
        measurementCount: 50,
        lastMeasuredAt: '2025-06-01T11:00:00Z',
      },
      {
        entityId: 'p-001',
        entityType: 'participant',
        entityName: 'Human User',
        coherenceScore: 0.40,
        trajectory: 'declining',
        measurementCount: 20,
        lastMeasuredAt: '2025-06-01T10:00:00Z',
      },
    ],
    total: 3,
  }

  beforeEach(() => {
    mockConn = {
      fetch: vi.fn(),
    } as unknown as SylvaConnectionManager

    mockBridge = {
      subscribe: vi.fn().mockReturnValue(() => {}),
      dispose: vi.fn(),
    } as unknown as SylvaEventBridge

    context = new ContextCoherenceLandscape(mockConn, mockBridge)
  })

  it('should have the correct context ID', () => {
    expect(context.getID()).toBe('coherence-landscape')
  })

  it('should report as streamable', () => {
    expect(context.isStreamable()).toBe(true)
  })

  it('should return coherence nodes with proximity links', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCoherenceResponse,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'coherence-landscape',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    // Root should be highest coherence entity
    expect(res.rootNodeID).toBe('gpa-001')

    const graphData = res.graphData as { nodes: any[]; links: any[] }
    expect(graphData.nodes).toHaveLength(3)

    // With default 0.1 threshold:
    // gpa-001 (0.95) ↔ ch-001 (0.70): diff=0.25 > 0.1 → no link
    // gpa-001 (0.95) ↔ p-001 (0.40): diff=0.55 > 0.1 → no link
    // ch-001 (0.70) ↔ p-001 (0.40): diff=0.30 > 0.1 → no link
    expect(graphData.links).toHaveLength(0)
  })

  it('should create proximity links with larger threshold', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCoherenceResponse,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'coherence-landscape',
      isStream: false,
      params: { threshold: 0.3 },
    }

    const res = await context.getData(request)
    const graphData = res.graphData as { nodes: any[]; links: any[] }
    // gpa-001 (0.95) ↔ ch-001 (0.70): diff=0.25 ≤ 0.3 → linked
    // ch-001 (0.70) ↔ p-001 (0.40): diff=0.30 ≤ 0.3 → linked
    expect(graphData.links).toHaveLength(2)
  })

  it('should handle empty coherence data', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'coherence-landscape',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    const graphData = res.graphData as { nodes: any[]; links: any[] }
    expect(graphData.nodes).toHaveLength(0)
    expect(graphData.links).toHaveLength(0)
    expect(res.rootNodeID).toBe('')
  })

  it('should throw on API error', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'coherence-landscape',
      isStream: false,
      params: {},
    }

    await expect(context.getData(request)).rejects.toThrow('Coherence data fetch failed: 500')
  })

  it('should provide data via getDataStream callback', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCoherenceResponse,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'coherence-landscape',
      isStream: true,
      params: {},
    }

    const result = await new Promise<any>((resolve, reject) => {
      context.getDataStream(request, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })

    expect(result.graphData).toBeDefined()
  })
})
