import IEventsGraphCollectionContextResponse from '../../../../../domain/IEventsGraphCollectionContextResponse'
import IEventsGraphCollectionContextRequest from '../../../../../domain/IEventsGraphCollectionContextRequest'
import { constants } from '../../../../../constants'
import { Context } from '../../../Context'
import IUpdateGraphDataCallback from '../../../../../domain/IUpdateGraphDataCallback'
import { SylvaAnalyticsService } from '../services/SylvaAnalyticsService'
import { buildResponse } from '../../../../Utils'

class ContextExecutionTrends extends Context {

  protected _id: string = constants.SYLVA_EXECUTION_TRENDS_CONTEXT_ID

  private _analytics: SylvaAnalyticsService

  constructor(analytics: SylvaAnalyticsService) {
    super()
    this._analytics = analytics
  }

  public isStreamable(): boolean {
    return false
  }

  public async getData(
    request: IEventsGraphCollectionContextRequest,
  ): Promise<IEventsGraphCollectionContextResponse> {
    const timeRange = request.params?.timeRange || '24h'
    const bucketSize = request.params?.bucketSize || 'hour'

    const graphData = await this._analytics.computeExecutionTrends({
      timeRange,
      bucketSize,
    })

    const rootId = graphData.nodes[0]?.id || ''
    return buildResponse(request, graphData, undefined, rootId)
  }

  public getDataStream(
    _request: IEventsGraphCollectionContextRequest,
    cb: IUpdateGraphDataCallback,
  ): void {
    cb(new Error('ContextExecutionTrends does not support streaming'))
  }
}

export default ContextExecutionTrends
