import { constants } from "../../../../constants"
import IGraphData from "../../../../domain/IGraphData"
import IGraphLink from "../../../../domain/IGraphLink"
import IGraphNode from "../../../../domain/IGraphNode"
import { createGraphDataObject, createNode, formatLabel, mergeGraphData } from "../../../Utils"
import EntityTypeCollection from "./TweetEntityTypeCollection"
import IUserData from "./domain/IUserData"
import UserPublicMetrics from "./UserPublicMetrics"
import Entity from "../../../Entity"
import UserEntities from "./UserEntities"

/**
 * TwitterUser
 *
 * @class
 * @implements {IGraphEntity}
 */

export default class User extends Entity {

  private _name: string | undefined

  private _username: string | undefined
  
  private _description: string | undefined
  
  private _created_at: string | undefined

  private _pinned_tweet_id: string | undefined
  
  private _profile_image_url: string | undefined

  private _protected: boolean | undefined
  
  private _url: string | undefined
  
  private _verified: boolean | undefined
  
  // private _includes: any
  
  private _entities: UserEntities | undefined
  
  private _publicMetrics: UserPublicMetrics | undefined

  /**
   * constructor
   *
   * @param data {IUserData}

   */

   constructor(data: IUserData) {

    // Call parent constructor
    super( constants.TWITTER_USER_ID_PREFIX, data.id)

    // Extract values from JSON data object
    this._name                  = data.name
    this._username              = data.username
    this._description           = data.description
    this._created_at            = data.created_at
    this._pinned_tweet_id       = data.pinned_tweet_id
    this._profile_image_url     = data.profile_image_url
    this._protected             = data.protected
    this._url                   = data.url
    this._verified              = data.verified
    this._publicMetrics         = (typeof data === 'object' && data.public_metrics)    ? new UserPublicMetrics( data.public_metrics, this.getPublicMetricsID() ) : undefined
    this._entities              = (typeof data === 'object' && data.entities)          ? new UserEntities( data.entities, this.getEntitiesID() ) : undefined
   }

  /**
   * getLabel
   *
   * @returns {string}
   */

  public getLabel(): string {
    return (this.getUsername()!== undefined) ? formatLabel(`@${this.getUsername()}`) : ''
  }

  /**
   * getIcon
   *
   * @returns {string}
   */

  public getIcon(): string {
    return (this._profile_image_url) ? this._profile_image_url : ''
  }

  /**
   * getUsername
   *
   * @returns {string}
   */

  public getUsername(): string {
    return (this._username) ? this._username : ''
  }

  /**
   * getPublicMetrics
   *
   * @returns {UserPublicMetrics}
   */

  public getPublicMetrics(): UserPublicMetrics | undefined {
    return this._publicMetrics
  }

  public getPublicMetricsID(): string {
    return this.getID() + constants.SEP + constants.TWITTER_PUBLIC_METRICS_ID_PREFIX
  }

  public getEntitiesID(): string {
    return this.getID() + constants.SEP + constants.TWITTER_ENTITIES_ID_PREFIX
  }

  /**
  * getNode
  *
  * @returns {IGraphNode}
  */

  getNode(): IGraphNode {
    return createNode(this.getID(), this.getLabel(), 1, '', this.getIcon(), this.getType())
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

    // Add main base node
    graphData.nodes.push( this.getNode() )

    // Check if root link is present and if so add graph data
    if (targetNodeID) {
      graphData.links.push ( this.getLink(targetNodeID) )
    }

    // Get public metrics
    if (this._publicMetrics) {
      graphData = mergeGraphData(graphData, this._publicMetrics.getGraphData( this.getID() ))
    }

    // Get entities data
    if (this._entities) {
      graphData = mergeGraphData(graphData, this._entities.getGraphData( this.getID() ))
    }

    return graphData
  }
}