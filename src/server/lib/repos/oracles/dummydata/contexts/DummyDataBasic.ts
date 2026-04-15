import IEventsGraphCollectionContextResponse from '../../../../../domain/IEventsGraphCollectionContextResponse'
import IEventsGraphCollectionContextRequest from '../../../../../domain/IEventsGraphCollectionContextRequest'
import { constants } from '../../../../../constants'
import { Context } from "../../../Context"
import IUpdateGraphDataCallback from '../../../../../domain/IUpdateGraphDataCallback'
import * as MockData from '../MockData'
import { buildResponse } from '../../../../Utils'
import DummyDataParams from '../data/DummyDataParams'
import IGraphData from '../../../../../domain/IGraphData'
import DummyDataType from '../data/DummyDataType'

/**
 * DummyDataBasic
 *
 * @description basic dummy data context
 * @class
 */

class DummyDataBasic extends Context {

  /**
   * _id
   * 
   * @description ID for context
   * @protected
   * @type {string}
   */

  protected _id: string = constants.DUMMY_DATA_BASIC_CONTEXT_ID

  /**
   * isStreamable
   *
   * @returns {boolean}
   */

  public isStreamable(): boolean {
    return false
  }

  /**
   * getData
   *
   * @description execute action
   * @param request {IEventsGraphCollectionContextRequest}
   * @returns {Promise<IEventsGraphCollectionContextResponse>}
   */

  public async getData(request: IEventsGraphCollectionContextRequest): Promise<IEventsGraphCollectionContextResponse> {

    const params: DummyDataParams = request.params as DummyDataParams
    console.log('DummyDataBasic | getData() | params = ', params)

    let data: IGraphData

    switch(params.type) {
      case 'request':
        data = MockData.graphRequestTypeData
        break
      case 'singleNode':
        data = MockData.graphRequestSingleNode
        break
      case 'basic':
      default:
      data = MockData.graphBasicData
        break
    }

    return new Promise( async (resolve, reject) => {
      resolve( buildResponse( request, data ) )
    })
  }

  /**
   * getDataStream
   *
   * @param {IEventsGraphCollectionContextRequest} request 
   * @param {IUpdateGraphDataCallback} cb 
   */

  public getDataStream(request: IEventsGraphCollectionContextRequest, cb: IUpdateGraphDataCallback): void {
    // BasicNetworkService.listenToStream(null, request, cb)
    cb(new Error('No stream available'))
  }
}

// Export
export default new DummyDataBasic()