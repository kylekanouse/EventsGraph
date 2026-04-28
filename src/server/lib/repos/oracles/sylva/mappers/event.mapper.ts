import IEventData from '../../../../../domain/IEventData'
import type { SylvaSSEEvent } from '../SylvaEventBridge'

/**
 * EVENT_CATEGORIES
 *
 * Maps Sylva SSE event types to EventsGraph event categories.
 */
const EVENT_CATEGORIES: Record<string, string> = {
  'governance.receipt': 'governance',
  'governance.coherence': 'governance',
  'governance.verification': 'governance',
  'governance.alert': 'governance',
  'governance.lifecycle': 'lifecycle',
  'governance.link-change': 'governance',
  'gpa.execution.started': 'execution',
  'gpa.execution.completed': 'execution',
  'message.new': 'messaging',
}

/**
 * EVENT_ACTIONS
 *
 * Maps Sylva SSE event types to human-readable action labels
 * used for VR particle animation labeling.
 */
const EVENT_ACTIONS: Record<string, string> = {
  'governance.receipt': 'receipt-produced',
  'governance.coherence': 'coherence-measured',
  'governance.verification': 'verification-checked',
  'governance.alert': 'alert-raised',
  'governance.lifecycle': 'lifecycle-transition',
  'governance.link-change': 'link-changed',
  'gpa.execution.started': 'execution-started',
  'gpa.execution.completed': 'execution-completed',
  'message.new': 'message-sent',
}

/**
 * sylvaSSEToEventData
 *
 * Transforms a raw Sylva SSE event into an IEventData.
 *
 * Returns null if the event cannot be meaningfully transformed
 * (e.g., missing source/target identifiers).
 */
export function sylvaSSEToEventData(sseEvent: SylvaSSEEvent): IEventData | null {
  const { type, data } = sseEvent

  // Determine source and target IDs from the event data
  const source = _resolveSourceId(type, data)
  const target = _resolveTargetId(type, data)

  // Both source and target are required for VR particle animation
  if (!source || !target) {
    return null
  }

  return {
    action: EVENT_ACTIONS[type] || type,
    source,
    target,
    id: data.id,
    category: EVENT_CATEGORIES[type] || 'unknown',
    label: _buildEventLabel(type, data),
    val: _resolveEventValue(type, data),
    type: type,
    timestamp: data.timestamp ? new Date(data.timestamp).getTime() : Date.now(),
  }
}

/**
 * _resolveSourceId
 *
 * Determines the source node ID for the event animation.
 * The "source" is the originator of the action.
 */
function _resolveSourceId(type: string, data: SylvaSSEEvent['data']): string | undefined {
  switch (type) {
    case 'governance.receipt':
    case 'governance.verification':
    case 'governance.alert':
    case 'governance.link-change':
      return data.sourceId || data.gpaId || data.participantId

    case 'governance.coherence':
      return data.gpaId || data.channelId

    case 'governance.lifecycle':
      return data.gpaId

    case 'gpa.execution.started':
    case 'gpa.execution.completed':
      return data.gpaId

    case 'message.new':
      return data.participantId || data.sourceId

    default:
      return data.sourceId || data.gpaId || data.participantId
  }
}

/**
 * _resolveTargetId
 *
 * Determines the target node ID for the event animation.
 * The "target" is the recipient or destination of the action.
 */
function _resolveTargetId(type: string, data: SylvaSSEEvent['data']): string | undefined {
  switch (type) {
    case 'governance.receipt':
    case 'governance.verification':
    case 'governance.link-change':
      return data.targetId || data.channelId

    case 'governance.alert':
      return data.channelId || data.targetId

    case 'governance.coherence':
      return data.channelId || data.gpaId

    case 'governance.lifecycle':
      return data.channelId || data.gpaId

    case 'gpa.execution.started':
    case 'gpa.execution.completed':
      return data.channelId || data.targetId

    case 'message.new':
      return data.channelId || data.targetId

    default:
      return data.targetId || data.channelId
  }
}

/**
 * _buildEventLabel
 *
 * Creates a short descriptive label for the event.
 */
function _buildEventLabel(type: string, data: SylvaSSEEvent['data']): string {
  switch (type) {
    case 'governance.coherence':
      return data.coherenceScore !== undefined
        ? `coherence: ${(data.coherenceScore * 100).toFixed(0)}%`
        : 'coherence measured'

    case 'governance.alert':
      return `alert: ${data.consequence || 'unknown'}`

    case 'gpa.execution.completed':
      return `execution ${data.consequence || 'completed'}`

    default:
      return EVENT_ACTIONS[type] || type
  }
}

/**
 * _resolveEventValue
 *
 * Determines the numeric value for the event (affects VR particle size).
 */
function _resolveEventValue(type: string, data: SylvaSSEEvent['data']): number {
  switch (type) {
    case 'governance.coherence':
      return data.coherenceScore !== undefined
        ? Math.round(data.coherenceScore * 100)
        : 50

    case 'governance.alert':
      return 80 // Alerts are prominent

    case 'gpa.execution.completed':
      return data.consequence === 'PASS' ? 30 : 60

    default:
      return 30
  }
}
