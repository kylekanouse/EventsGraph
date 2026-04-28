import { describe, it, expect } from 'vitest'
import {
  federationPeerToNode,
  federationPeerLink,
} from '../../mappers/federation.mapper'
import type { SylvaFederationPeer } from '../../types'

describe('federation.mapper', () => {
  const mockPeer: SylvaFederationPeer = {
    id: 'peer-001',
    instanceDid: 'did:sylva:peer-001',
    name: 'Remote Instance Alpha',
    url: 'https://alpha.sylva.example',
    status: 'connected',
    governanceTier: 't2',
    lastSyncAt: '2025-06-01T12:00:00Z',
    sharedChannels: 5,
    createdAt: '2025-01-01T00:00:00Z',
  }

  describe('federationPeerToNode', () => {
    it('should produce a valid IGraphNode', () => {
      const node = federationPeerToNode(mockPeer)
      expect(node.id).toBe('peer-001')
      expect(node.label).toBe('Remote Instance Alpha')
      expect(node.type).toBe('federation-peer')
    })

    it('should map connected status to green color', () => {
      const node = federationPeerToNode(mockPeer)
      expect(node.color).toBe('#00FF00')
      expect(node.group).toBe(37)
    })

    it('should map disconnected status to red color', () => {
      const disc = { ...mockPeer, status: 'disconnected' as const }
      const node = federationPeerToNode(disc)
      expect(node.color).toBe('#FF4444')
      expect(node.group).toBe(38)
    })

    it('should map pending status to gold color', () => {
      const pending = { ...mockPeer, status: 'pending' as const }
      const node = federationPeerToNode(pending)
      expect(node.color).toBe('#FFD700')
      expect(node.group).toBe(39)
    })

    it('should map rejected status to gray color', () => {
      const rejected = { ...mockPeer, status: 'rejected' as const }
      const node = federationPeerToNode(rejected)
      expect(node.color).toBe('#666666')
      expect(node.group).toBe(40)
    })

    it('should scale val by shared channels', () => {
      const node = federationPeerToNode(mockPeer)
      expect(node.val).toBe(30 + 5 * 3) // 45
    })

    it('should include DID in description', () => {
      const node = federationPeerToNode(mockPeer)
      expect(node.desc).toContain('DID: did:sylva:peer-001')
    })

    it('should include shared channels count', () => {
      const node = federationPeerToNode(mockPeer)
      expect(node.desc).toContain('Shared Channels: 5')
    })

    it('should handle missing lastSyncAt', () => {
      const noSync = { ...mockPeer, lastSyncAt: undefined }
      const node = federationPeerToNode(noSync)
      expect(node.desc).not.toContain('Last Sync')
    })
  })

  describe('federationPeerLink', () => {
    it('should create a federation link with shared channel count', () => {
      const link = federationPeerLink('local', 'peer-001', 5)
      expect(link.source).toBe('local')
      expect(link.target).toBe('peer-001')
      expect(link.label).toBe('5 shared')
      expect(link.type).toBe('federation')
      expect(link.val).toBe(5)
    })

    it('should cap link val at 10', () => {
      const link = federationPeerLink('local', 'peer-001', 20)
      expect(link.val).toBe(10)
    })
  })
})
