import IEventsGraphCollectionContextResponse from '../../../../../domain/IEventsGraphCollectionContextResponse'
import IEventsGraphCollectionContextRequest from '../../../../../domain/IEventsGraphCollectionContextRequest'
import { constants } from '../../../../../constants'
import { Context } from "../../../Context"
import IUpdateGraphDataCallback from '../../../../../domain/IUpdateGraphDataCallback'
import { BasicNetworkService } from '../BasicNetworkService'

/**
 * ContextTweetLookup
 *
 * @description main context for dealing with a single or multiple tweet
 * @class
 */
class ContextBasicNetworkServicesOperations extends Context {

  /**
   * _id
   * 
   * @description ID for context
   * @protected
   * @type {string}
   */

  protected _id: string = constants.BASICNETWORK_OPERATIONS_CONTEXT_ID

  /**
   * isStreamable
   *
   * @returns {boolean}
   */

  public isStreamable(): boolean {
    return true
  }

  /**
   * getData
   *
   * @description execute action
   * @param request {IEventsGraphCollectionContextRequest}
   * @returns {Promise<IEventsGraphCollectionContextResponse>}
   */

  public async getData(request: IEventsGraphCollectionContextRequest) : Promise<IEventsGraphCollectionContextResponse> {
    return BasicNetworkService.getOperationsData( request )
  }

  /**
   * getDataStream
   *
   * @param {IEventsGraphCollectionContextRequest} request 
   * @param {IUpdateGraphDataCallback} cb 
   */

  public getDataStream(request: IEventsGraphCollectionContextRequest, cb: IUpdateGraphDataCallback): void {
    BasicNetworkService.listenToStream(null, request, cb)
  }
}

// Export
export default new ContextBasicNetworkServicesOperations()