import { describe, it, expect, vi, beforeEach } from 'vitest'
import ContextExecutionTree from '../../contexts/ContextExecutionTree'
import { SylvaConnectionManager } from '../../SylvaConnectionManager'
import type { SylvaExecution, SylvaExecutionListResponse } from '../../types'

vi.mock('../../../../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ContextExecutionTree', () => {
  let context: ContextExecutionTree
  let mockConn: SylvaConnectionManager

  const mockExecution: SylvaExecution = {
    id: 'exec-001',
    gpaId: 'gpa-001',
    status: 'completed',
    startedAt: '2025-06-01T12:00:00Z',
    completedAt: '2025-06-01T12:01:00Z',
    consequence: 'PASS',
    steps: [
      {
        id: 'step-001',
        executionId: 'exec-001',
        stepType: 'guard',
        name: 'Check permissions',
        status: 'completed',
        consequence: 'PASS',
        duration: 100,
        order: 1,
      },
      {
        id: 'step-002',
        executionId: 'exec-001',
        stepType: 'action',
        name: 'Execute task',
        status: 'completed',
        consequence: 'PASS',
        duration: 500,
        order: 2,
      },
      {
        id: 'step-003',
        executionId: 'exec-001',
        stepType: 'verification',
        name: 'Verify result',
        status: 'completed',
        consequence: 'PASS',
        duration: 50,
        order: 3,
      },
    ],
  }

  beforeEach(() => {
    mockConn = {
      fetch: vi.fn(),
    } as unknown as SylvaConnectionManager

    context = new ContextExecutionTree(mockConn)
  })

  it('should have the correct context ID', () => {
    expect(context.getID()).toBe('execution-tree')
  })

  it('should report as not streamable', () => {
    expect(context.isStreamable()).toBe(false)
  })

  it('should return execution tree with step nodes', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockExecution,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'execution-tree',
      isStream: false,
      params: { gpaId: 'gpa-001', executionId: 'exec-001' },
    }

    const res = await context.getData(request)
    expect(res.rootNodeID).toBe('exec-001')

    const graphData = res.graphData as { nodes: any[]; links: any[] }
    expect(graphData.nodes).toHaveLength(4) // 1 execution + 3 steps
    expect(graphData.links).toHaveLength(3) // 1 starts + 2 sequence
  })

  it('should fetch most recent execution when no executionId provided', async () => {
    const listResponse: SylvaExecutionListResponse = {
      items: [mockExecution],
      total: 1,
    }

    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => listResponse,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'execution-tree',
      isStream: false,
      params: { gpaId: 'gpa-001' },
    }

    const res = await context.getData(request)
    expect(res.rootNodeID).toBe('exec-001')
    expect(mockConn.fetch).toHaveBeenCalledWith(
      '/api/gpa/gpa-001/executions?limit=1&sort=desc',
    )
  })

  it('should return empty graph when no executions found', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'execution-tree',
      isStream: false,
      params: { gpaId: 'gpa-001' },
    }

    const res = await context.getData(request)
    const graphData = res.graphData as { nodes: any[]; links: any[] }
    expect(graphData.nodes).toHaveLength(0)
    expect(graphData.links).toHaveLength(0)
  })

  it('should throw when gpaId is not provided', async () => {
    const request = {
      collection: 'sylva',
      context: 'execution-tree',
      isStream: false,
      params: {},
    }

    await expect(context.getData(request)).rejects.toThrow(
      'ContextExecutionTree requires params.gpaId',
    )
  })

  it('should throw on API error', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'execution-tree',
      isStream: false,
      params: { gpaId: 'gpa-001', executionId: 'exec-001' },
    }

    await expect(context.getData(request)).rejects.toThrow('Execution fetch failed: 500')
  })

  it('should reject streaming with error', () => {
    const request = {
      collection: 'sylva',
      context: 'execution-tree',
      isStream: true,
      params: { gpaId: 'gpa-001' },
    }

    const result = new Promise<any>((resolve, reject) => {
      context.getDataStream(request, (err) => {
        if (err) reject(err)
        else resolve(null)
      })
    })

    expect(result).rejects.toThrow('ContextExecutionTree does not support streaming')
  })

  it('should order steps correctly in the graph', async () => {
    // Steps provided in reverse order
    const unorderedExecution = {
      ...mockExecution,
      steps: [...mockExecution.steps].reverse(),
    }

    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => unorderedExecution,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'execution-tree',
      isStream: false,
      params: { gpaId: 'gpa-001', executionId: 'exec-001' },
    }

    const res = await context.getData(request)
    const graphData = res.graphData as { nodes: any[]; links: any[] }

    // First link should be execution → step-001 (order 1)
    const startsLink = graphData.links.find((l: any) => l.type === 'starts')
    expect(startsLink).toBeDefined()
    expect(startsLink.target).toBe('step-001')
  })
})
