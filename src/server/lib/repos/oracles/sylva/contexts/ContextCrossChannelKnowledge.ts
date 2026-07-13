import IEventsGraphCollectionContextResponse from '../../../../../domain/IEventsGraphCollectionContextResponse'
import IEventsGraphCollectionContextRequest from '../../../../../domain/IEventsGraphCollectionContextRequest'
import { constants } from '../../../../../constants'
import { Context } from '../../../Context'
import IUpdateGraphDataCallback from '../../../../../domain/IUpdateGraphDataCallback'
import IGraphLink from '../../../../../domain/IGraphLink'
import { SylvaConnectionManager } from '../SylvaConnectionManager'
import { SylvaEventBridge } from '../SylvaEventBridge'
import { channelToNode } from '../mappers/channel.mapper'
import { buildResponse } from '../../../../Utils'
import { logger } from '../../../../logger'
import type {
  SylvaChannelListResponse,
  SylvaMessageReferenceListResponse,
} from '../types'

class ContextCrossChannelKnowledge extends Context {

  protected _id: string = constants.SYLVA_CROSS_CHANNEL_CONTEXT_ID

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
    const [channelsRes, refsRes] = await Promise.all([
      this._conn.fetch('/api/channels'),
      this._conn.fetch('/api/messages/cross-references'),
    ])

    if (!channelsRes.ok) throw new Error(`Channels fetch failed: ${channelsRes.status}`)
    if (!refsRes.ok) throw new Error(`Cross-references fetch failed: ${refsRes.status}`)

    const channels = ((await channelsRes.json()) as SylvaChannelListResponse).items || []
    const refs = ((await refsRes.json()) as SylvaMessageReferenceListResponse).items || []

    const channelNodes = channels.map(channelToNode)

    // Aggregate cross-references into channel-to-channel links
    const linkMap = new Map<string, { count: number; types: Set<string> }>()
    for (const ref of refs) {
      const key = `${ref.sourceChannelId}→${ref.targetChannelId}`
      if (!linkMap.has(key)) {
        linkMap.set(key, { count: 0, types: new Set() })
      }
      const entry = linkMap.get(key)!
      entry.count++
      entry.types.add(ref.referenceType)
    }

    const links: IGraphLink[] = []
    for (const [key, { count, types }] of linkMap) {
      const [source, target] = key.split('→')
      const primaryType = [...types][0]
      links.push({
        source,
        target,
        label: `${count} ref${count > 1 ? 's' : ''}`,
        val: Math.min(count, 10),
        type: primaryType,
      })
    }

    const rootId = channels[0]?.id || ''
    return buildResponse(request, { nodes: channelNodes, links }, undefined, rootId)
  }

  public getDataStream(
    request: IEventsGraphCollectionContextRequest,
    cb: IUpdateGraphDataCallback,
  ): void {
    this.getData(request)
      .then((snapshot) => {
        const relevantEvents = ['message.new', 'governance.link-change']

        const unsubscribe = this._bridge.subscribe(relevantEvents, (eventData) => {
          cb(null, buildResponse(request, undefined, eventData))
        })

        const closeStream = () => {
          logger.info('ContextCrossChannelKnowledge: stream closed')
          unsubscribe()
        }

        cb(null, snapshot, closeStream)
      })
      .catch((err) => {
        logger.error({ err }, 'ContextCrossChannelKnowledge: stream error')
        cb(err instanceof Error ? err : new Error(String(err)))
      })
  }
}

export default ContextCrossChannelKnowledge
