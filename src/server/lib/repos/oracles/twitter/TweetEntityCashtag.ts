import { constants } from "../../../../constants"
import IGraphNode from "../../../../domain/IGraphNode"
import { createNode, formatLabel } from "../../../Utils"
import TweetEntity from "./TweetEntity"
import ITweetEntityCashtagData from "./domain/ITweetEntityCashtagData"
import { buildCashtagUrl } from "./TwitterUtils"

/**
 * TweetEntityCashtag
 *
 * @description main class to handle Twitter Cashtag Entity objects
 * @class
 * @extends {Entity}
 */

export default class TweetEntityCashtag extends TweetEntity {

  private _cashtag: string

  /**
   * constructor
   *
   * @param data {ITweetEntityCashtagData}
   * @param sourceNodeID {string | undefined}
   */

  constructor(data: ITweetEntityCashtagData, id?: string) {

    // Call base class constructor with type ID
    super(data, constants.TWITTER_ENTITIES_HASHTAGS_ID, id)

    // Extract values from data object
    this._cashtag = (typeof data === 'object' && data.tag) ? data.tag : ''
  }

  /**
   * getLabel
   *
   * @returns {string}
   */

  getLabel(): string {
    return (this._cashtag) ? formatLabel( `$${this._cashtag}` ) : ''
  }

  /**
   * getUrl
   * @returns {string}
   */

  getUrl(): string {
    return buildCashtagUrl(this._cashtag)
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