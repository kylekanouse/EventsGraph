import { describe, it, expect } from 'vitest'
import {
  receiptToNode,
  receiptToGpaLink,
  receiptToChannelLink,
  receiptChainLink,
} from '../../mappers/receipt.mapper'
import type { SylvaGovernanceReceipt } from '../../types'

describe('receipt.mapper', () => {
  const mockReceipt: SylvaGovernanceReceipt = {
    id: 'rcpt-001',
    gpaId: 'gpa-001',
    channelId: 'ch-001',
    participantId: 'p-001',
    receiptType: 'execution',
    consequence: 'PASS',
    governanceTier: 't2',
    coherenceScore: 0.85,
    details: 'All checks passed',
    parentReceiptId: 'rcpt-000',
    timestamp: '2025-06-01T12:00:00Z',
    createdAt: '2025-06-01T12:00:00Z',
  }

  describe('receiptToNode', () => {
    it('should produce a valid IGraphNode', () => {
      const node = receiptToNode(mockReceipt)
      expect(node.id).toBe('rcpt-001')
      expect(node.label).toBe('execution: PASS')
      expect(node.type).toBe('receipt')
    })

    it('should map PASS consequence to green color', () => {
      const node = receiptToNode(mockReceipt)
      expect(node.color).toBe('#00FF00')
      expect(node.group).toBe(20)
    })

    it('should map FAIL consequence to red color', () => {
      const failReceipt = { ...mockReceipt, consequence: 'FAIL' as const }
      const node = receiptToNode(failReceipt)
      expect(node.color).toBe('#FF4444')
      expect(node.group).toBe(21)
    })

    it('should map WARN consequence to gold color', () => {
      const warnReceipt = { ...mockReceipt, consequence: 'WARN' as const }
      const node = receiptToNode(warnReceipt)
      expect(node.color).toBe('#FFD700')
      expect(node.group).toBe(22)
    })

    it('should map INFO consequence to blue color', () => {
      const infoReceipt = { ...mockReceipt, consequence: 'INFO' as const }
      const node = receiptToNode(infoReceipt)
      expect(node.color).toBe('#00BFFF')
      expect(node.group).toBe(23)
    })

    it('should scale val by coherence score', () => {
      const node = receiptToNode(mockReceipt) // 0.85 * 60 = 51
      expect(node.val).toBe(51)
    })

    it('should use default val of 25 when coherence score is undefined', () => {
      const noScore = { ...mockReceipt, coherenceScore: undefined }
      const node = receiptToNode(noScore)
      expect(node.val).toBe(25)
    })

    it('should clamp val to minimum 10 for low coherence scores', () => {
      const lowScore = { ...mockReceipt, coherenceScore: 0.01 }
      const node = receiptToNode(lowScore)
      expect(node.val).toBe(10)
    })

    it('should include coherence percentage in description', () => {
      const node = receiptToNode(mockReceipt)
      expect(node.desc).toContain('Coherence: 85%')
    })

    it('should include receipt type icon', () => {
      const node = receiptToNode(mockReceipt)
      expect(node.icon).toBe('execution')
    })
  })

  describe('receiptToGpaLink', () => {
    it('should create a link from GPA to receipt', () => {
      const link = receiptToGpaLink(mockReceipt)
      expect(link.source).toBe('gpa-001')
      expect(link.target).toBe('rcpt-001')
      expect(link.label).toBe('produced')
      expect(link.type).toBe('production')
    })
  })

  describe('receiptToChannelLink', () => {
    it('should create a link from receipt to channel', () => {
      const link = receiptToChannelLink(mockReceipt)
      expect(link.source).toBe('rcpt-001')
      expect(link.target).toBe('ch-001')
      expect(link.label).toBe('governs')
      expect(link.type).toBe('governance')
    })
  })

  describe('receiptChainLink', () => {
    it('should create a chain link between receipts', () => {
      const link = receiptChainLink('rcpt-000', 'rcpt-001')
      expect(link.source).toBe('rcpt-000')
      expect(link.target).toBe('rcpt-001')
      expect(link.label).toBe('precedes')
      expect(link.type).toBe('chain')
    })
  })
})
