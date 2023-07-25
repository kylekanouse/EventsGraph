import { constants } from "../../../../constants"
import IGraphNode from "../../../../domain/IGraphNode"
import { createNode } from "../../../Utils"
import TweetEntity from "./TweetEntity"
import ITweetEntityMentionData from "./domain/ITweetEntityMentionData"
import { buildMentionUrl } from "./TwitterUtils"

/**
 * TweetEntityMention
 *
 * @description main class to handle Twitter Mention Enetity objects
 * @class
 * @extends {Entity}
 */

export default class TweetEntityMention extends TweetEntity {

  private _username: string

  /**
   * constructor
   *
   * @param data {ITweetEntityMentionData}
   * @param id {string | undefined}
   */

  constructor(data: ITweetEntityMentionData, id?: string) {

    // Call base class constructor with type ID
    super(data, constants.TWITTER_ENTITIES_MENTIONS_ID, id)

    // Extract values from data object
    this._username = (typeof data === 'object' && data.username) ? data.username : ''
  }

  /**
   * getLabel
   *
   * @returns {string}
   */

  getLabel(): string {
    return (this._username) ? `@${this._username}` : ''
  }

  getUrl(): string {
    return (this._username) ? buildMentionUrl(this._username) : ''
  }

  /**
   * getNode
   *
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