import IEventsGraphCollectionContextRequest from "./IEventsGraphCollectionContextRequest"
import IUpdateGraphDataCallback from './IUpdateGraphDataCallback'

/**
 * IStreamData
 *
 * @interface
 */

export default interface IStreamData {

  /**
   * getDataStream
   *
   * @param request {IEventsGraphCollectionContextRequest}
   * @returns {Promise<IEventsGraphCollectionContextResponse>}
   */

  getDataStream(request: IEventsGraphCollectionContextRequest, cb: IUpdateGraphDataCallback): void
}