import { constants } from "../../../../constants"
import IGraphData from "../../../../domain/IGraphData"
import IGraphNode from "../../../../domain/IGraphNode"
import { createGraphDataObject, createNode, mergeGraphData } from "../../../Utils"
import Entity from "../../../Entity"
import EntityTypeCollection from "./TweetEntityTypeCollection"
import ITweetEntitiesData from "./domain/ITweetEntitiesData"
import TweetEntities from "./TweetEntitiesCollection"
import IUserEntitiesData from "./domain/IUserEntitiesData"

/**
 * UserEntities
 *
 * @class
 * @extends {Entity}
 */

export default class UserEntities extends Entity {

  protected _urls                   : EntityTypeCollection | undefined

  protected _description            : TweetEntities | undefined

  /**
   * constructor
   * 
   * @constructor
   * @param data {IUserEntitiesData}
   * @param id {string | undefined}

   */

  constructor(data: IUserEntitiesData ,id?: string) {
    super( constants.TWITTER_ENTITY_ID_PREFIX, id)

    if (data.url) {
      this.loadData(data.url)
    }

    if (data.description) {
      this._description = new TweetEntities(this._getEntitiesID()).loadData(data.description)
    }
  }

  /**
   * _getEntitiesID
   *
   * @private
   * @returns {string} 
   */

  private _getEntitiesID(): string {
    return this.getID() + constants.SEP + constants.TWITTER_TWEET_ENTITIES_LABEL_PREFIX
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
   * getGraphData
   *
   * @param targetNodeID {string}
   * @returns {IGraphData}
   */

  public getGraphData(targetNodeID?: string): IGraphData {

    let graphData: IGraphData = createGraphDataObject()

    // Add main base tweet entities group node
    graphData.nodes.push( this.getNode() )

    // If root link exists then add to graph data
    if (targetNodeID) {
      graphData.links.push( this.getLink( targetNodeID ) )
    }

    // Url entities
    if (this._urls) {
        graphData = mergeGraphData(graphData, this._urls.getGraphData( this.getID() ))
    }

    // Description entities
    if (this._description) {
      graphData = mergeGraphData(graphData, this._description.getGraphData( this.getID() ))
    }

    return graphData
  }

  /**
   * loadData
   *
   * @param entitiesData {ITweetEntitiesData}
   * @returns {UserEntities}
   * @todo fix lint issues
   */

  public loadData(data: ITweetEntitiesData): UserEntities {

    // let index = 0
    // console.log('UserEntities | loadData() | entitiesData = ', data)
    // for (const type of Object.keys(data)) {
    //   for (let [entityType, entityData] of Object.entries(data)) {
    //     this[`_${entityType}`] = new EntityTypeCollection(entityType, this.getID() + constants.SEP + index).loadData( entityData ) 
    //     ++index
    //   }
    // }
    return this
  }
}