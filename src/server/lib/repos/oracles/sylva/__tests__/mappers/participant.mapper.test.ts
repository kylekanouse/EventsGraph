import { describe, it, expect } from 'vitest'
import { participantToNode } from '../../mappers/participant.mapper'
import type { SylvaParticipant } from '../../types'

describe('participant.mapper', () => {
  const mockParticipant: SylvaParticipant = {
    id: 'p-001',
    name: 'Alice',
    participantType: 'human',
    status: 'active',
    governanceDepth: 2,
    workspaceId: 'ws-1',
    did: 'did:pcn:alice',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  }

  describe('participantToNode', () => {
    it('should produce a valid IGraphNode', () => {
      const node = participantToNode(mockParticipant)
      expect(node.id).toBe('p-001')
      expect(node.label).toBe('Alice')
      expect(node.group).toBe(15) // human = group 15
      expect(node.val).toBe(30) // 20 + 2*5
      expect(node.type).toBe('human')
      expect(node.color).toBe('#00CED1') // human = dark turquoise
    })

    it('should scale val by governance depth', () => {
      const deepParticipant = { ...mockParticipant, governanceDepth: 10 }
      const node = participantToNode(deepParticipant)
      expect(node.val).toBe(70) // 20 + 10*5
    })

    it('should map all participant types to correct groups and colors', () => {
      const types: Array<{
        type: SylvaParticipant['participantType']
        group: number
        color: string
      }> = [
        { type: 'human', group: 15, color: '#00CED1' },
        { type: 'agent', group: 16, color: '#9370DB' },
        { type: 'service', group: 17, color: '#4682B4' },
        { type: 'webhook', group: 18, color: '#FF8C00' },
      ]

      for (const { type, group, color } of types) {
        const node = participantToNode({ ...mockParticipant, participantType: type })
        expect(node.group).toBe(group)
        expect(node.color).toBe(color)
      }
    })

    it('should use group 15 as default for unknown participant type', () => {
      const unknown = { ...mockParticipant, participantType: 'unknown' as any }
      expect(participantToNode(unknown).group).toBe(15)
    })

    it('should use default color for unknown participant type', () => {
      const unknown = { ...mockParticipant, participantType: 'unknown' as any }
      expect(participantToNode(unknown).color).toBe('#4682B4')
    })

    it('should handle missing DID', () => {
      const noDid = { ...mockParticipant, did: undefined }
      const node = participantToNode(noDid)
      expect(node.desc).not.toContain('DID:')
      expect(node.desc).not.toContain('undefined')
    })

    it('should include DID in description when present', () => {
      const node = participantToNode(mockParticipant)
      expect(node.desc).toContain('DID: did:pcn:alice')
    })
  })
})
