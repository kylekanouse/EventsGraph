import { constants } from "../../../../constants";
import Entity from "../../../Entity";
import IGraphData from "../../../../domain/IGraphData";
import IGraphLink from "../../../../domain/IGraphLink";
import IGraphNode from "../../../../domain/IGraphNode";
import { createGraphDataObject, createNode, mergeGraphData } from "../../../Utils";
import ITweetContextAnnotationData from "./domain/ITweetContextAnnotationData";
import TweetContextAnnotation from "./TweetContextAnnotation";

/**
 * TweetContextAnnotationCollection
 *
 * @class
 * @extends {Entity}
 */

export default class TweetContextAnnotationCollection extends Entity {

  private _collection                 : Map<string, TweetContextAnnotation>     = new Map()
  protected _icon                     : string | undefined                      = process.env.TWITTER_TWEET_CONTEXT_ANNOTATION_ICON_URL

  /**
   * constructor
   *
   * @param data {ITweetContextAnnotationData}
   * @param id {string}
   * @param sourceNodeID {string}
   */

  constructor(data: ITweetContextAnnotationData[], id?: string) {

    // Call base class constructor with type ID
    super( constants.TWITTER_TWEET_CONTEXT_ANNOTATION_ID, id)

    // Extract values from data object
    data.map( (contaxtAnnotation: ITweetContextAnnotationData, index: number) => {
      this._collection.set(
                                    this._getAnnotationID(index),
                                    new TweetContextAnnotation(contaxtAnnotation, this._getAnnotationID(index))
                                  )
    })
  }

  /**
   * _getAnnotationIDs
   *
   * @param index {number}
   * @returns {string}
   */

  private _getAnnotationID = (index: number): string => {
    return this.getID() + constants.SEP + index.toString()
  }

  /**
   * getLabel
   *
   * @returns {string}
   */

  getLabel = (): string => {
    return constants.TWITTER_TWEET_CONTEXT_ANNOTATIONS_LABEL
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
                      this.getIcon(),
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

    let graphData: IGraphData = createGraphDataObject()

    graphData.nodes.push( this.getNode() )

    if (targetNodeID) {
      graphData.links.push( this.getLink(targetNodeID) )
    }

    // Add collections data to graph data
    Array
      .from( this._collection.values() )
      .map( (item: TweetContextAnnotation) => {
        graphData = mergeGraphData(graphData, item.getGraphData( this.getID() ))
      })

    return graphData
  }
}