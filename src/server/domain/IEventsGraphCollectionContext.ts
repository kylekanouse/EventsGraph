import IEventsGraphCollectionContextRequest from "./IEventsGraphCollectionContextRequest";
import IEventsGraphCollectionContextResponse from "./IEventsGraphCollectionContextResponse";
import IEventsGraphDataService from "./IEventsGraphDataService";

/**
 * IEventsGraphRepoContext
 *
 * @description interface for handling EventsGraph collection context
 * @interface
 */

export default interface IEventsGraphCollectionContext extends IEventsGraphDataService{

  /**
   * getID
   *
   * @returns string
   */

  getID(): string

  /**
   * isStreamable
   *
   * @type boolean
   */

  isStreamable(): boolean
}