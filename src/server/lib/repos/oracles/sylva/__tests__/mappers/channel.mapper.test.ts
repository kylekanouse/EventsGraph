import { describe, it, expect } from 'vitest'
import { channelToNode, channelMemberLink } from '../../mappers/channel.mapper'
import type { SylvaChannel, SylvaChannelMember } from '../../types'

describe('channel.mapper', () => {
  const mockChannel: SylvaChannel = {
    id: 'ch-001',
    name: 'General',
    description: 'Main channel',
    channelType: 'standard',
    topology: 'mesh',
    governanceTier: 't1',
    visibility: 'public',
    workspaceId: 'ws-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  }

  describe('channelToNode', () => {
    it('should produce a valid IGraphNode', () => {
      const node = channelToNode(mockChannel)
      expect(node.id).toBe('ch-001')
      expect(node.label).toBe('General')
      expect(node.group).toBe(10) // standard = group 10
      expect(node.val).toBe(40) // fixed base size
      expect(node.type).toBe('channel')
      expect(node.color).toBe('#00FF00') // t1 = green
    })

    it('should map all channel types to correct groups', () => {
      const types: Array<{ channelType: SylvaChannel['channelType']; group: number }> = [
        { channelType: 'standard', group: 10 },
        { channelType: 'governed', group: 11 },
        { channelType: 'broadcast', group: 12 },
        { channelType: 'direct', group: 13 },
      ]

      for (const { channelType, group } of types) {
        const node = channelToNode({ ...mockChannel, channelType })
        expect(node.group).toBe(group)
      }
    })

    it('should map governance tiers to correct colors', () => {
      const tiers: Array<{ tier: string; color: string }> = [
        { tier: 't1', color: '#00FF00' },
        { tier: 't2', color: '#FFD700' },
        { tier: 't3', color: '#FF8C00' },
        { tier: 't4', color: '#FF4444' },
      ]

      for (const { tier, color } of tiers) {
        const node = channelToNode({ ...mockChannel, governanceTier: tier })
        expect(node.color).toBe(color)
      }
    })

    it('should use default color for unknown governance tier', () => {
      const node = channelToNode({ ...mockChannel, governanceTier: 'unknown' })
      expect(node.color).toBe('#4682B4')
    })

    it('should handle missing description', () => {
      const noDesc = { ...mockChannel, description: undefined }
      const node = channelToNode(noDesc)
      expect(node.desc).not.toContain('undefined')
    })

    it('should use group 10 as default for unknown channel type', () => {
      const unknownType = { ...mockChannel, channelType: 'unknown' as any }
      expect(channelToNode(unknownType).group).toBe(10)
    })
  })

  describe('channelMemberLink', () => {
    it('should create a membership link', () => {
      const member: SylvaChannelMember = {
        participantId: 'p-1',
        channelId: 'ch-1',
        role: 'admin',
        joinedAt: '2025-01-01T00:00:00Z',
      }
      const link = channelMemberLink(member)
      expect(link.source).toBe('p-1')
      expect(link.target).toBe('ch-1')
      expect(link.label).toBe('admin')
      expect(link.type).toBe('membership')
      expect(link.val).toBe(1)
    })
  })
})
