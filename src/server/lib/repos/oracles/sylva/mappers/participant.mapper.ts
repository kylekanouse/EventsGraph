import IGraphNode from '../../../../../domain/IGraphNode'
import type { SylvaParticipant } from '../types'

// --- Group assignments by participant type ---
const PARTICIPANT_TYPE_GROUPS: Record<string, number> = {
  human: 15,
  agent: 16,
  service: 17,
  webhook: 18,
}

// --- Color by participant type ---
const PARTICIPANT_COLORS: Record<string, string> = {
  human: '#00CED1',     // Dark turquoise — human activity
  agent: '#9370DB',     // Medium purple — agent activity
  service: '#4682B4',   // Steel blue — service
  webhook: '#FF8C00',   // Dark orange — webhook
}

/**
 * participantToNode
 *
 * Transforms a Sylva Participant into an IGraphNode.
 *
 * - Group is assigned by participant type
 * - Color reflects participant type
 * - Val is scaled by governance depth
 */
export function participantToNode(
  participant: SylvaParticipant,
): IGraphNode {
  return {
    id: participant.id,
    group: PARTICIPANT_TYPE_GROUPS[participant.participantType] ?? 15,
    label: participant.name,
    val: 20 + participant.governanceDepth * 5,
    desc: [
      `Type: ${participant.participantType}`,
      `Status: ${participant.status}`,
      `Governance Depth: ${participant.governanceDepth}`,
      participant.did ? `DID: ${participant.did}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    icon: '',
    type: participant.participantType,
    url: '',
    color: PARTICIPANT_COLORS[participant.participantType] ?? '#4682B4',
  }
}
