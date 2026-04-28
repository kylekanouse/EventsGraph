import IGraphNode from '../../../../../domain/IGraphNode'
import IGraphLink from '../../../../../domain/IGraphLink'
import type { SylvaGPA } from '../types'

// --- Group assignments by GPA status ---
const STATUS_GROUPS: Record<string, number> = {
  deployed: 1,
  running: 2,
  paused: 3,
  stopped: 4,
  expired: 5,
}

// --- Color assignments by GPA status ---
const STATUS_COLORS: Record<string, string> = {
  deployed: '#4682B4',   // Steel blue
  running: '#00FF00',    // Green — active
  paused: '#FFD700',     // Gold — warning
  stopped: '#FF4444',    // Red — error
  expired: '#666666',    // Gray — inactive
}

/**
 * gpaToNode
 *
 * Transforms a Sylva GPA registration into an IGraphNode.
 *
 * - Node size (val) is derived from remaining execution budget percentage
 * - Color reflects GPA status
 * - Group is assigned by status for clustering in the force layout
 */
export function gpaToNode(gpa: SylvaGPA): IGraphNode {
  const budgetRemaining = gpa.executionBudgetTotal - gpa.executionBudgetUsed
  const budgetPct =
    gpa.executionBudgetTotal > 0
      ? (budgetRemaining / gpa.executionBudgetTotal) * 100
      : 0

  return {
    id: gpa.id,
    group: STATUS_GROUPS[gpa.status] ?? 1,
    label: gpa.name,
    val: Math.max(10, Math.min(80, budgetPct)),
    desc: [
      gpa.description ?? '',
      `Status: ${gpa.status}`,
      `Budget: ${gpa.executionBudgetUsed}/${gpa.executionBudgetTotal}`,
      `Role: ${gpa.agentRole ?? 'default'}`,
      gpa.scheduleType ? `Schedule: ${gpa.scheduleType}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    icon: '',
    type: gpa.scheduleType === 'event-driven' ? 'agent' : 'service',
    url: '',
    color: STATUS_COLORS[gpa.status],
  }
}

/**
 * gpaDelegationLink
 *
 * Creates a link representing a delegation relationship
 * from a parent GPA to a child GPA.
 */
export function gpaDelegationLink(
  parentId: string,
  childId: string,
): IGraphLink {
  return {
    source: parentId,
    target: childId,
    label: 'delegates',
    val: 1,
    type: 'delegation',
  }
}

/**
 * gpaChannelLink
 *
 * Creates a link from a GPA to its assigned channel.
 */
export function gpaChannelLink(gpaId: string, channelId: string): IGraphLink {
  return {
    source: gpaId,
    target: channelId,
    label: 'assigned-to',
    val: 1,
    type: 'assignment',
  }
}
