import { describe, it, expect, vi, beforeEach } from 'vitest'
import ContextAgentTopology from '../../contexts/ContextAgentTopology'
import { SylvaConnectionManager } from '../../SylvaConnectionManager'
import { SylvaEventBridge } from '../../SylvaEventBridge'
import type { SylvaGPAListResponse } from '../../types'

// Mock the logger
vi.mock('../../../../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ContextAgentTopology', () => {
  let context: ContextAgentTopology
  let mockConn: SylvaConnectionManager

  const mockGPAResponse: SylvaGPAListResponse = {
    items: [
      {
        id: 'gpa-root',
        name: 'Root Agent',
        status: 'running',
        workspaceId: 'ws-1',
        executionBudgetTotal: 100,
        executionBudgetUsed: 10,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'gpa-child',
        name: 'Child Agent',
        status: 'deployed',
        parentGpaId: 'gpa-root',
        channelId: 'ch-1',
        workspaceId: 'ws-1',
        agentRole: 'worker',
        scheduleType: 'event-driven',
        executionBudgetTotal: 50,
        executionBudgetUsed: 25,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ],
    total: 2,
  }

  beforeEach(() => {
    mockConn = {
      fetch: vi.fn(),
    } as unknown as SylvaConnectionManager

    const mockBridge = {
      subscribe: vi.fn().mockReturnValue(() => {}),
      dispose: vi.fn(),
    } as unknown as SylvaEventBridge

    context = new ContextAgentTopology(mockConn, mockBridge)
  })

  it('should have the correct context ID', () => {
    expect(context.getID()).toBe('agent-topology')
  })

  it('should report as streamable', () => {
    expect(context.isStreamable()).toBe(true)
  })

  it('should return nodes and links from GPA data', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockGPAResponse,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'agent-topology',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)

    expect(res.collection).toBe('sylva')
    expect(res.context).toBe('agent-topology')
    expect(res.rootNodeID).toBe('gpa-root')
    expect(res.graphData).toBeDefined()

    const graphData = res.graphData as { nodes: any[]; links: any[] }
    expect(graphData.nodes).toHaveLength(2)
    expect(graphData.links).toHaveLength(2) // 1 delegation + 1 channel assignment

    // Verify delegation link
    const delegationLink = graphData.links.find((l: any) => l.type === 'delegation')
    expect(delegationLink).toBeDefined()
    expect(delegationLink.source).toBe('gpa-root')
    expect(delegationLink.target).toBe('gpa-child')

    // Verify channel assignment link
    const assignmentLink = graphData.links.find((l: any) => l.type === 'assignment')
    expect(assignmentLink).toBeDefined()
    expect(assignmentLink.source).toBe('gpa-child')
    expect(assignmentLink.target).toBe('ch-1')
  })

  it('should handle empty GPA response', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'agent-topology',
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
      text: async () => 'Internal Server Error',
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'agent-topology',
      isStream: false,
      params: {},
    }

    await expect(context.getData(request)).rejects.toThrow('Sylva GPA fetch failed: 500')
  })

  it('should pass workspaceId as query param when provided', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'agent-topology',
      isStream: false,
      params: { workspaceId: 'ws-custom' },
    }

    await context.getData(request)
    expect(mockConn.fetch).toHaveBeenCalledWith('/api/gpa?workspaceId=ws-custom')
  })

  it('should provide data via getDataStream callback', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockGPAResponse,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'agent-topology',
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
