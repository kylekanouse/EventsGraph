import { describe, it, expect } from 'vitest'
import {
  coherenceToNode,
  coherenceProximityLinks,
} from '../../mappers/coherence.mapper'
import type { SylvaCoherenceDataPoint } from '../../types'

describe('coherence.mapper', () => {
  const mockDataPoint: SylvaCoherenceDataPoint = {
    entityId: 'gpa-001',
    entityType: 'gpa',
    entityName: 'Test Agent',
    coherenceScore: 0.85,
    trajectory: 'improving',
    measurementCount: 42,
    lastMeasuredAt: '2025-06-01T12:00:00Z',
  }

  describe('coherenceToNode', () => {
    it('should produce a valid IGraphNode', () => {
      const node = coherenceToNode(mockDataPoint)
      expect(node.id).toBe('gpa-001')
      expect(node.label).toBe('Test Agent (85%)')
      expect(node.type).toBe('coherence-gpa')
    })

    it('should map improving trajectory to green color', () => {
      const node = coherenceToNode(mockDataPoint)
      expect(node.color).toBe('#00FF00')
    })

    it('should map stable trajectory to gold color', () => {
      const stable = { ...mockDataPoint, trajectory: 'stable' as const }
      const node = coherenceToNode(stable)
      expect(node.color).toBe('#FFD700')
    })

    it('should map declining trajectory to red color', () => {
      const declining = { ...mockDataPoint, trajectory: 'declining' as const }
      const node = coherenceToNode(declining)
      expect(node.color).toBe('#FF4444')
    })

    it('should assign correct group for GPA entity type', () => {
      const node = coherenceToNode(mockDataPoint)
      expect(node.group).toBe(25)
    })

    it('should assign correct group for channel entity type', () => {
      const channel = { ...mockDataPoint, entityType: 'channel' as const }
      const node = coherenceToNode(channel)
      expect(node.group).toBe(26)
    })

    it('should assign correct group for participant entity type', () => {
      const participant = { ...mockDataPoint, entityType: 'participant' as const }
      const node = coherenceToNode(participant)
      expect(node.group).toBe(27)
    })

    it('should scale val by coherence score', () => {
      const node = coherenceToNode(mockDataPoint) // 85 * 0.7 = 59.5
      expect(node.val).toBeGreaterThanOrEqual(10)
      expect(node.val).toBeLessThanOrEqual(70)
    })

    it('should clamp val to minimum 10 for very low scores', () => {
      const lowScore = { ...mockDataPoint, coherenceScore: 0.01 }
      const node = coherenceToNode(lowScore)
      expect(node.val).toBe(10)
    })

    it('should include measurement count in description', () => {
      const node = coherenceToNode(mockDataPoint)
      expect(node.desc).toContain('Measurements: 42')
    })
  })

  describe('coherenceProximityLinks', () => {
    it('should create links between entities within threshold', () => {
      const points: SylvaCoherenceDataPoint[] = [
        { ...mockDataPoint, entityId: 'a', coherenceScore: 0.80 },
        { ...mockDataPoint, entityId: 'b', coherenceScore: 0.85 },
        { ...mockDataPoint, entityId: 'c', coherenceScore: 0.50 },
      ]
      const links = coherenceProximityLinks(points, 0.1)
      // a↔b: diff=0.05 ≤ 0.1 → linked
      // a↔c: diff=0.30 > 0.1 → not linked
      // b↔c: diff=0.35 > 0.1 → not linked
      expect(links).toHaveLength(1)
      expect(links[0].source).toBe('a')
      expect(links[0].target).toBe('b')
      expect(links[0].type).toBe('coherence-proximity')
    })

    it('should return no links when all scores are far apart', () => {
      const points: SylvaCoherenceDataPoint[] = [
        { ...mockDataPoint, entityId: 'a', coherenceScore: 0.10 },
        { ...mockDataPoint, entityId: 'b', coherenceScore: 0.90 },
      ]
      const links = coherenceProximityLinks(points, 0.1)
      expect(links).toHaveLength(0)
    })

    it('should use default threshold of 0.1', () => {
      const points: SylvaCoherenceDataPoint[] = [
        { ...mockDataPoint, entityId: 'a', coherenceScore: 0.80 },
        { ...mockDataPoint, entityId: 'b', coherenceScore: 0.89 },
      ]
      const links = coherenceProximityLinks(points)
      expect(links).toHaveLength(1)
    })

    it('should handle empty array', () => {
      const links = coherenceProximityLinks([])
      expect(links).toHaveLength(0)
    })

    it('should scale link val by proximity', () => {
      const points: SylvaCoherenceDataPoint[] = [
        { ...mockDataPoint, entityId: 'a', coherenceScore: 0.80 },
        { ...mockDataPoint, entityId: 'b', coherenceScore: 0.80 },
      ]
      const links = coherenceProximityLinks(points, 0.1)
      expect(links[0].val).toBe(5) // diff=0 → (1 - 0/0.1) * 5 = 5
    })

    it('should include delta percentage in label', () => {
      const points: SylvaCoherenceDataPoint[] = [
        { ...mockDataPoint, entityId: 'a', coherenceScore: 0.80 },
        { ...mockDataPoint, entityId: 'b', coherenceScore: 0.85 },
      ]
      const links = coherenceProximityLinks(points, 0.1)
      expect(links[0].label).toBe('Δ5%')
    })
  })
})
