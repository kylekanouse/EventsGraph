import IEventsGraphCollectionContextResponse from '../../../../../domain/IEventsGraphCollectionContextResponse'
import IEventsGraphCollectionContextRequest from '../../../../../domain/IEventsGraphCollectionContextRequest'
import { constants } from '../../../../../constants'
import { Context } from '../../../Context'
import IUpdateGraphDataCallback from '../../../../../domain/IUpdateGraphDataCallback'
import IGraphNode from '../../../../../domain/IGraphNode'
import IGraphLink from '../../../../../domain/IGraphLink'
import { SylvaConnectionManager } from '../SylvaConnectionManager'
import { SylvaEventBridge } from '../SylvaEventBridge'
import { gpaToNode } from '../mappers/gpa.mapper'
import { channelToNode } from '../mappers/channel.mapper'
import { participantToNode } from '../mappers/participant.mapper'
import { buildResponse } from '../../../../Utils'
import { logger } from '../../../../logger'
import type {
  SylvaGPAListResponse,
  SylvaChannelListResponse,
  SylvaParticipantListResponse,
} from '../types'

class ContextInstanceOverview extends Context {

  protected _id: string = constants.SYLVA_INSTANCE_OVERVIEW_CONTEXT_ID

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
    // Fetch all entity types in parallel
    const [gpasRes, channelsRes, participantsRes] = await Promise.all([
      this._conn.fetch('/api/gpa'),
      this._conn.fetch('/api/channels'),
      this._conn.fetch('/api/participants'),
    ])

    if (!gpasRes.ok) throw new Error(`Sylva GPA fetch failed: ${gpasRes.status}`)
    if (!channelsRes.ok) throw new Error(`Sylva channels fetch failed: ${channelsRes.status}`)
    if (!participantsRes.ok) throw new Error(`Sylva participants fetch failed: ${participantsRes.status}`)

    const gpas = ((await gpasRes.json()) as SylvaGPAListResponse).items || []
    const channels = ((await channelsRes.json()) as SylvaChannelListResponse).items || []
    const participants = ((await participantsRes.json()) as SylvaParticipantListResponse).items || []

    // Create a root "instance" node
    const rootNodeId = 'sylva-instance'
    const rootNode: IGraphNode = {
      id: rootNodeId,
      group: 0,
      label: 'Sylva Instance',
      val: 60,
      desc: [
        `GPAs: ${gpas.length}`,
        `Channels: ${channels.length}`,
        `Participants: ${participants.length}`,
      ].join('\n'),
      icon: '',
      type: 'instance',
      url: '',
      color: '#FFFFFF',
    }

    // Map entities to nodes
    const gpaNodes = gpas.map(gpaToNode)
    const channelNodes = channels.map(channelToNode)
    const participantNodes = participants.map(participantToNode)

    const nodes: IGraphNode[] = [rootNode, ...gpaNodes, ...channelNodes, ...participantNodes]

    // Create links from root to all entities
    const links: IGraphLink[] = []

    // Link GPAs to root
    gpas.forEach((gpa) => {
      links.push({
        source: rootNodeId,
        target: gpa.id,
        label: 'gpa',
        val: 1,
        type: 'contains',
      })
    })

    // Link channels to root
    channels.forEach((ch) => {
      links.push({
        source: rootNodeId,
        target: ch.id,
        label: 'channel',
        val: 1,
        type: 'contains',
      })
    })

    // Link participants to root
    participants.forEach((p) => {
      links.push({
        source: rootNodeId,
        target: p.id,
        label: 'participant',
        val: 1,
        type: 'contains',
      })
    })

    return buildResponse(request, { nodes, links }, undefined, rootNodeId)
  }

  /**
   * getDataStream
   *
   * 1. Fetch initial graph snapshot via REST
   * 2. Send snapshot to client via callback with closeStream
   * 3. Subscribe to ALL SSE events via wildcard
   * 4. On each event, send IEventData via callback
   */
  public getDataStream(
    request: IEventsGraphCollectionContextRequest,
    cb: IUpdateGraphDataCallback,
  ): void {
    this.getData(request)
      .then((snapshot) => {
        // Instance overview listens to ALL events via wildcard
        const unsubscribe = this._bridge.subscribe(['*'], (eventData) => {
          cb(null, buildResponse(request, undefined, eventData), closeStream)
        })

        const closeStream = () => {
          logger.info('ContextInstanceOverview: stream closed')
          unsubscribe()
        }

        // Send initial snapshot with closeStream
        cb(null, snapshot, closeStream)
      })
      .catch((err) => {
        logger.error({ err }, 'ContextInstanceOverview: stream initialization error')
        cb(err instanceof Error ? err : new Error(String(err)))
      })
  }
}

export default ContextInstanceOverview
