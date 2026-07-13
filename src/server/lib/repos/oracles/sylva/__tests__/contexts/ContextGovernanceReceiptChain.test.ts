import { describe, it, expect, vi, beforeEach } from 'vitest'
import ContextGovernanceReceiptChain from '../../contexts/ContextGovernanceReceiptChain'
import { SylvaConnectionManager } from '../../SylvaConnectionManager'
import { SylvaEventBridge } from '../../SylvaEventBridge'
import type { SylvaReceiptListResponse } from '../../types'

vi.mock('../../../../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ContextGovernanceReceiptChain', () => {
  let context: ContextGovernanceReceiptChain
  let mockConn: SylvaConnectionManager
  let mockBridge: SylvaEventBridge

  const mockReceiptResponse: SylvaReceiptListResponse = {
    items: [
      {
        id: 'rcpt-001',
        gpaId: 'gpa-001',
        channelId: 'ch-001',
        receiptType: 'execution',
        consequence: 'PASS',
        governanceTier: 't2',
        coherenceScore: 0.85,
        timestamp: '2025-06-01T12:00:00Z',
        createdAt: '2025-06-01T12:00:00Z',
      },
      {
        id: 'rcpt-002',
        gpaId: 'gpa-001',
        channelId: 'ch-001',
        receiptType: 'verification',
        consequence: 'WARN',
        governanceTier: 't2',
        parentReceiptId: 'rcpt-001',
        timestamp: '2025-06-01T12:01:00Z',
        createdAt: '2025-06-01T12:01:00Z',
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

    context = new ContextGovernanceReceiptChain(mockConn, mockBridge)
  })

  it('should have the correct context ID', () => {
    expect(context.getID()).toBe('governance-receipt-chain')
  })

  it('should report as streamable', () => {
    expect(context.isStreamable()).toBe(true)
  })

  it('should return receipt nodes and links', async () => {
    vi.mocked(mockConn.fetch).mockImplementation(async (path: string) => {
      if (path.startsWith('/api/governance/receipts')) {
        return { ok: true, json: async () => mockReceiptResponse } as Response
      }
      // Anchor node fetches return 404
      return { ok: false, status: 404 } as Response
    })

    const request = {
      collection: 'sylva',
      context: 'governance-receipt-chain',
      isStream: false,
      params: { gpaId: 'gpa-001' },
    }

    const res = await context.getData(request)
    expect(res.collection).toBe('sylva')
    expect(res.context).toBe('governance-receipt-chain')

    const graphData = res.graphData as { nodes: any[]; links: any[] }
    expect(graphData.nodes).toHaveLength(2) // 2 receipts, anchor fetches failed
    expect(graphData.links.length).toBeGreaterThanOrEqual(4) // 2 gpa + 2 channel links
    // Plus 1 chain link (rcpt-002 → rcpt-001)
    const chainLink = graphData.links.find((l: any) => l.type === 'chain')
    expect(chainLink).toBeDefined()
    expect(chainLink.source).toBe('rcpt-001')
    expect(chainLink.target).toBe('rcpt-002')
  })

  it('should handle empty receipt response', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'governance-receipt-chain',
      isStream: false,
      params: {},
    }

    const res = await context.getData(request)
    const graphData = res.graphData as { nodes: any[]; links: any[] }
    expect(graphData.nodes).toHaveLength(0)
    expect(graphData.links).toHaveLength(0)
  })

  it('should throw on API error', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Server Error',
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'governance-receipt-chain',
      isStream: false,
      params: {},
    }

    await expect(context.getData(request)).rejects.toThrow('Sylva receipts fetch failed: 500')
  })

  it('should pass filter params as query string', async () => {
    vi.mocked(mockConn.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    } as Response)

    const request = {
      collection: 'sylva',
      context: 'governance-receipt-chain',
      isStream: false,
      params: { gpaId: 'gpa-001', channelId: 'ch-001', limit: 50 },
    }

    await context.getData(request)
    expect(mockConn.fetch).toHaveBeenCalledWith(
      expect.stringContaining('gpaId=gpa-001'),
    )
    expect(mockConn.fetch).toHaveBeenCalledWith(
      expect.stringContaining('channelId=ch-001'),
    )
    expect(mockConn.fetch).toHaveBeenCalledWith(
      expect.stringContaining('limit=50'),
    )
  })

  it('should provide data via getDataStream callback', async () => {
    vi.mocked(mockConn.fetch).mockImplementation(async (path: string) => {
      if (path.startsWith('/api/governance/receipts')) {
        return { ok: true, json: async () => mockReceiptResponse } as Response
      }
      return { ok: false, status: 404 } as Response
    })

    const request = {
      collection: 'sylva',
      context: 'governance-receipt-chain',
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
