import IEntityCollection, { CollectionAssociation } from "../domain/IEntityCollection"
import IGraphData from "../domain/IGraphData"
import Entity from "./Entity"
import { createGraphDataObject, getNextTargetNodeID, mergeGraphData } from "./Utils"

/**
 * EntityCollection
 *
 * @abstract
 * @class
 */

export default abstract class EntityCollection extends Entity implements IEntityCollection {

  /**
   * collectionAssociationType
   * 
   * @type {CollectionAssociation}
   */

  abstract collectionAssociationType: CollectionAssociation

  /**
   * collection
   * 
   * @description A collection of Entity objects
   * @type {Map<string, Entity>}
   */

  protected _collection: Map<string, Entity> = new Map()

  /**
   * _includeCollectionNode
   *
   * @type {boolean}
   */

  protected _includeCollectionNode:boolean

  /**
   * constructor
   * 
   * @constructor
   * @param {string} type
   * @param id {string}
   * @param {boolean} includeCollectionNode
   */

  constructor(type: string, id?: string, includeCollectionNode:boolean = true, icon?: string) {
    super(type, id, icon)
    this._includeCollectionNode = includeCollectionNode
  }

  /**
   * getSubCollectionByIDs
   * 
   * @param subCollectionID {string}
   * @param ids {string[]}
   * @returns {EntityCollection}
   */

  public abstract getSubCollectionByIDs(subCollectionID: string, ids: string[]): EntityCollection

  /**
   * loadObjects
   *
   * @param {Entity[]} objs
   * @returns {EntityCollection}
   */

  public abstract loadObjects(objs: Entity[]): EntityCollection

  /**
   * getCollection
   *
   * @returns {Map<string, Tweet>}
   */

  public getCollection(): Map<string, Entity> {
    return this._collection
  }

  /**
   * getCollectionItemByID
   *
   * @param id {string}
   * @returns {Entity | undefined}
   */

  public getCollectionItemByID = (id: string): Entity | undefined => {
    return this.getCollection().get(id)
  }

  /**
   * getID()
   *
   * @returns {string}
   */

  public getID(): string {
    return (this._includeCollectionNode) ? super.getID() : (this._collection.values().next().value) ? this._collection.values().next().value.getID() : ''
  }

  /**
   * getGraphData
   *
   * @param targetNodeID {string}
   * @returns {IGraphData}
   */

  public getGraphData(targetNodeID?: string): IGraphData {

    // Create empty object to populate graph data
    let graphData: IGraphData = createGraphDataObject()

    // Add main base tweet node
    if (this._includeCollectionNode && this.collectionAssociationType !== "none") {

      // Add collection node
      graphData.nodes.push( this.getNode() )

      // add target link
      if (targetNodeID) {
        graphData.links.push( this.getLink(targetNodeID) )
      }
      // Make collection node the target node for rest of the collection items
      targetNodeID = this.getID()
    }

    // Merge in tweet graph data to collection graph data
    if (this._collection.size) {
      Array
        .from( this._collection.values() )
        .map( (entitiy: Entity) => {

          // Add entity data to graphdata
          graphData = mergeGraphData(graphData, entitiy.getGraphData( targetNodeID ))

          // Get target node ID for next entity
          targetNodeID = getNextTargetNodeID(this, entitiy, this.collectionAssociationType)
        })
    }

    return graphData
  }
}