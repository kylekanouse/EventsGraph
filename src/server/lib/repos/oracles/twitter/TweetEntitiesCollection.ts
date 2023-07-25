import { constants } from "../../../../constants"
import IGraphNode from "../../../../domain/IGraphNode"
import { createNode } from "../../../Utils"
import EntityTypeCollection from "./TweetEntityTypeCollection"
import ITweetEntitiesData from "./domain/ITweetEntitiesData"
import { CollectionAssociation } from "../../../../domain/IEntityCollection"
import EntityCollection from "../../../EntityCollection"

/**
 * TweetEntities
 * 
 * @class
 * @extends {Entity}
 */

export default class TweetEntitiesCollection extends EntityCollection {

  /**
   * collectionAssociationType
   * 
   * @type {CollectionAssociation}
   */

  collectionAssociationType             : CollectionAssociation = "central"

  protected _collection                 : Map <string, EntityTypeCollection> = new Map()

  /**
   * constructor
   * 
   * @constructor
   * @param {string} id
   * @param {boolean} includeCollectionNode
   */

  constructor(id?: string, includeCollectionNode:boolean = true) {
    super( constants.TWITTER_ENTITY_ID_PREFIX, id, includeCollectionNode)
  }

  /**
   * _getEntityCollectionID
   *
   * @param {string} type
   * @returns 
   */

  private _getEntityCollectionID(type: string): string {
    return this.getID() + constants.SEP + type
  }

  /**
   * getLabel
   *
   * @returns {string}
   */

  public getLabel(): string {
    return constants.TWITTER_TWEET_ENTITIES_LABEL_PREFIX
  }

  /**
   * getNode
   *
   * @returns {IGraphNode}
   */

  public getNode(): IGraphNode {
    return createNode(this.getID(), '', 5, '', this.getIcon(),  '', 0)
  }

  /**
   * getSubCollectionByIDs
   * 
   * @param collectionID {string}
   * @param ids {string[]}
   * @returns {TweetEntitiesCollection}
   */

  public getSubCollectionByIDs(collectionID: string, ids: string[]): TweetEntitiesCollection {

    return new TweetEntitiesCollection(collectionID)
                .loadObjects(
                  Array
                    .from( this._collection.values() )
                    .filter( (item: EntityTypeCollection) => ids.includes(item.getID()) )
                )
  }

  /**
   * loadData
   *
   * @param {ITweetEntitiesData} entitiesData
   * @returns {TweetEntitiesCollection}
   */

  public loadData(entitiesData: ITweetEntitiesData): TweetEntitiesCollection {

    for (const [type, data] of Object.entries(entitiesData)) {
      this._collection.set(type, new EntityTypeCollection(type, this._getEntityCollectionID(type)).loadData(data))
    }

    return this
  }

  /**
   * loadObjects
   *
   * @param {EntityTypeCollection[]} entities
   * @returns {TweetEntitiesCollection}
   */

  public loadObjects(objs: EntityTypeCollection[]): TweetEntitiesCollection {
    objs.map((obj: EntityTypeCollection, index: number) => {
      this._collection.set(obj.getID(), obj)
    })
    return this
  }
}