import { constants } from "../../../../constants"
import IGraphNode from "../../../../domain/IGraphNode"
import { createNode } from "../../../Utils"
import IImageData from "./domain/IImageData"
import TweetEntity from "./TweetEntity"
import ITweetEntityUrlData from "./domain/ITweetEntityUrlData"

/**
 * TweetEntityURL
 *
 * @description main class to handle Twitter URL Enetity objects
 * @class
 * @extends {TweetEntity}
 */

export default class TweetEntityURL extends TweetEntity {

  private _url: string | undefined

  private _expandedURL: string | undefined

  private _displayURL: string | undefined

  private _images: IImageData[]

  /**
   * constructor
   *
   * @param data {ITweetEntityUrlData}
   * @param id {string | undefined}
   */

  constructor(data: ITweetEntityUrlData, id?: string) {

    // Call base class constructor with type ID
    super(data, constants.TWITTER_ENTITIES_URLS_ID, id)

    // Extract values from data object
    this._url             = data.url
    this._expandedURL     = data.expanded_url
    this._displayURL      = data.display_url
    this._images          = (typeof data === 'object' && data.images) ? data.images : [] as IImageData[]
  }

  /**
   * getImageIconURL
   *
   * @returns {string}
   */

  getImageIconURL(): string {
    return (this._images && this._images.length) ? this._images[1].url : ''
  }

  /**
   * getLabel
   *
   * @returns {string}
   */

  getLabel(): string {
    return  (this._displayURL) ? this._displayURL : ''
  }

  getUrl(): string {
    return (this._expandedURL) ? this._expandedURL : ''
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
                      undefined,
                      this.getImageIconURL(),
                      this.getType(),
                      2,
                      this.getUrl()
                    )
  }
}