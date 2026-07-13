import IEventsGraphCollectionContextResponse from '../../../../../domain/IEventsGraphCollectionContextResponse'
import IEventsGraphCollectionContextRequest from '../../../../../domain/IEventsGraphCollectionContextRequest'
import { constants } from '../../../../../constants'
import { Context } from '../../../Context'
import IUpdateGraphDataCallback from '../../../../../domain/IUpdateGraphDataCallback'
import { SylvaAnalyticsService } from '../services/SylvaAnalyticsService'
import { SylvaEventBridge } from '../SylvaEventBridge'
import { buildResponse } from '../../../../Utils'
import { logger } from '../../../../logger'

class ContextCoherenceHeatmap extends Context {

  protected _id: string = constants.SYLVA_COHERENCE_HEATMAP_CONTEXT_ID

  private _analytics: SylvaAnalyticsService
  private _bridge: SylvaEventBridge

  constructor(analytics: SylvaAnalyticsService, bridge: SylvaEventBridge) {
    super()
    this._analytics = analytics
    this._bridge = bridge
  }

  public isStreamable(): boolean {
    return true
  }

  public async getData(
    request: IEventsGraphCollectionContextRequest,
  ): Promise<IEventsGraphCollectionContextResponse> {
    const graphData = await this._analytics.computeCoherenceHeatmap()
    const rootId = graphData.nodes[0]?.id || ''
    return buildResponse(request, graphData, undefined, rootId)
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
          logger.info('ContextCoherenceHeatmap: stream closed')
          unsubscribe()
        }

        cb(null, snapshot, closeStream)
      })
      .catch((err) => {
        logger.error({ err }, 'ContextCoherenceHeatmap: stream error')
        cb(err instanceof Error ? err : new Error(String(err)))
      })
  }
}

export default ContextCoherenceHeatmap
