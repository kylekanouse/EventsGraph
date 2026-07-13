import IGraphNode from '../../../../../domain/IGraphNode'
import IGraphLink from '../../../../../domain/IGraphLink'
import type { SylvaFederationPeer } from '../types'

const PEER_STATUS_GROUPS: Record<string, number> = {
  connected: 37,
  disconnected: 38,
  pending: 39,
  rejected: 40,
}

const PEER_STATUS_COLORS: Record<string, string> = {
  connected: '#00FF00',
  disconnected: '#FF4444',
  pending: '#FFD700',
  rejected: '#666666',
}

/**
 * federationPeerToNode
 */
export function federationPeerToNode(peer: SylvaFederationPeer): IGraphNode {
  return {
    id: peer.id,
    group: PEER_STATUS_GROUPS[peer.status] ?? 37,
    label: peer.name,
    val: 30 + peer.sharedChannels * 3,
    desc: [
      `DID: ${peer.instanceDid}`,
      `Status: ${peer.status}`,
      `Tier: ${peer.governanceTier}`,
      `Shared Channels: ${peer.sharedChannels}`,
      peer.lastSyncAt ? `Last Sync: ${peer.lastSyncAt}` : '',
      `URL: ${peer.url}`,
    ]
      .filter(Boolean)
      .join('\n'),
    icon: '',
    type: 'federation-peer',
    url: '',
    color: PEER_STATUS_COLORS[peer.status] ?? '#4682B4',
  }
}

/**
 * federationPeerLink
 *
 * Creates a link from the local instance node to a federation peer.
 */
export function federationPeerLink(localInstanceId: string, peerId: string, sharedChannels: number): IGraphLink {
  return {
    source: localInstanceId,
    target: peerId,
    label: `${sharedChannels} shared`,
    val: Math.min(sharedChannels, 10),
    type: 'federation',
  }
}
