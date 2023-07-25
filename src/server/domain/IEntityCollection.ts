import { type } from "os"
import IGraphEntity from "./IGraphEntity"

/**
 * CollectionAssociation
 *
 * @type
 */

type CollectionAssociation = "linear" | "central" | "none"

export { CollectionAssociation }

/**
 * IEntityCollection
 *
 * @interface
 */

export default interface IEntityCollection extends IGraphEntity {

  /**
   * _collectionAssociationType
   * 
   * @description used to determine the way the collection associates the sibiling entities through linking. "linear" links one enitity to the next in linear sequence starting from root node; "central" links all the entities to the root collection node
   * @type {CollectionAssociation}
   */

  collectionAssociationType: CollectionAssociation

  /**
   * getCollection
   * 
   * @type {Entity[]}
   */

  // getCollection(): Entity[]

  /**
   * getCollectionItemByID
   *
   * @param id {string}
   * @returns {Entity}
   */
  // getCollectionItemByID(id: string): Entity


  // /**
  //  * getSubCollectionByID
  //  *
  //  * @param subCollectionID {string}
  //  * @param ids {sring[]}
  //  */

  // getSubCollectionByIDs(subCollectionID: string, ids: string[]): IEntityCollection
}