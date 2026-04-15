import IEventsGraphCollectionContextResponse from "./IEventsGraphCollectionContextResponse"
import IStreamCallback from "./IStreamCallback"
/**
 * IUpdateGraphDataCallback
 *
 * @interface
 */
export default interface IUpdateGraphDataCallback {
    ( error: Error | null, data?: IEventsGraphCollectionContextResponse, closeStream?:IStreamCallback ) : void
  }