import IEventsGraphCollection from "./IEventsGraphCollection"
import IEventsGraphDataService from "./IEventsGraphDataService"

/**
 * IGraphDataRepo
 *
 * @description Interface dealing with Graph Data Repos to provide a single
 * Object to retreive graph data from various sources
 *
 * @type interface
 */

export default interface IEventsGraphDataRepo extends IEventsGraphDataService {

  /**
   * getCollectionIDs
   *
   * @description get array of repo IDs
   * @returns {string[]}
   */

  getCollectionIDs(): string[]

  /**
   * getCollectionContextIDs
   *
   * @description list of contexts available with a collection
   * @returns {string[] | void[]}
   */

  getCollectionContextIDs(collectionID: string): string[] | void

  /**
   * findCollectionByID
   *
   * @param id {string}
   * @returns {IEventsGraphCollection | undefined}
   */

  findCollectionByID(id: string): IEventsGraphCollection | undefined
}