import { constants } from "../../../../constants"
import IGraphNode from "../../../../domain/IGraphNode"
import { createNode } from "../../../Utils"
import TweetEntity from "./TweetEntity"
import ITweetEntityAnnotationData from "./domain/ITweetEntityAnnotationData"

const DEFAULT_TWEET_ENTITY_ANNOTATION_LABEL: string = 'Tweet Entity Annotation'

/**
 * TweetEntityAnnotation
 *
 * @description main class to handle Twitter Annotation Enetity objects
 * @class
 * @extends {TweetEntity}
 */

export default class TweetEntityAnnotation extends TweetEntity {

  private _probability: number

  private _annotationType: string | undefined

  private _normalizedText: string | undefined

  /**
   * constructor
   *
   * @param data {ITweetEntityAnnotationData}
   * @param id {string}

   */

  constructor(data: ITweetEntityAnnotationData, id?: string) {

    // Call base class constructor with type ID
    super(data, constants.TWITTER_ENTITIES_ANNOTATIONS_ID, id)

    // Extract values from data object
    this._probability     = (typeof data === 'object' && data.probability) ? data.probability : 2
    this._annotationType  = (typeof data === 'object' && data.type) ? data.type : undefined
    this._normalizedText  = (typeof data === 'object' && data.normalized_text) ? data.normalized_text : undefined
  }

  /**
   * getLabel
   *
   * @returns {string}
   */

  public getLabel(): string {
    return (this._annotationType) ? this._annotationType + ((this._normalizedText) ? ': ' + this._normalizedText: '') : DEFAULT_TWEET_ENTITY_ANNOTATION_LABEL
  }

  /**
   * getNode
   *
   */

  public getNode(): IGraphNode {

    // Return translated EventGraph Node object
    return createNode(
                      this.getID(),
                      '',
                      this._probability * 3,
                      this.getLabel(),
                      '',
                      this.getType(),
                      1
                    )
  }
}