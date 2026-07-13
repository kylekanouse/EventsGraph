import IEventsGraphCollectionContextResponse from '../../../../../domain/IEventsGraphCollectionContextResponse'
import IEventsGraphCollectionContextRequest from '../../../../../domain/IEventsGraphCollectionContextRequest'
import { constants } from '../../../../../constants'
import { Context } from '../../../Context'
import IUpdateGraphDataCallback from '../../../../../domain/IUpdateGraphDataCallback'
import { SylvaConnectionManager } from '../SylvaConnectionManager'
import { SylvaEventBridge } from '../SylvaEventBridge'
import { coherenceToNode, coherenceProximityLinks } from '../mappers/coherence.mapper'
import { buildResponse } from '../../../../Utils'
import { logger } from '../../../../logger'
import type { SylvaCoherenceListResponse } from '../types'

class ContextCoherenceLandscape extends Context {

  protected _id: string = constants.SYLVA_COHERENCE_LANDSCAPE_CONTEXT_ID

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
    const res = await this._conn.fetch('/api/governance/coherence')
    if (!res.ok) throw new Error(`Coherence data fetch failed: ${res.status}`)

    const data = (await res.json()) as SylvaCoherenceListResponse
    const dataPoints = data.items || []

    const nodes = dataPoints.map(coherenceToNode)
    const links = coherenceProximityLinks(dataPoints, request.params?.threshold ?? 0.1)

    const sorted = [...dataPoints].sort((a, b) => b.coherenceScore - a.coherenceScore)
    const rootId = sorted[0]?.entityId || ''

    return buildResponse(request, { nodes, links }, undefined, rootId)
  }

  public getDataStream(
    request: IEventsGraphCollectionContextRequest,
    cb: IUpdateGraphDataCallback,
  ): void {
    this.getData(request)
      .then((snapshot) => {
        const relevantEvents = [
          'governance.coherence',
          'governance.alert',
        ]

        const unsubscribe = this._bridge.subscribe(relevantEvents, (eventData) => {
          cb(null, buildResponse(request, undefined, eventData))
        })

        const closeStream = () => {
          logger.info('ContextCoherenceLandscape: stream closed')
          unsubscribe()
        }

        cb(null, snapshot, closeStream)
      })
      .catch((err) => {
        logger.error({ err }, 'ContextCoherenceLandscape: stream error')
        cb(err instanceof Error ? err : new Error(String(err)))
      })
  }
}

export default ContextCoherenceLandscape
