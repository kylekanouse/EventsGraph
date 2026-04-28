import { describe, it, expect, vi, beforeEach } from 'vitest'
import ContextChannelNetwork from '../../contexts/ContextChannelNetwork'
import { SylvaConnectionManager } from '../../SylvaConnectionManager'
import { SylvaEventBridge } from '../../SylvaEventBridge'
import type {
  SylvaChannelListResponse,
  SylvaParticipantListResponse,
  SylvaChannelMembersResponse,
} from '../../types'

// Mock the logger
vi.mock('../../../../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ContextChannelNetwork', () => {
  let context: ContextChannelNetwork
  let mockConn: SylvaConnectionManager

  const mockChannels: SylvaChannelListResponse = {
    items: [
      {
        id: 'ch-1',
        name: 'General',
        channelType: 'standard',
        governanceTier: 't1',
        visibility: 'public',
        workspaceId: 'ws-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ],
    total: 1,
  }

  const mockParticipants: SylvaParticipantListResponse = {
    items: [
      {
        id: 'p-1',
        name: 'Alice',
        participantType: 'human',
        status: 'active',
        governanceDepth: 1,
        workspaceId: 'ws-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ],
    total: 1,
  }

  const mockMembers: SylvaChannelMembersResponse = {
    items: [
      {
        participantId: 'p-1',
        channelId: 'ch-1',
        role: 'member',
        joinedAt: '2025-01-01T00:00:00Z',
      },
    ],
    total: 1,
  }

  beforeEach(() => {
    mockConn = {
      fetch: vi.fn(),
    } as unknown as SylvaConnectionManager

    const mockBridge = {
      subscribe: vi.fn().mockReturnValue(() => {}),
      dispose: vi.fn(),
    } as unknown as SylvaEventBridge

    context = new ContextChannelNetwork(mockConn, mockBridge)
  })

  it('should have the correct context ID', () => {
    expect(context.getID()).toBe('channel-network')
  })

  it('should report as streamable', () => {
    expect(context.isStreamable()).toBe(true)
  })

  it('should return channel and participant nodes with membership links', async () => {
    const fetchMock = vi.mocked(mockConn.fetch)

    // Channels + participants fetched in parallel
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockChannels,
    } as Response)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockParticipants,
    } as Response)
    // Members for ch-1
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMembers,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'channel-network',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)

    expect(res.collection).toBe('sylva')
    expect(res.context).toBe('channel-network')
    expect(res.rootNodeID).toBe('ch-1')

    const graphData = res.graphData as { nodes: any[]; links: any[] }
    expect(graphData.nodes).toHaveLength(2) // 1 channel + 1 participant
    expect(graphData.links).toHaveLength(1) // 1 membership link

    const memberLink = graphData.links[0]
    expect(memberLink.source).toBe('p-1')
    expect(memberLink.target).toBe('ch-1')
    expect(memberLink.type).toBe('membership')
  })

  it('should handle empty data', async () => {
    const fetchMock = vi.mocked(mockConn.fetch)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    } as Response)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'channel-network',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    const graphData = res.graphData as { nodes: any[]; links: any[] }
    expect(graphData.nodes).toHaveLength(0)
    expect(graphData.links).toHaveLength(0)
  })

  it('should throw on channels fetch failure', async () => {
    const fetchMock = vi.mocked(mockConn.fetch)
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockParticipants,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'channel-network',
      isStream: false,
      params: {},
    }

    await expect(context.getData(request)).rejects.toThrow('Sylva channels fetch failed: 500')
  })

  it('should throw on participants fetch failure', async () => {
    const fetchMock = vi.mocked(mockConn.fetch)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockChannels,
    } as Response)
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'channel-network',
      isStream: false,
      params: {},
    }

    await expect(context.getData(request)).rejects.toThrow('Sylva participants fetch failed: 500')
  })

  it('should gracefully handle membership fetch failure', async () => {
    const fetchMock = vi.mocked(mockConn.fetch)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockChannels,
    } as Response)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockParticipants,
    } as Response)
    // Members fetch fails
    fetchMock.mockRejectedValueOnce(new Error('Network error'))

    const request = {
      collection: 'sylva',
      context: 'channel-network',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    const graphData = res.graphData as { nodes: any[]; links: any[] }
    expect(graphData.nodes).toHaveLength(2) // nodes still present
    expect(graphData.links).toHaveLength(0) // no links due to failure
  })
})
