import { constants } from "../../../../constants"
import IGraphNode from "../../../../domain/IGraphNode"
import { createNode } from "../../../Utils"
import ITweetEntityHashtagData from "./domain/ITweetEntityHashtagData"
import TweetEntity from "./TweetEntity"
import { buildHashtagUrl } from "./TwitterUtils"

/**
 * TweetEntityHashtag
 *
 * @description main class to handle Twitter Hashtag Enetity objects
 * @class
 * @extends {Entity}
 */

export default class TweetEntityHashtag extends TweetEntity {

  private _hashtag: string

  /**
   * constructor
   *
   * @param data {ITweetEntityHashtagData}
   * @param id {string | undefined}
   */

  constructor(data: ITweetEntityHashtagData, id?: string) {

    // Call base class constructor with type ID
    super(data, constants.TWITTER_ENTITIES_HASHTAGS_ID, id)

    // Extract values from data object
    this._hashtag = (typeof data === 'object' && data.tag) ? data.tag : ''
  }

  /**
   * getLabel
   *
   * @returns {string}
   */

  getLabel(): string {
    return (this._hashtag) ? `#${this._hashtag}` : ''
  }

  getUrl(): string {
    return buildHashtagUrl(this._hashtag)
  }

  /**
   * getNode
   *
   * @returns IGraphNode
   */

  getNode(): IGraphNode {

    // Return translated EventGraph Node object
    return createNode(
                      this.getID(),
                      this.getLabel(),
                      undefined,
                      '',
                      '',
                      this.getType(),
                      1,
                      this.getUrl()
                    )
  }
}