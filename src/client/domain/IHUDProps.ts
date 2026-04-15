import IEventsGraphCollectionContextRequest from "../../server/domain/IEventsGraphCollectionContextRequest"

/**
 * IHUDProps
 *
 * @interface
 */

export default interface IHUDProps {
  onRequestControlsUpdate: (data: IEventsGraphCollectionContextRequest) => void
}