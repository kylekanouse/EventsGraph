import IEventsGraphCollectionContextRequest from '../../server/domain/IEventsGraphCollectionContextRequest'

/**
 * IControlsProps
 *
 * @interface
 */

 export default interface IControlProps {
  onControlsUpdate: (data: IEventsGraphCollectionContextRequest) => void
}
