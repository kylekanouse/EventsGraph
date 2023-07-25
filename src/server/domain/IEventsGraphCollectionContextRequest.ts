
/**
 * IEventsGraphCollectionContextRequest
 *
 * @description interface for making requests for a context on a collection
 * @interface
 */

export default interface IEventsGraphCollectionContextRequest {
  collection: string
  context: string
  isStream: boolean
  params: any
}