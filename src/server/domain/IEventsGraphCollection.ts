import IEventsGraphCollectionContext from "./IEventsGraphCollectionContext"
import IEventsGraphDataService from "./IEventsGraphDataService"

/**
 * IEventsGraphCollection
 *
 * @interface
 */

export default interface IEventsGraphCollection extends IEventsGraphDataService {

  /**
   * getID
   *
   * @returns {string}
   */

  getID(): string;

  /**
   * getContextIDs
   *
   * @returns {string[]}
   */

  getContextIDs(): string[];

  /**
   * getContexts
   *
   * @returns {IEventsGraphCollectionContext[]}
   */

  getContexts(): IEventsGraphCollectionContext[];

  /**
   * findContextByID
   *
   * @param id {string}
   * @returns {IEventsGraphCollectionContext | undefined}
   */

  findContextByID(id: string): IEventsGraphCollectionContext | undefined;
}