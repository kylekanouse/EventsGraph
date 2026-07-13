import { describe, it, expect } from 'vitest'
import { gpaToNode, gpaDelegationLink, gpaChannelLink } from '../../mappers/gpa.mapper'
import type { SylvaGPA } from '../../types'

describe('gpa.mapper', () => {
  const mockGPA: SylvaGPA = {
    id: 'gpa-001',
    name: 'Test Agent',
    description: 'A test GPA',
    status: 'running',
    parentGpaId: undefined,
    workspaceId: 'ws-1',
    channelId: 'ch-1',
    agentRole: 'analyst',
    scheduleType: 'event-driven',
    executionBudgetTotal: 100,
    executionBudgetUsed: 25,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  }

  describe('gpaToNode', () => {
    it('should produce a valid IGraphNode', () => {
      const node = gpaToNode(mockGPA)
      expect(node.id).toBe('gpa-001')
      expect(node.label).toBe('Test Agent')
      expect(node.group).toBe(2) // running = group 2
      expect(node.color).toBe('#00FF00') // running = green
      expect(node.type).toBe('agent') // event-driven = agent
    })

    it('should set type to service for non event-driven GPAs', () => {
      const scheduledGPA = { ...mockGPA, scheduleType: 'scheduled' as const }
      const node = gpaToNode(scheduledGPA)
      expect(node.type).toBe('service')
    })

    it('should clamp val to minimum of 10 when budget is zero', () => {
      const zeroBudget = { ...mockGPA, executionBudgetTotal: 0 }
      expect(gpaToNode(zeroBudget).val).toBe(10)
    })

    it('should clamp val to maximum of 80 when budget is full', () => {
      const fullBudget = { ...mockGPA, executionBudgetUsed: 0 }
      expect(gpaToNode(fullBudget).val).toBe(80) // 100% remaining, clamped to max 80
    })

    it('should use group 1 as default for unknown status', () => {
      const unknownStatus = { ...mockGPA, status: 'unknown' as any }
      expect(gpaToNode(unknownStatus).group).toBe(1)
    })

    it('should handle missing optional fields gracefully', () => {
      const minimalGPA: SylvaGPA = {
        id: 'gpa-min',
        name: 'Minimal',
        status: 'deployed',
        workspaceId: 'ws-1',
        executionBudgetTotal: 50,
        executionBudgetUsed: 50,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }
      const node = gpaToNode(minimalGPA)
      expect(node.id).toBe('gpa-min')
      expect(node.label).toBe('Minimal')
      expect(node.group).toBe(1) // deployed = group 1
      expect(node.color).toBe('#4682B4') // deployed = steel blue
      expect(node.type).toBe('service') // no scheduleType = service
    })

    it('should map all known statuses to correct groups and colors', () => {
      const statuses: Array<{ status: SylvaGPA['status']; group: number; color: string }> = [
        { status: 'deployed', group: 1, color: '#4682B4' },
        { status: 'running', group: 2, color: '#00FF00' },
        { status: 'paused', group: 3, color: '#FFD700' },
        { status: 'stopped', group: 4, color: '#FF4444' },
        { status: 'expired', group: 5, color: '#666666' },
      ]

      for (const { status, group, color } of statuses) {
        const node = gpaToNode({ ...mockGPA, status })
        expect(node.group).toBe(group)
        expect(node.color).toBe(color)
      }
    })
  })

  describe('gpaDelegationLink', () => {
    it('should create a delegation link', () => {
      const link = gpaDelegationLink('parent-1', 'child-1')
      expect(link.source).toBe('parent-1')
      expect(link.target).toBe('child-1')
      expect(link.label).toBe('delegates')
      expect(link.type).toBe('delegation')
      expect(link.val).toBe(1)
    })
  })

  describe('gpaChannelLink', () => {
    it('should create an assignment link', () => {
      const link = gpaChannelLink('gpa-1', 'ch-1')
      expect(link.source).toBe('gpa-1')
      expect(link.target).toBe('ch-1')
      expect(link.label).toBe('assigned-to')
      expect(link.type).toBe('assignment')
      expect(link.val).toBe(1)
    })
  })
})
