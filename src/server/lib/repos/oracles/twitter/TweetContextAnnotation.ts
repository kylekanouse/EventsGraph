import { constants } from "../../../../constants"
import Entity from "../../../Entity"
import IGraphData from "../../../../domain/IGraphData"
import IGraphLink from "../../../../domain/IGraphLink"
import IGraphNode from "../../../../domain/IGraphNode"
import { createGraphDataObject, createNode, transform } from "../../../Utils"
import ITweetContextAnnotationData from "./domain/ITweetContextAnnotationData"
import ITweetContextAnnotationDomainData from "./domain/ITweetContextAnnotationDomainData"
import ITweetContextAnnotationEntityData from "./domain/ITweetContextAnnotationEntityData"

const SEP: string = constants.SEP

/**
 * TweetContextAnnotation
 * 
 * @class
 * @extends {Entity}
 */

export default class TweetContextAnnotation extends Entity {

  private _domain         : ITweetContextAnnotationDomainData | undefined

  private _entity         : ITweetContextAnnotationEntityData | undefined

  protected _icon         : string | undefined = process.env.TWITTER_TWEET_CONTEXT_ANNOTATION_ICON_URL

  /**
   * constructor
   *
   * @param {ITweetEntityAnnotationData} data
   * @param {string} id
   */

   constructor(data: ITweetContextAnnotationData, id?: string) {

    // Call base class constructor with type ID
    super( constants.TWITTER_TWEET_CONTEXT_ANNOTATION_ID, id)

    // Extract values from data object
    this._domain      = (typeof data === 'object' && data.domain) ? data.domain : undefined
    this._entity      = (typeof data === 'object' && data.entity) ? data.entity : undefined
  }

  /**
   * getLabel
   *
   * @returns {string}
   */

  getLabel = (): string => {

    const description: string | undefined = (this._entity && this._entity.description) ? this._entity.description : undefined
    let label: string = ''

    if (this._domain && this._domain.name) {
      label = label.concat(this._domain.name)

      if (this._entity && this._entity.name) {
        label = label.concat(` : ${this._entity.name}`)
      }

      if (description) {
        label = label.concat(` ${SEP} ${transform(description, 20)}`)
      }
    } else if (description) {
      label = label.concat(transform(description, 20))
    }

    return label
  }

  /**
   * getNode
   *
   * @returns {IGraphNode}
   */

  getNode = (): IGraphNode => {

    // Return translated EventGraph Node object
    return createNode(
                      this.getID(),
                      this.getLabel(),
                      5,
                      this.getLabel(),
                      '',
                      this.getType(),
                      1
                    )
  }

  /**
   * getGraphData
   * 
   * @param {string} targetNodeID
   * @returns {IGraphData}
   */

   public getGraphData = (targetNodeID?: string): IGraphData => {

    let graphData: IGraphData                   = createGraphDataObject()

    graphData.nodes.push( this.getNode() )

    if (targetNodeID) {
      graphData.links.push( this.getLink(targetNodeID) )
    }

    return graphData
  }
}