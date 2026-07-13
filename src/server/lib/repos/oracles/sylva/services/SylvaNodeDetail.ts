import IGraphNode from '../../../../../domain/IGraphNode'
import IGraphLink from '../../../../../domain/IGraphLink'
import { SylvaConnectionManager } from '../SylvaConnectionManager'
import { logger } from '../../../../logger'

/**
 * NodeDetail
 *
 * Expanded information about a single node, including
 * its immediate neighborhood and entity-specific metrics.
 */
export interface NodeDetail {
  node: IGraphNode
  neighbors: IGraphNode[]
  links: IGraphLink[]
  metrics: Record<string, string | number>
}

/**
 * SylvaNodeDetailService
 *
 * Fetches detailed information about a specific entity
 * based on its type (GPA, channel, participant, receipt, etc.)
 */
export class SylvaNodeDetailService {
  private _conn: SylvaConnectionManager

  constructor(conn: SylvaConnectionManager) {
    this._conn = conn
  }

  /**
   * getNodeDetail
   *
   * Given a node ID and its type (from the graph), fetches
   * expanded details from the appropriate Sylva endpoint.
   */
  async getNodeDetail(nodeId: string, nodeType: string): Promise<NodeDetail | null> {
    try {
      switch (nodeType) {
        case 'agent':
        case 'service':
        case 'fleet-gpa':
          return this._getGPADetail(nodeId)
        case 'channel':
        case 'compliance-channel':
          return this._getChannelDetail(nodeId)
        case 'human':
        case 'webhook':
          return this._getParticipantDetail(nodeId)
        case 'receipt':
          return this._getReceiptDetail(nodeId)
        default:
          logger.debug({ nodeId, nodeType }, 'No detail fetcher for node type')
          return null
      }
    } catch (err) {
      logger.warn({ err, nodeId, nodeType }, 'Node detail fetch failed')
      return null
    }
  }

  private async _getGPADetail(gpaId: string): Promise<NodeDetail> {
    const res = await this._conn.fetch(`/api/gpa/${encodeURIComponent(gpaId)}`)
    if (!res.ok) throw new Error(`GPA detail fetch failed: ${res.status}`)
    const gpa = await res.json()

    const node: IGraphNode = {
      id: gpa.id,
      group: 0,
      label: gpa.name,
      val: 50,
      desc: JSON.stringify(gpa, null, 2),
      icon: '',
      type: 'gpa-detail',
      url: '',
    }

    const metrics: Record<string, string | number> = {
      status: gpa.status,
      budgetTotal: gpa.executionBudgetTotal,
      budgetUsed: gpa.executionBudgetUsed,
      role: gpa.agentRole || 'default',
      scheduleType: gpa.scheduleType || 'unknown',
    }

    return { node, neighbors: [], links: [], metrics }
  }

  private async _getChannelDetail(channelId: string): Promise<NodeDetail> {
    const res = await this._conn.fetch(`/api/channels/${encodeURIComponent(channelId)}`)
    if (!res.ok) throw new Error(`Channel detail fetch failed: ${res.status}`)
    const channel = await res.json()

    const node: IGraphNode = {
      id: channel.id,
      group: 0,
      label: channel.name,
      val: 50,
      desc: JSON.stringify(channel, null, 2),
      icon: '',
      type: 'channel-detail',
      url: '',
    }

    const metrics: Record<string, string | number> = {
      type: channel.channelType,
      tier: channel.governanceTier,
      visibility: channel.visibility,
    }

    return { node, neighbors: [], links: [], metrics }
  }

  private async _getParticipantDetail(participantId: string): Promise<NodeDetail> {
    const res = await this._conn.fetch(`/api/participants/${encodeURIComponent(participantId)}`)
    if (!res.ok) throw new Error(`Participant detail fetch failed: ${res.status}`)
    const participant = await res.json()

    const node: IGraphNode = {
      id: participant.id,
      group: 0,
      label: participant.name,
      val: 50,
      desc: JSON.stringify(participant, null, 2),
      icon: '',
      type: 'participant-detail',
      url: '',
    }

    const metrics: Record<string, string | number> = {
      type: participant.participantType,
      status: participant.status,
      governanceDepth: participant.governanceDepth,
    }

    return { node, neighbors: [], links: [], metrics }
  }

  private async _getReceiptDetail(receiptId: string): Promise<NodeDetail> {
    const res = await this._conn.fetch(`/api/governance/receipts/${encodeURIComponent(receiptId)}`)
    if (!res.ok) throw new Error(`Receipt detail fetch failed: ${res.status}`)
    const receipt = await res.json()

    const node: IGraphNode = {
      id: receipt.id,
      group: 0,
      label: `${receipt.receiptType}: ${receipt.consequence}`,
      val: 50,
      desc: JSON.stringify(receipt, null, 2),
      icon: '',
      type: 'receipt-detail',
      url: '',
    }

    const metrics: Record<string, string | number> = {
      type: receipt.receiptType,
      consequence: receipt.consequence,
      tier: receipt.governanceTier,
      coherenceScore: receipt.coherenceScore ?? 'N/A',
    }

    return { node, neighbors: [], links: [], metrics }
  }
}
