
import { constants } from "../../../../constants"
import IGraphNode from "../../../../domain/IGraphNode"
import { createNode, getSeperator } from "../../../Utils"
import TweetEntityHashtag from "./TweetEntityHashtag"
import TweetEntityMention from "./TweetEntityMention"
import TweetEntityAnnotation from './TweetEntityAnnotation'
import TweetEntityURL from "./TweetEntityURL"
import { CollectionAssociation } from "../../../../domain/IEntityCollection"
import ITweetEntityData from "./domain/ITweetEntityData"
import ITweetEntityAnnotationData from "./domain/ITweetEntityAnnotationData"
import TweetEntityCashtag from "./TweetEntityCashtag"
import ITweetEntityCashtagData from "./domain/ITweetEntityCashtagData"
import ITweetEntityHashtagData from "./domain/ITweetEntityHashtagData"
import ITweetEntityMentionData from "./domain/ITweetEntityMentionData"
import ITweetEntityUrlData from "./domain/ITweetEntityUrlData"
import TweetEntity from "./TweetEntity"
import EntityCollection from "../../../EntityCollection"

const SEP: string                                           = getSeperator()
const ENTITY_NODE_GROUP_VALUE: number | undefined           = constants.TWITTER_ENTITY_NODE_GROUP_VALUE
const ENTITY_ID_PREFIX: string | undefined                  = constants.TWITTER_ENTITY_ID_PREFIX
const PUBLIC_METRICS_ICON_URL: string | undefined           = process.env.TWITTER_PUBLIC_METRICS_ICON_URL
const ANNOTATIONS_ICON_URL: string | undefined              = process.env.TWITTER_ANNOTATIONS_ICON_URL
const URL_ICON_URL: string | undefined                      = process.env.TWITTER_URLS_ICON_URL
const HASHTAG_ICON_URL: string | undefined                  = process.env.TWITTER_HASHTAGS_ICON_URL
const MENTIONS_ICON_URL: string | undefined                 = process.env.TWITTER_MENTIONS_ICON_URL
const CASHTAGS_ICON_URL: string | undefined                 = process.env.TWITTER_ENTITY_CASHTAG_ICON_URL

/**
 * TweetEntityTypeCollection
 *
 * @description Main class for handling Tweet entities
 * @class
 */

export default class TweetEntityTypeCollection extends EntityCollection {

  /**
   * collectionAssociationType
   * 
   * @type {CollectionAssociation}
   */

  collectionAssociationType: CollectionAssociation = "central"

  /**
   * _collection
   *
   * @type {Map<string, TweetEntity>}
   */

  protected _collection : Map<string, TweetEntity> = new Map()

  /**
   * constructor
   *
   * @param type {string}
   */

  constructor(type: string, id?: string, includeCollectionNode:boolean = true, icon?: string) {
    super(type, id, includeCollectionNode, icon ? icon : PUBLIC_METRICS_ICON_URL)
  }

  /**
   * getSubCollectionByIDs
   * 
   * @param collectionID 
   * @param ids 
   * @returns 
   */

  public getSubCollectionByIDs(collectionID: string, ids: string[]): TweetEntityTypeCollection {
    return new TweetEntityTypeCollection(collectionID, this.getID())
                .loadObjects(
                  Array
                    .from( this._collection.values() )
                    .filter( (data: TweetEntity, index: number) => { ids.includes(this.getEntityID(index)) } )
                )
  }

  /**
   * getID
   *
   * @returns {string}
   */

  // public getID(): string {
  //   return this._id + SEP + this.getType()
  // }

  /**
   * 
   * @param index 
   * @returns 
   */
  public getEntityID(index: number): string {
    return this.getID() + SEP + index.toString()
  }

  /**
   * getGroupValue
   *
   * @returns {number}
   */

  public getGroupValue(): number {
    return (ENTITY_NODE_GROUP_VALUE) ? ENTITY_NODE_GROUP_VALUE : 0
  }

  /**
   * getLabel
   *
   * @returns {string}
   */

  public getLabel(): string {
    return this.getType()
  }

  /**
   * getNode
   *
   * @returns {IGraphNode}
   */

  public getNode(): IGraphNode {
    return createNode(this.getID(), this.getLabel(), 10, '', this.getIcon(),  '', this.getGroupValue())
  }

  /**
   * loadData
   *
   * @param data {ITweetEntityData[]}
   * @returns {TweetEntityTypeCollection}
   */

  public loadData(data: ITweetEntityData[]): TweetEntityTypeCollection {

    // Loop through all entities and load data into objects
    data.map((entityData: ITweetEntityData, index: number) => {

      // Get index
      const itemID          : string        = this.getEntityID(index)
      let entity            : TweetEntity | undefined

      // Switch based on Tweet Entity Type
      switch( this.getType() ) {
        case constants.TWITTER_ENTITIES_HASHTAGS_ID:                           // Hashtags
          this._icon     = HASHTAG_ICON_URL
          entity = new TweetEntityHashtag(entityData as ITweetEntityHashtagData, itemID)
          break
        case constants.TWITTER_ENTITIES_MENTIONS_ID:                           // Mentions
          this._icon     = MENTIONS_ICON_URL
          entity = new TweetEntityMention(entityData as ITweetEntityMentionData, itemID)
          break
        case constants.TWITTER_ENTITIES_ANNOTATIONS_ID:                        // Annotations
          this._icon     = ANNOTATIONS_ICON_URL
          entity = new TweetEntityAnnotation(entityData as ITweetEntityAnnotationData, itemID)
          break
        case constants.TWITTER_ENTITIES_URLS_ID:                               // URLS
          this._icon     = URL_ICON_URL
          entity = new TweetEntityURL(entityData as ITweetEntityUrlData, itemID)
          break
        case constants.TWITTER_ENTITIES_CASHTAG_ID:                            // Cashtags
          this._icon     = CASHTAGS_ICON_URL
          entity = new TweetEntityCashtag(entityData as ITweetEntityCashtagData, itemID)
        default:
      }

      // Add tweet entity to map
      if (entity) {
        this._collection.set(itemID, entity)
      }
    })

    return this
  }

  /**
   * loadObjects
   *
   * @param entities {TweetEntity[]}
   */

  public loadObjects(objs: TweetEntity[]): TweetEntityTypeCollection {
    objs.map((obj: TweetEntity, index: number) => {
      this._collection.set(this.getEntityID(index), obj)
    })
    return this
  }
}