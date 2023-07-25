import IEventsGraphDataService from "../domain/IEventsGraphDataService"
import IEventsGraphCollectionsOptionsData from "../domain/IEventsGraphCollectionsOptionsData"
import IEventsGraphCollectionContextRequest from "../domain/IEventsGraphCollectionContextRequest"
import IEventsGraphCollectionContextResponse from "../domain/IEventsGraphCollectionContextResponse"
import Repo from './repos/EventsGraphDataRepo'
import IUpdateGraphDataCallback from "../domain/IUpdateGraphDataCallback"

/**
 * EventsGraphService
 *
 * @author Kyle Kanouse
 * @description Main class for provideing the EventsGraph Data service to various applications
 * @implements {IEventsGraphDataService}
 */

class EventsGraphService implements IEventsGraphDataService {

  /**
   * getEventsGraphData
   *
   * @description method to retreive eventsgraph data from service
   * @param request {IEventsGraphCollectionContextRequest}
   * @returns {Promise<IEventsGraphCollectionContextResponse}
   */

  public getData(request: IEventsGraphCollectionContextRequest): Promise<IEventsGraphCollectionContextResponse> {

    // Return Promise with result
    return new Promise((resolve, reject) => {

      // Get data from repo
      Repo.getData(request).then((res) => {
        resolve(res)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  /**
   * getDataStream
   *
   * @param {IEventsGraphCollectionContextRequest} request
   * @param {IUpdateGraphDataCallback} cb
   */

  public getDataStream(request: IEventsGraphCollectionContextRequest, cb: IUpdateGraphDataCallback): void {
    Repo.getDataStream(request, cb)
  }

  /**
   * getCollectionsOptionsData
   *
   * @description method to retrieve options data used to configure requests to the service
   * @returns {IEventsGraphCollectionsOptionsData}
   */

  public getCollectionsOptionsData(): IEventsGraphCollectionsOptionsData {
    return {} as IEventsGraphCollectionsOptionsData
  }
}

// Export
export default new EventsGraphService()