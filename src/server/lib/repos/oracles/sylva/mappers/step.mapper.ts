import IGraphNode from '../../../../../domain/IGraphNode'
import IGraphLink from '../../../../../domain/IGraphLink'
import type { SylvaExecution, SylvaExecutionStep } from '../types'

const STEP_TYPE_GROUPS: Record<string, number> = {
  guard: 30,
  action: 31,
  verification: 32,
  emit: 33,
  observe: 34,
}

const STEP_STATUS_COLORS: Record<string, string> = {
  pending: '#666666',
  running: '#00BFFF',
  completed: '#00FF00',
  failed: '#FF4444',
  skipped: '#999999',
}

/**
 * executionToNode
 *
 * Transforms an execution into a root node for the execution tree.
 */
export function executionToNode(execution: SylvaExecution): IGraphNode {
  return {
    id: execution.id,
    group: 0,
    label: `Execution ${execution.status}`,
    val: 50,
    desc: [
      `GPA: ${execution.gpaId}`,
      `Status: ${execution.status}`,
      `Started: ${execution.startedAt}`,
      execution.completedAt ? `Completed: ${execution.completedAt}` : '',
      execution.consequence ? `Result: ${execution.consequence}` : '',
      `Steps: ${execution.steps.length}`,
    ]
      .filter(Boolean)
      .join('\n'),
    icon: '',
    type: 'execution',
    url: '',
    color: execution.consequence === 'PASS' ? '#00FF00' : execution.consequence === 'FAIL' ? '#FF4444' : '#00BFFF',
  }
}

/**
 * stepToNode
 *
 * Transforms an execution step into a graph node.
 */
export function stepToNode(step: SylvaExecutionStep): IGraphNode {
  return {
    id: step.id,
    group: STEP_TYPE_GROUPS[step.stepType] ?? 30,
    label: step.name,
    val: step.duration ? Math.max(10, Math.min(50, step.duration / 100)) : 20,
    desc: [
      `Type: ${step.stepType}`,
      `Status: ${step.status}`,
      step.consequence ? `Result: ${step.consequence}` : '',
      step.duration !== undefined ? `Duration: ${step.duration}ms` : '',
      step.details ?? '',
    ]
      .filter(Boolean)
      .join('\n'),
    icon: '',
    type: step.stepType,
    url: '',
    color: STEP_STATUS_COLORS[step.status] ?? '#666666',
  }
}

/**
 * stepSequenceLink
 *
 * Creates a link between sequential steps in the execution pipeline.
 */
export function stepSequenceLink(fromStepId: string, toStepId: string): IGraphLink {
  return {
    source: fromStepId,
    target: toStepId,
    label: 'then',
    val: 1,
    type: 'sequence',
  }
}

/**
 * executionToStepLink
 *
 * Creates a link from the execution root node to its first step.
 */
export function executionToStepLink(executionId: string, stepId: string): IGraphLink {
  return {
    source: executionId,
    target: stepId,
    label: 'starts',
    val: 1,
    type: 'starts',
  }
}
