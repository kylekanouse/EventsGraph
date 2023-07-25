import { createNode } from "../../../Utils"
import IGraphNode from "../../../../domain/IGraphNode"
import Tweet from "./Tweet"
import ITweetData from "./domain/ITweetData"
import { CollectionAssociation } from "../../../../domain/IEntityCollection"
import { constants } from '../../../../constants'
import UserAuthor from "./UserAuthor"
import UserCollection from "./UserCollection"
import MediaCollection from "./MediaCollection"
import EntityCollection from "../../../EntityCollection"

const COLLECTION_TYPE_ID: string = constants.TWITTER_TWEET_COLLECTIN_ID

/**
 * TweetCollection
 *
 * @description used as an entity container for dealing with a collection of Tweets
 * @class
 * @implements {IEntityCollection}
 */

export default class TweetCollection extends EntityCollection {

  /**
   * collectionAssociationType
   * 
   * @type {CollectionAssociation}
   */

  collectionAssociationType: CollectionAssociation = "central"

  /**
   * collection
   * 
   * @description A collection of Tweet objects
   * @type {Map<string, Tweet>}
   */

  protected _collection: Map<string, Tweet> = new Map()

  /**
   * icon
   * 
   * @type {string | undefined}
   */

  protected _icon: string | undefined = process.env.TWITTER_TWEET_COLLECTION_ICON_URL

  /**
   * _refUsers
   * 
   * @protected
   * @type {UserCollection | undefined}
   */

  protected _refUsers: UserCollection | undefined

  /**
   * constructor
   * 
   * @constructor
   * @param id {string}
   * @param {boolean} includeCollectionNode
   */

  constructor(id?: string, includeCollectionNode:boolean = true) {
    super(COLLECTION_TYPE_ID, id, includeCollectionNode)
  }

  /**
   * _loadCollectionItem
   *
   * @param data {ITweetData}
   * @param index {number}
   * @param sourceNodeID {string}
   * @param refUsers {UserCollection}
   * @returns {Tweet}
   */

  private _loadCollectionItem(itemData: ITweetData, index: number, refUsers?: UserCollection, refMediaCollection?: MediaCollection): Tweet {

    // Create Tweet object from data
    const tweet = new Tweet( itemData )

    // Setup Author User
    const authorID: string | undefined = tweet.getAuthorID()

    // Check if author is in reference users
    if (authorID && refUsers) {

      const authorUser: UserAuthor = refUsers.getCollectionItemByID(authorID) as UserAuthor

      if (authorUser) {
        tweet.setAuthor( authorUser )
      }
    }

    // Get media attachments
    const mediaAttachmentIDs: string[] = tweet.getMediaAttchmentIDs()

    if (mediaAttachmentIDs.length && refMediaCollection) {
      const collectionID: string = tweet.getID() + constants.SEP + constants.TWITTER_MEDIA_ENTITY_ID_PREFIX
      tweet.setMediaCollection( refMediaCollection.getSubCollectionByIDs(collectionID, mediaAttachmentIDs) )
    }

    // Add to collection
    this._collection.set(tweet.getID(), tweet)

    return tweet
  }


  /**
   * getSubCollectionByIDs
   * 
   * @param subCollectionID {string}
   * @param ids {string[]}
   * @returns {TweetCollection}
   */

  public getSubCollectionByIDs(subCollectionID: string, ids: string[]): TweetCollection {

    return new TweetCollection(subCollectionID)
                .loadObjects(
                  Array
                    .from( this._collection.values() )
                    .filter( (item: Tweet) => ids.includes(item.getID()) )
                )
  }

  /**
   * getLabel
   *
   * @returns {string}
   */

  public getLabel(): string {
    return constants.TWITTER_TWEET_COLLECTIN_LABEL_PREFIX + ': ' + this.getID()
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
   * @param data {ITweetData[]}
   * @param refUsers {UserCollection}
   * @returns {TweetCollection | ITweetData}
   */

  public loadData(data: ITweetData[], refUsers?: UserCollection, refMedia?: MediaCollection): TweetCollection {

    // Loop through data to wrap in Tweet objects
    data.map( (tweetData: ITweetData, index) => {

      // Load collection item data
      const tweet: Tweet = this._loadCollectionItem(tweetData, index, refUsers, refMedia)
    })

    return this
  }

  /**
   * loadDataSingle
   *
   * @param data 
   * @param refUsers 
   * @param refMedia 
   * @returns 
   */

  public loadDataSingle = (data: ITweetData, refUsers?: UserCollection, refMedia?: MediaCollection): TweetCollection => {
    return this.loadData( Array.of(data), refUsers, refMedia )
  }

  /**
   * loadObjects
   *
   * @param obj {Tweet[]}
   * @returns {TweetCollection}
   */

  public loadObjects(objs: Tweet[]): TweetCollection {
    objs.map((obj: Tweet, index: number) => {
      this._collection.set(obj.getID(), obj)
    })
    return this
  }
}