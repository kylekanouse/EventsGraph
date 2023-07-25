import IEventData from "./IEventData"
import IGraphData from "./IGraphData"
import IResponseMeta from './IResponseMeta'

/**
 * IEventsGraphCollectionContextResponse
 *
 * @description interface for response from a collection context call
 * @interface
 */

export default interface IEventsGraphCollectionContextResponse {
  id: string,
  collection: string,
  context: string,
  rootNodeID?: string,
  graphData?: IGraphData,
  eventData?: IEventData
  meta: IResponseMeta
}