import { describe, it, expect, vi, beforeEach } from 'vitest'
import ContextCrossChannelKnowledge from '../../contexts/ContextCrossChannelKnowledge'
import { SylvaConnectionManager } from '../../SylvaConnectionManager'
import { SylvaEventBridge } from '../../SylvaEventBridge'
import type { SylvaChannelListResponse, SylvaMessageReferenceListResponse } from '../../types'

vi.mock('../../../../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ContextCrossChannelKnowledge', () => {
  let context: ContextCrossChannelKnowledge
  let mockConn: SylvaConnectionManager
  let mockBridge: SylvaEventBridge

  const mockChannelsResponse: SylvaChannelListResponse = {
    items: [
      {
        id: 'ch-001',
        name: 'General',
        channelType: 'standard',
        governanceTier: 't1',
        visibility: 'public',
        workspaceId: 'ws-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'ch-002',
        name: 'Engineering',
        channelType: 'governed',
        governanceTier: 't2',
        visibility: 'private',
        workspaceId: 'ws-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ],
    total: 2,
  }

  const mockRefsResponse: SylvaMessageReferenceListResponse = {
    items: [
      {
        id: 'ref-001',
        sourceChannelId: 'ch-001',
        targetChannelId: 'ch-002',
        sourceMessageId: 'msg-001',
        referenceType: 'citation',
        participantId: 'p-001',
        timestamp: '2025-06-01T12:00:00Z',
      },
      {
        id: 'ref-002',
        sourceChannelId: 'ch-001',
        targetChannelId: 'ch-002',
        sourceMessageId: 'msg-002',
        referenceType: 'reply',
        participantId: 'p-002',
        timestamp: '2025-06-01T12:05:00Z',
      },
      {
        id: 'ref-003',
        sourceChannelId: 'ch-002',
        targetChannelId: 'ch-001',
        sourceMessageId: 'msg-003',
        referenceType: 'cross-post',
        participantId: 'p-001',
        timestamp: '2025-06-01T12:10:00Z',
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

    context = new ContextCrossChannelKnowledge(mockConn, mockBridge)
  })

  it('should have the correct context ID', () => {
    expect(context.getID()).toBe('cross-channel-knowledge')
  })

  it('should report as streamable', () => {
    expect(context.isStreamable()).toBe(true)
  })

  it('should return channel nodes and aggregated reference links', async () => {
    vi.mocked(mockConn.fetch).mockImplementation(async (path: string) => {
      if (path === '/api/channels') {
        return { ok: true, json: async () => mockChannelsResponse } as Response
      }
      if (path === '/api/messages/cross-references') {
        return { ok: true, json: async () => mockRefsResponse } as Response
      }
      return { ok: false, status: 404 } as Response
    })

    const request = {
      collection: 'sylva',
      context: 'cross-channel-knowledge',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    const graphData = res.graphData as { nodes: any[]; links: any[] }

    expect(graphData.nodes).toHaveLength(2) // 2 channels
    expect(graphData.links).toHaveLength(2) // ch-001→ch-002 (2 refs aggregated) + ch-002→ch-001 (1 ref)

    // Find the aggregated link ch-001 → ch-002
    const link12 = graphData.links.find(
      (l: any) => l.source === 'ch-001' && l.target === 'ch-002',
    )
    expect(link12).toBeDefined()
    expect(link12.label).toBe('2 refs')
    expect(link12.val).toBe(2)
  })

  it('should handle empty references', async () => {
    vi.mocked(mockConn.fetch).mockImplementation(async (path: string) => {
      if (path === '/api/channels') {
        return { ok: true, json: async () => mockChannelsResponse } as Response
      }
      if (path === '/api/messages/cross-references') {
        return { ok: true, json: async () => ({ items: [], total: 0 }) } as Response
      }
      return { ok: false, status: 404 } as Response
    })

    const request = {
      collection: 'sylva',
      context: 'cross-channel-knowledge',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    const graphData = res.graphData as { nodes: any[]; links: any[] }
    expect(graphData.nodes).toHaveLength(2)
    expect(graphData.links).toHaveLength(0)
  })

  it('should throw on channels fetch error', async () => {
    vi.mocked(mockConn.fetch).mockImplementation(async (path: string) => {
      if (path === '/api/channels') {
        return { ok: false, status: 500 } as Response
      }
      return { ok: true, json: async () => ({ items: [], total: 0 }) } as Response
    })

    const request = {
      collection: 'sylva',
      context: 'cross-channel-knowledge',
      isStream: false,
      params: {},
    }

    await expect(context.getData(request)).rejects.toThrow('Channels fetch failed: 500')
  })

  it('should throw on cross-references fetch error', async () => {
    vi.mocked(mockConn.fetch).mockImplementation(async (path: string) => {
      if (path === '/api/channels') {
        return { ok: true, json: async () => mockChannelsResponse } as Response
      }
      return { ok: false, status: 500 } as Response
    })

    const request = {
      collection: 'sylva',
      context: 'cross-channel-knowledge',
      isStream: false,
      params: {},
    }

    await expect(context.getData(request)).rejects.toThrow('Cross-references fetch failed: 500')
  })

  it('should provide data via getDataStream callback', async () => {
    vi.mocked(mockConn.fetch).mockImplementation(async (path: string) => {
      if (path === '/api/channels') {
        return { ok: true, json: async () => mockChannelsResponse } as Response
      }
      if (path === '/api/messages/cross-references') {
        return { ok: true, json: async () => mockRefsResponse } as Response
      }
      return { ok: false, status: 404 } as Response
    })

    const request = {
      collection: 'sylva',
      context: 'cross-channel-knowledge',
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
