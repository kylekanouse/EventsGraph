import { describe, it, expect } from 'vitest'
import {
  executionToNode,
  stepToNode,
  stepSequenceLink,
  executionToStepLink,
} from '../../mappers/step.mapper'
import type { SylvaExecution, SylvaExecutionStep } from '../../types'

describe('step.mapper', () => {
  const mockStep: SylvaExecutionStep = {
    id: 'step-001',
    executionId: 'exec-001',
    stepType: 'guard',
    name: 'Check permissions',
    status: 'completed',
    consequence: 'PASS',
    duration: 250,
    order: 1,
    details: 'Permission check OK',
  }

  const mockExecution: SylvaExecution = {
    id: 'exec-001',
    gpaId: 'gpa-001',
    status: 'completed',
    startedAt: '2025-06-01T12:00:00Z',
    completedAt: '2025-06-01T12:01:00Z',
    consequence: 'PASS',
    steps: [mockStep],
  }

  describe('executionToNode', () => {
    it('should produce a valid IGraphNode', () => {
      const node = executionToNode(mockExecution)
      expect(node.id).toBe('exec-001')
      expect(node.label).toBe('Execution completed')
      expect(node.type).toBe('execution')
      expect(node.val).toBe(50)
    })

    it('should color green for PASS consequence', () => {
      const node = executionToNode(mockExecution)
      expect(node.color).toBe('#00FF00')
    })

    it('should color red for FAIL consequence', () => {
      const failExec = { ...mockExecution, consequence: 'FAIL' as const }
      const node = executionToNode(failExec)
      expect(node.color).toBe('#FF4444')
    })

    it('should color blue when no consequence', () => {
      const runningExec = { ...mockExecution, consequence: undefined, status: 'running' as const }
      const node = executionToNode(runningExec)
      expect(node.color).toBe('#00BFFF')
    })

    it('should include step count in description', () => {
      const node = executionToNode(mockExecution)
      expect(node.desc).toContain('Steps: 1')
    })
  })

  describe('stepToNode', () => {
    it('should produce a valid IGraphNode', () => {
      const node = stepToNode(mockStep)
      expect(node.id).toBe('step-001')
      expect(node.label).toBe('Check permissions')
      expect(node.type).toBe('guard')
    })

    it('should assign correct group for guard step type', () => {
      const node = stepToNode(mockStep)
      expect(node.group).toBe(30)
    })

    it('should assign correct group for action step type', () => {
      const actionStep = { ...mockStep, stepType: 'action' as const }
      const node = stepToNode(actionStep)
      expect(node.group).toBe(31)
    })

    it('should color by status', () => {
      expect(stepToNode({ ...mockStep, status: 'completed' }).color).toBe('#00FF00')
      expect(stepToNode({ ...mockStep, status: 'failed' }).color).toBe('#FF4444')
      expect(stepToNode({ ...mockStep, status: 'running' }).color).toBe('#00BFFF')
      expect(stepToNode({ ...mockStep, status: 'pending' }).color).toBe('#666666')
      expect(stepToNode({ ...mockStep, status: 'skipped' }).color).toBe('#999999')
    })

    it('should scale val by duration', () => {
      const node = stepToNode(mockStep) // 250/100 = 2.5 → clamped to 10
      expect(node.val).toBeGreaterThanOrEqual(10)
    })

    it('should use default val of 20 when no duration', () => {
      const noDuration = { ...mockStep, duration: undefined }
      const node = stepToNode(noDuration)
      expect(node.val).toBe(20)
    })

    it('should include duration in description', () => {
      const node = stepToNode(mockStep)
      expect(node.desc).toContain('Duration: 250ms')
    })
  })

  describe('stepSequenceLink', () => {
    it('should create a sequence link between steps', () => {
      const link = stepSequenceLink('step-001', 'step-002')
      expect(link.source).toBe('step-001')
      expect(link.target).toBe('step-002')
      expect(link.label).toBe('then')
      expect(link.type).toBe('sequence')
    })
  })

  describe('executionToStepLink', () => {
    it('should create a starts link from execution to first step', () => {
      const link = executionToStepLink('exec-001', 'step-001')
      expect(link.source).toBe('exec-001')
      expect(link.target).toBe('step-001')
      expect(link.label).toBe('starts')
      expect(link.type).toBe('starts')
    })
  })
})
