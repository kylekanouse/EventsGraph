import { describe, it, expect, vi, beforeEach } from 'vitest'
import ContextFilesystemTree from '../../contexts/ContextFilesystemTree'
import { SylvaConnectionManager } from '../../SylvaConnectionManager'
import { SylvaEventBridge } from '../../SylvaEventBridge'
import type { SylvaFilesystemTreeResponse } from '../../types'

vi.mock('../../../../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ContextFilesystemTree', () => {
  let context: ContextFilesystemTree
  let mockConn: SylvaConnectionManager
  let mockBridge: SylvaEventBridge

  const mockFsResponse: SylvaFilesystemTreeResponse = {
    root: {
      id: 'dir-root',
      name: 'root',
      path: '/',
      type: 'directory',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      children: [
        {
          id: 'dir-docs',
          name: 'docs',
          path: '/docs',
          type: 'directory',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          children: [
            {
              id: 'file-readme',
              name: 'README.md',
              path: '/docs/README.md',
              type: 'file',
              size: 2048,
              mimeType: 'text/markdown',
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
            },
          ],
        },
        {
          id: 'file-config',
          name: 'config.json',
          path: '/config.json',
          type: 'file',
          size: 512,
          mimeType: 'application/json',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
    },
  }

  beforeEach(() => {
    mockConn = {
      fetch: vi.fn(),
    } as unknown as SylvaConnectionManager

    mockBridge = {
      subscribe: vi.fn().mockReturnValue(() => {}),
      dispose: vi.fn(),
    } as unknown as SylvaEventBridge

    context = new ContextFilesystemTree(mockConn, mockBridge)
  })

  it('should have the correct context ID', () => {
    expect(context.getID()).toBe('filesystem-tree')
  })

  it('should report as streamable', () => {
    expect(context.isStreamable()).toBe(true)
  })

  it('should return flattened filesystem tree', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFsResponse,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'filesystem-tree',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    expect(res.rootNodeID).toBe('dir-root')

    const graphData = res.graphData as { nodes: any[]; links: any[] }
    expect(graphData.nodes).toHaveLength(4) // root + docs + README + config
    expect(graphData.links).toHaveLength(3) // root→docs + root→config + docs→README
  })

  it('should pass channelId as query param', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFsResponse,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'filesystem-tree',
      isStream: false,
      params: { channelId: 'ch-001' },
    }

    await context.getData(request)
    expect(mockConn.fetch).toHaveBeenCalledWith(
      '/api/filesystem/tree?channelId=ch-001',
    )
  })

  it('should throw on API error', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'filesystem-tree',
      isStream: false,
      params: {},
    }

    await expect(context.getData(request)).rejects.toThrow('Filesystem tree fetch failed: 500')
  })

  it('should provide data via getDataStream callback', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFsResponse,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'filesystem-tree',
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
