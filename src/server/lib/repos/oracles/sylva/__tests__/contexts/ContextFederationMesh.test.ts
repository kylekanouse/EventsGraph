import { describe, it, expect, vi, beforeEach } from 'vitest'
import ContextFederationMesh from '../../contexts/ContextFederationMesh'
import { SylvaConnectionManager } from '../../SylvaConnectionManager'
import { SylvaEventBridge } from '../../SylvaEventBridge'
import type { SylvaFederationPeerListResponse } from '../../types'

vi.mock('../../../../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ContextFederationMesh', () => {
  let context: ContextFederationMesh
  let mockConn: SylvaConnectionManager
  let mockBridge: SylvaEventBridge

  const mockPeersResponse: SylvaFederationPeerListResponse = {
    items: [
      {
        id: 'peer-001',
        instanceDid: 'did:sylva:peer-001',
        name: 'Alpha Instance',
        url: 'https://alpha.example.com',
        status: 'connected',
        governanceTier: 't2',
        lastSyncAt: '2025-06-01T12:00:00Z',
        sharedChannels: 3,
        createdAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'peer-002',
        instanceDid: 'did:sylva:peer-002',
        name: 'Beta Instance',
        url: 'https://beta.example.com',
        status: 'disconnected',
        governanceTier: 't1',
        sharedChannels: 1,
        createdAt: '2025-02-01T00:00:00Z',
      },
    ],
    total: 2,
  }

  beforeEach(() => {
    mockConn = {
      fetch: vi.fn(),
    } as unknown as SylvaConnectionManager

    mockBridge = {
      subscribe: vi.fn().mockReturnValue(() => {}),
      dispose: vi.fn(),
    } as unknown as SylvaEventBridge

    context = new ContextFederationMesh(mockConn, mockBridge)
  })

  it('should have the correct context ID', () => {
    expect(context.getID()).toBe('federation-mesh')
  })

  it('should report as streamable', () => {
    expect(context.isStreamable()).toBe(true)
  })

  it('should return local instance node plus peer nodes', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPeersResponse,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'federation-mesh',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    expect(res.rootNodeID).toBe('local-instance')

    const graphData = res.graphData as { nodes: any[]; links: any[] }
    expect(graphData.nodes).toHaveLength(3) // local + 2 peers
    expect(graphData.links).toHaveLength(2) // 2 federation links

    // Verify local instance node
    const localNode = graphData.nodes.find((n: any) => n.id === 'local-instance')
    expect(localNode).toBeDefined()
    expect(localNode.type).toBe('instance')
    expect(localNode.val).toBe(60)

    // Verify peer links point from local to peers
    for (const link of graphData.links) {
      expect(link.source).toBe('local-instance')
      expect(link.type).toBe('federation')
    }
  })

  it('should handle empty peers list', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'federation-mesh',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    const graphData = res.graphData as { nodes: any[]; links: any[] }
    expect(graphData.nodes).toHaveLength(1) // just local
    expect(graphData.links).toHaveLength(0)
  })

  it('should throw on API error', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'federation-mesh',
      isStream: false,
      params: {},
    }

    await expect(context.getData(request)).rejects.toThrow('Federation peers fetch failed: 500')
  })

  it('should provide data via getDataStream callback', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPeersResponse,
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'federation-mesh',
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
