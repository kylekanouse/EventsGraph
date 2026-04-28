import { describe, it, expect, vi, beforeEach } from 'vitest'
import ContextInstanceOverview from '../../contexts/ContextInstanceOverview'
import { SylvaConnectionManager } from '../../SylvaConnectionManager'
import { SylvaEventBridge } from '../../SylvaEventBridge'

// Mock the logger
vi.mock('../../../../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ContextInstanceOverview', () => {
  let context: ContextInstanceOverview
  let mockConn: SylvaConnectionManager

  const mockGPAs = {
    items: [
      {
        id: 'gpa-1',
        name: 'Agent 1',
        status: 'running',
        workspaceId: 'ws-1',
        executionBudgetTotal: 100,
        executionBudgetUsed: 50,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ],
    total: 1,
  }

  const mockChannels = {
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

  const mockParticipants = {
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

  beforeEach(() => {
    mockConn = {
      fetch: vi.fn(),
    } as unknown as SylvaConnectionManager

    const mockBridge = {
      subscribe: vi.fn().mockReturnValue(() => {}),
      dispose: vi.fn(),
    } as unknown as SylvaEventBridge

    context = new ContextInstanceOverview(mockConn, mockBridge)
  })

  it('should have the correct context ID', () => {
    expect(context.getID()).toBe('instance-overview')
  })

  it('should report as streamable', () => {
    expect(context.isStreamable()).toBe(true)
  })

  it('should return composite graph with root instance node', async () => {
    const fetchMock = vi.mocked(mockConn.fetch)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGPAs,
    } as Response)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockChannels,
    } as Response)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockParticipants,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'instance-overview',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)

    expect(res.collection).toBe('sylva')
    expect(res.context).toBe('instance-overview')
    expect(res.rootNodeID).toBe('sylva-instance')

    const graphData = res.graphData as { nodes: any[]; links: any[] }

    // 1 root + 1 gpa + 1 channel + 1 participant = 4 nodes
    expect(graphData.nodes).toHaveLength(4)

    // Root node
    const rootNode = graphData.nodes.find((n: any) => n.id === 'sylva-instance')
    expect(rootNode).toBeDefined()
    expect(rootNode.label).toBe('Sylva Instance')
    expect(rootNode.type).toBe('instance')
    expect(rootNode.color).toBe('#FFFFFF')

    // 1 gpa link + 1 channel link + 1 participant link = 3 links
    expect(graphData.links).toHaveLength(3)

    // All links should come from root
    for (const link of graphData.links) {
      expect(link.source).toBe('sylva-instance')
      expect(link.type).toBe('contains')
    }

    // Verify targets
    const targets = graphData.links.map((l: any) => l.target)
    expect(targets).toContain('gpa-1')
    expect(targets).toContain('ch-1')
    expect(targets).toContain('p-1')
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
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'instance-overview',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    const graphData = res.graphData as { nodes: any[]; links: any[] }

    // Only the root node
    expect(graphData.nodes).toHaveLength(1)
    expect(graphData.nodes[0].id).toBe('sylva-instance')
    expect(graphData.links).toHaveLength(0)
  })

  it('should throw on GPA fetch failure', async () => {
    const fetchMock = vi.mocked(mockConn.fetch)
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockChannels,
    } as Response)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockParticipants,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'instance-overview',
      isStream: false,
      params: {},
    }

    await expect(context.getData(request)).rejects.toThrow('Sylva GPA fetch failed: 500')
  })

  it('should include counts in root node description', async () => {
    const fetchMock = vi.mocked(mockConn.fetch)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGPAs,
    } as Response)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockChannels,
    } as Response)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockParticipants,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'instance-overview',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    const graphData = res.graphData as { nodes: any[]; links: any[] }
    const rootNode = graphData.nodes.find((n: any) => n.id === 'sylva-instance')

    expect(rootNode.desc).toContain('GPAs: 1')
    expect(rootNode.desc).toContain('Channels: 1')
    expect(rootNode.desc).toContain('Participants: 1')
  })
})
