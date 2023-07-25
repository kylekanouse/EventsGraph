import { constants } from "../../../../constants"
import IGraphNode from "../../../../domain/IGraphNode"
import { createNode } from "../../../Utils"
import IUserData from "./domain/IUserData"
import User from "./User"
import EntityCollection from "../../../EntityCollection"
import { CollectionAssociation } from "../../../../domain/IEntityCollection"

/**
 * UserCollection
 *
 * @class
 * @extends {Entity}
 */

export default class UserCollection extends EntityCollection {

  /**
   * collectionAssociationType
   * 
   * @type {CollectionAssociation}
   */

  collectionAssociationType: CollectionAssociation = "central"

   /**
    * users
    * 
    * @type {User[]}
    */

  protected _collection: Map<string, User> = new Map()

  /**
   * icon
   * 
   * @type {string}
   */

  protected _icon: string | undefined = process.env.TWITTER_USER_COLLECTION_ICON_URL

  /**
  * constructor
  * 
  * @constructor
  * @param id {string}
  * @param {boolean} includeCollectionNode
  */

  constructor(id?: string, includeCollectionNode:boolean = true) {
    super( constants.TWITTER_USER_COLLECTIN_ID, id, includeCollectionNode)
  }

  /**
   * getSubCollectionByIDs
   * 
   * @param {string} subCollectionID
   * @param {string[]} ids 
   * @returns {UserCollection}
   */

  public getSubCollectionByIDs(subCollectionID: string, ids: string[]): UserCollection {
    return new UserCollection(subCollectionID)
                .loadObjects(
                  Array
                    .from( this._collection.values() )
                    .filter( (item: User) => ids.includes(item.getID()) )
                ) 
  }

   /**
    * getLabel
    *
    * @returns {string}
    */
 
   public getLabel(): string {
     return constants.TWITTER_USER_COLLECTIN_LABEL_PREFIX + ': ' + this.getID()
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
    * @param data {IUserData[]}
    * @returns {UserCollection}
    */
 
   public loadData(data: IUserData[]): UserCollection {

    // Loop through data to wrap in Entity objects
    data.map( (userData: IUserData): void => {

      // Create User object from data
      const user = new User( userData )
 
      this._collection.set(user.getID(), user)
    })

    return this
   }

  /**
   * loadObjects
   *
   * @param obj {User[]}
   * @returns {UserCollection}
   */

  public loadObjects(objs: User[]): UserCollection {
    objs.map((obj: User): void => {
      this._collection.set(obj.getID(), obj)
    })
    return this
  }
}