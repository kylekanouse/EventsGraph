import IEventsGraphCollectionContextRequest from "./IEventsGraphCollectionContextRequest"
import IEventsGraphCollectionContextResponse from "./IEventsGraphCollectionContextResponse"
import IUpdateGraphDataCallback from "./IUpdateGraphDataCallback"

/**
 * IGraphDataService
 *
 * @description Interface for dealing with an EventsGraph data service
 * @interface
 */

export default interface IEventsGraphDataService {
  

  /**
   * getEventsGraphData
   *
   * @param request {IEventsGraphCollectionContextRequest}
   * @returns {Promise<IEventsGraphCollectionContextResponse>}
   */

  getData(request: IEventsGraphCollectionContextRequest): Promise<IEventsGraphCollectionContextResponse>

  /**
   * getDataStream
   * @param request 
   * @param cb 
   */

  getDataStream(request: IEventsGraphCollectionContextRequest, cb: IUpdateGraphDataCallback): void

  // /**
  //  * getCollectionsOptionsData
  //  *
  //  * @description method for retreiving information on collections and context options associated to repo
  //  * @returns {IEventsGraphCollectionsOptionsData}
  //  */

  // getCollectionsOptionsData(): IEventsGraphCollectionsOptionsData;
}