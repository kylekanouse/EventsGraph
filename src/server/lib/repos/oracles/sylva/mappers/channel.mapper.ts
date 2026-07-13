import IGraphNode from '../../../../../domain/IGraphNode'
import IGraphLink from '../../../../../domain/IGraphLink'
import type { SylvaChannel, SylvaChannelMember } from '../types'

// --- Group assignments by channel type ---
const CHANNEL_TYPE_GROUPS: Record<string, number> = {
  standard: 10,
  governed: 11,
  broadcast: 12,
  direct: 13,
}

// --- Color by governance tier ---
const TIER_COLORS: Record<string, string> = {
  t1: '#00FF00',    // Low governance — green
  t2: '#FFD700',    // Medium — gold
  t3: '#FF8C00',    // High — orange
  t4: '#FF4444',    // Critical — red
}

/**
 * channelToNode
 *
 * Transforms a Sylva Channel into an IGraphNode.
 *
 * - Group is assigned by channel type
 * - Color reflects governance tier
 * - Val is a fixed base size (channels are hub nodes)
 */
export function channelToNode(channel: SylvaChannel): IGraphNode {
  return {
    id: channel.id,
    group: CHANNEL_TYPE_GROUPS[channel.channelType] ?? 10,
    label: channel.name,
    val: 40,
    desc: [
      channel.description ?? '',
      `Type: ${channel.channelType}`,
      `Tier: ${channel.governanceTier}`,
      `Visibility: ${channel.visibility}`,
    ]
      .filter(Boolean)
      .join('\n'),
    icon: '',
    type: 'channel',
    url: '',
    color: TIER_COLORS[channel.governanceTier] ?? '#4682B4',
  }
}

/**
 * channelMemberLink
 *
 * Creates a link from a participant to a channel (membership).
 */
export function channelMemberLink(
  member: SylvaChannelMember,
): IGraphLink {
  return {
    source: member.participantId,
    target: member.channelId,
    label: member.role,
    val: 1,
    type: 'membership',
  }
}
