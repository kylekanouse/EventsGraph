import IEventsGraphCollectionContextResponse from '../../../../../domain/IEventsGraphCollectionContextResponse'
import IEventsGraphCollectionContextRequest from '../../../../../domain/IEventsGraphCollectionContextRequest'
import { constants } from '../../../../../constants'
import { Context } from '../../../Context'
import IUpdateGraphDataCallback from '../../../../../domain/IUpdateGraphDataCallback'
import { SylvaConnectionManager } from '../SylvaConnectionManager'
import { SylvaEventBridge } from '../SylvaEventBridge'
import { channelToNode, channelMemberLink } from '../mappers/channel.mapper'
import { participantToNode } from '../mappers/participant.mapper'
import { buildResponse } from '../../../../Utils'
import { logger } from '../../../../logger'
import type {
  SylvaChannelListResponse,
  SylvaParticipantListResponse,
  SylvaChannelMembersResponse,
  SylvaChannel,
} from '../types'

class ContextChannelNetwork extends Context {

  protected _id: string = constants.SYLVA_CHANNEL_NETWORK_CONTEXT_ID

  private _conn: SylvaConnectionManager
  private _bridge: SylvaEventBridge

  constructor(conn: SylvaConnectionManager, bridge: SylvaEventBridge) {
    super()
    this._conn = conn
    this._bridge = bridge
  }

  public isStreamable(): boolean {
    return true
  }

  public async getData(
    request: IEventsGraphCollectionContextRequest,
  ): Promise<IEventsGraphCollectionContextResponse> {
    // Fetch channels and participants in parallel
    const [channelsRes, participantsRes] = await Promise.all([
      this._conn.fetch('/api/channels'),
      this._conn.fetch('/api/participants'),
    ])

    if (!channelsRes.ok) {
      throw new Error(`Sylva channels fetch failed: ${channelsRes.status}`)
    }
    if (!participantsRes.ok) {
      throw new Error(`Sylva participants fetch failed: ${participantsRes.status}`)
    }

    const channelsData = (await channelsRes.json()) as SylvaChannelListResponse
    const participantsData = (await participantsRes.json()) as SylvaParticipantListResponse

    const channels: SylvaChannel[] = channelsData.items || []
    const participants = participantsData.items || []

    // Build nodes
    const channelNodes = channels.map(channelToNode)
    const participantNodes = participants.map(participantToNode)
    const nodes = [...channelNodes, ...participantNodes]

    // Fetch memberships for each channel (parallel, bounded)
    const membershipPromises = channels.map(async (ch) => {
      try {
        const res = await this._conn.fetch(`/api/channels/${encodeURIComponent(ch.id)}/members`)
        if (!res.ok) return []
        const data = (await res.json()) as SylvaChannelMembersResponse
        return (data.items || []).map(channelMemberLink)
      } catch {
        return []
      }
    })

    const membershipLinks = (await Promise.all(membershipPromises)).flat()

    return buildResponse(
      request,
      { nodes, links: membershipLinks },
      undefined,
      channels[0]?.id || '',
    )
  }

  /**
   * getDataStream
   *
   * 1. Fetch initial graph snapshot via REST
   * 2. Send snapshot to client via callback with closeStream
   * 3. Subscribe to SSE events relevant to channel network
   * 4. On each event, send IEventData via callback
   */
  public getDataStream(
    request: IEventsGraphCollectionContextRequest,
    cb: IUpdateGraphDataCallback,
  ): void {
    this.getData(request)
      .then((snapshot) => {
        const relevantEvents = [
          'governance.receipt',
          'message.new',
        ]

        const unsubscribe = this._bridge.subscribe(relevantEvents, (eventData) => {
          cb(null, buildResponse(request, undefined, eventData), closeStream)
        })

        const closeStream = () => {
          logger.info('ContextChannelNetwork: stream closed')
          unsubscribe()
        }

        // Send initial snapshot with closeStream
        cb(null, snapshot, closeStream)
      })
      .catch((err) => {
        logger.error({ err }, 'ContextChannelNetwork: stream initialization error')
        cb(err instanceof Error ? err : new Error(String(err)))
      })
  }
}

export default ContextChannelNetwork
