import { createNode } from "../../../Utils"
import IGraphNode from "../../../../domain/IGraphNode"
import { CollectionAssociation } from "../../../../domain/IEntityCollection"
import { constants } from '../../../../constants'
import Media from './Media'
import IMediaData from "./domain/IMediaData"
import EntityCollection from "../../../EntityCollection"

const COLLECTION_TYPE_ID: string = constants.TWITTER_MEDIA_ENTITY_ID_PREFIX

/**
 * MediaCollection
 *
 * @description used as an entity container for dealing with a collection of Tweets
 * @class
 * @extends {Entity}
 * @implements {IEntityCollection}
 */

export default class MediaCollection extends EntityCollection {

  /**
   * collectionAssociationType
   * 
   * @type {CollectionAssociation}
   */

  collectionAssociationType: CollectionAssociation = "central"

  /**
   * _collection
   * 
   * @type {Map<string, Media>}
   */

  protected _collection: Map<string, Media> = new Map()

  /**
   * icon
   * 
   * @type {string | undefined}
   */

  protected _icon: string | undefined = process.env.TWITTER_TWEET_MEDIA_ICON_URL

  /**
   * constructor
   * 
   * @constructor
   * @param id {string}
   * @param sourceNodeID {string}
   */

  constructor(id?: string, includeCollectionNode:boolean = true) {
    super(COLLECTION_TYPE_ID, id, includeCollectionNode)
  }

  /**
   * _loadCollectionItem
   *
   * @param data {IMediaData}
   * @param index {number}
   * @param sourceNodeID {string}
   * @param refUsers {UserCollection}
   * @returns {Tweet}
   */

  private _loadCollectionItem(itemData: IMediaData): Media {

    // Create Tweet object from data
    const media = new Media( itemData )

    // Add to collection
    this._collection.set(media.getID(), media)

    return media
  }

  /**
   * getSubCollectionByIDs
   * 
   * @param collectionID 
   * @param ids 
   * @returns 
   */

  public getSubCollectionByIDs(collectionID: string, ids: string[]): MediaCollection {

    return new MediaCollection(collectionID)
                .loadObjects(
                  Array
                    .from( this._collection.values() )
                    .filter( (item: Media) => ids.includes(item.getID()) )
                )
  }

  /**
   * getLabel
   *
   * @returns {string}
   */

  public getLabel(): string {
    return constants.TWITTER_MEDIA_ENTITY_LABEL_PREFIX
  }

  /**
   * getNode
   *
   * @returns {IGraphNode}
   */

  public getNode(): IGraphNode {
    return createNode(this.getID(), '', this._collection.size, '', this.getIcon(),  '', 0)
  }

  /**
   * loadData
   *
   * @param data {IMediaData[]}
   * @returns {TweetCollection}
   */

  public loadData(data: IMediaData[]): MediaCollection {

    // Loop through data to wrap in Tweet objects
    data.map( (mediaData: IMediaData, index): void => {
      // Load collection item data
      this._loadCollectionItem(mediaData)
    })

    return this
  }

  /**
   * loadObjects
   *
   * @param obj {Media[]}
   * @returns {MediaCollection}
   */

  public loadObjects(objs: Media[]): MediaCollection {
    objs.map((obj: Media, index: number) => {
      this._collection.set(obj.getID(), obj)
    })
    return this
  }
}