import IEventsGraphCollectionContextRequest from "../../../../../domain/IEventsGraphCollectionContextRequest"
import IFilteredStreamParams from "./IFilteredStreamParams"

export default interface IFilteredStreamRequest {
  sampleSize?: number
  params: IFilteredStreamParams
  request: IEventsGraphCollectionContextRequest
}