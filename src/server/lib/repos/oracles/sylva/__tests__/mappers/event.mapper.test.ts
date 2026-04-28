import { describe, it, expect } from 'vitest'
import { sylvaSSEToEventData } from '../../mappers/event.mapper'
import type { SylvaSSEEvent } from '../../SylvaEventBridge'

describe('event.mapper', () => {
  describe('sylvaSSEToEventData', () => {
    it('should transform a governance.receipt event', () => {
      const sseEvent: SylvaSSEEvent = {
        type: 'governance.receipt',
        data: {
          id: 'receipt-001',
          sourceId: 'gpa-001',
          targetId: 'ch-001',
          timestamp: '2025-06-01T12:00:00Z',
        },
      }

      const result = sylvaSSEToEventData(sseEvent)
      expect(result).not.toBeNull()
      expect(result!.action).toBe('receipt-produced')
      expect(result!.source).toBe('gpa-001')
      expect(result!.target).toBe('ch-001')
      expect(result!.category).toBe('governance')
      expect(result!.type).toBe('governance.receipt')
      expect(result!.id).toBe('receipt-001')
    })

    it('should transform a governance.coherence event with score', () => {
      const sseEvent: SylvaSSEEvent = {
        type: 'governance.coherence',
        data: {
          gpaId: 'gpa-001',
          channelId: 'ch-001',
          coherenceScore: 0.87,
        },
      }

      const result = sylvaSSEToEventData(sseEvent)
      expect(result).not.toBeNull()
      expect(result!.action).toBe('coherence-measured')
      expect(result!.source).toBe('gpa-001')
      expect(result!.target).toBe('ch-001')
      expect(result!.label).toBe('coherence: 87%')
      expect(result!.val).toBe(87)
      expect(result!.category).toBe('governance')
    })

    it('should transform a governance.verification event', () => {
      const sseEvent: SylvaSSEEvent = {
        type: 'governance.verification',
        data: {
          sourceId: 'gpa-002',
          targetId: 'ch-002',
        },
      }

      const result = sylvaSSEToEventData(sseEvent)
      expect(result).not.toBeNull()
      expect(result!.action).toBe('verification-checked')
      expect(result!.source).toBe('gpa-002')
      expect(result!.target).toBe('ch-002')
    })

    it('should transform a governance.alert event', () => {
      const sseEvent: SylvaSSEEvent = {
        type: 'governance.alert',
        data: {
          sourceId: 'gpa-003',
          channelId: 'ch-003',
          consequence: 'CRITICAL',
        },
      }

      const result = sylvaSSEToEventData(sseEvent)
      expect(result).not.toBeNull()
      expect(result!.action).toBe('alert-raised')
      expect(result!.label).toBe('alert: CRITICAL')
      expect(result!.val).toBe(80)
      expect(result!.target).toBe('ch-003')
    })

    it('should transform a governance.lifecycle event', () => {
      const sseEvent: SylvaSSEEvent = {
        type: 'governance.lifecycle',
        data: {
          gpaId: 'gpa-004',
          channelId: 'ch-004',
        },
      }

      const result = sylvaSSEToEventData(sseEvent)
      expect(result).not.toBeNull()
      expect(result!.action).toBe('lifecycle-transition')
      expect(result!.source).toBe('gpa-004')
      expect(result!.target).toBe('ch-004')
      expect(result!.category).toBe('lifecycle')
    })

    it('should transform a gpa.execution.started event', () => {
      const sseEvent: SylvaSSEEvent = {
        type: 'gpa.execution.started',
        data: {
          gpaId: 'gpa-005',
          channelId: 'ch-005',
        },
      }

      const result = sylvaSSEToEventData(sseEvent)
      expect(result).not.toBeNull()
      expect(result!.action).toBe('execution-started')
      expect(result!.source).toBe('gpa-005')
      expect(result!.target).toBe('ch-005')
      expect(result!.category).toBe('execution')
    })

    it('should transform a gpa.execution.completed event with PASS', () => {
      const sseEvent: SylvaSSEEvent = {
        type: 'gpa.execution.completed',
        data: {
          gpaId: 'gpa-002',
          channelId: 'ch-002',
          consequence: 'PASS',
        },
      }

      const result = sylvaSSEToEventData(sseEvent)
      expect(result).not.toBeNull()
      expect(result!.action).toBe('execution-completed')
      expect(result!.source).toBe('gpa-002')
      expect(result!.target).toBe('ch-002')
      expect(result!.val).toBe(30) // PASS = 30
      expect(result!.label).toBe('execution PASS')
    })

    it('should transform a gpa.execution.completed event with FAIL', () => {
      const sseEvent: SylvaSSEEvent = {
        type: 'gpa.execution.completed',
        data: {
          gpaId: 'gpa-002',
          channelId: 'ch-002',
          consequence: 'FAIL',
        },
      }

      const result = sylvaSSEToEventData(sseEvent)
      expect(result).not.toBeNull()
      expect(result!.val).toBe(60) // FAIL = 60
    })

    it('should transform a message.new event', () => {
      const sseEvent: SylvaSSEEvent = {
        type: 'message.new',
        data: {
          participantId: 'p-001',
          channelId: 'ch-001',
        },
      }

      const result = sylvaSSEToEventData(sseEvent)
      expect(result).not.toBeNull()
      expect(result!.action).toBe('message-sent')
      expect(result!.source).toBe('p-001')
      expect(result!.target).toBe('ch-001')
      expect(result!.category).toBe('messaging')
    })

    it('should return null when source is missing', () => {
      const sseEvent: SylvaSSEEvent = {
        type: 'governance.receipt',
        data: { targetId: 'ch-001' },
      }
      expect(sylvaSSEToEventData(sseEvent)).toBeNull()
    })

    it('should return null when target is missing', () => {
      const sseEvent: SylvaSSEEvent = {
        type: 'governance.receipt',
        data: { sourceId: 'gpa-001' },
      }
      expect(sylvaSSEToEventData(sseEvent)).toBeNull()
    })

    it('should handle unknown event types gracefully', () => {
      const sseEvent: SylvaSSEEvent = {
        type: 'custom.unknown',
        data: {
          sourceId: 'src-1',
          targetId: 'tgt-1',
        },
      }

      const result = sylvaSSEToEventData(sseEvent)
      expect(result).not.toBeNull()
      expect(result!.action).toBe('custom.unknown')
      expect(result!.category).toBe('unknown')
      expect(result!.val).toBe(30) // default
    })

    it('should use current timestamp when none provided', () => {
      const before = Date.now()
      const sseEvent: SylvaSSEEvent = {
        type: 'governance.receipt',
        data: {
          sourceId: 'gpa-001',
          targetId: 'ch-001',
        },
      }

      const result = sylvaSSEToEventData(sseEvent)
      const after = Date.now()
      expect(result).not.toBeNull()
      expect(result!.timestamp).toBeGreaterThanOrEqual(before)
      expect(result!.timestamp).toBeLessThanOrEqual(after)
    })

    it('should parse provided timestamp correctly', () => {
      const sseEvent: SylvaSSEEvent = {
        type: 'governance.receipt',
        data: {
          sourceId: 'gpa-001',
          targetId: 'ch-001',
          timestamp: '2025-06-01T12:00:00Z',
        },
      }

      const result = sylvaSSEToEventData(sseEvent)
      expect(result!.timestamp).toBe(new Date('2025-06-01T12:00:00Z').getTime())
    })

    it('should handle governance.coherence with no score', () => {
      const sseEvent: SylvaSSEEvent = {
        type: 'governance.coherence',
        data: {
          gpaId: 'gpa-001',
          channelId: 'ch-001',
        },
      }

      const result = sylvaSSEToEventData(sseEvent)
      expect(result).not.toBeNull()
      expect(result!.label).toBe('coherence measured')
      expect(result!.val).toBe(50) // default when no score
    })

    it('should fallback source ID resolution with gpaId', () => {
      const sseEvent: SylvaSSEEvent = {
        type: 'governance.receipt',
        data: {
          gpaId: 'gpa-fallback',
          targetId: 'ch-001',
        },
      }

      const result = sylvaSSEToEventData(sseEvent)
      expect(result).not.toBeNull()
      expect(result!.source).toBe('gpa-fallback')
    })

    it('should fallback target ID resolution with channelId', () => {
      const sseEvent: SylvaSSEEvent = {
        type: 'governance.receipt',
        data: {
          sourceId: 'gpa-001',
          channelId: 'ch-fallback',
        },
      }

      const result = sylvaSSEToEventData(sseEvent)
      expect(result).not.toBeNull()
      expect(result!.target).toBe('ch-fallback')
    })

    it('should handle governance.link-change event', () => {
      const sseEvent: SylvaSSEEvent = {
        type: 'governance.link-change',
        data: {
          sourceId: 'gpa-006',
          targetId: 'ch-006',
        },
      }

      const result = sylvaSSEToEventData(sseEvent)
      expect(result).not.toBeNull()
      expect(result!.action).toBe('link-changed')
      expect(result!.category).toBe('governance')
    })
  })
})
