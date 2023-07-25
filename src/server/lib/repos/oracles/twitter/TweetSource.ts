import { constants } from "../../../../constants";
import Entity from "../../../Entity";
import IGraphData from "../../../../domain/IGraphData";
import IGraphNode from "../../../../domain/IGraphNode";
import { createGraphDataObject, createNode } from "../../../Utils";
import IGraphLink from "../../../../domain/IGraphLink";

/**
 * @todo ADD: environment external parameter defaults to AppContants and populate if not present instead of leaving "undefined"
 */
// Pull in envrionment and App constants
const TWITTER_AD_SOURCE_ICON                :string | undefined         = process.env.TWITTER_TWEET_AD_SOURCE_ICON_URL
const TWITTER_SOURCE_IPHONE_ICON            :string | undefined         = process.env.TWITTER_TWEET_SOURCE_IPHONE_ICON_URL
const TWITTER_SOURCE_WEB_APP_ICON           :string | undefined         = process.env.TWITTER_TWEET_SOURCE_WEB_APP_ICON_URL
const TWITTER_SOURCE_ANDROID_ICON           :string | undefined         = process.env.TWITTER_TWEET_SOURCE_ANDROID_APP_ICON_URL
const TWITTER_SOURCE_MEDIA_STUDIO_ICON      :string | undefined         = process.env.TWITTER_TWEET_SOURCE_MEDIA_STUDIO_ICON_URL
const TWITTER_SOURCE_SPRINKLR_ICON          :string | undefined         = process.env.TWITTER_TWEET_SOURCE_SPRINKLR_ICON_URL
const AD_SOURCE_VALUES                      :string[]                   = ( constants.TWITTER_TWEET_SOURCE_AD_VALUES) ? constants.TWITTER_TWEET_SOURCE_AD_VALUES : []
const ANDROID_SOURCE_VALUES                 :string[]                   = ( constants.TWITTER_TWEET_SOURCE_TWITTER_ANDROID_VALUES) ? constants.TWITTER_TWEET_SOURCE_TWITTER_ANDROID_VALUES: []
const IPHONE_SOURCE_VALUES                  :string[]                   = ( constants.TWITTER_TWEET_SOURCE_IPHONE_VALUES) ? constants.TWITTER_TWEET_SOURCE_IPHONE_VALUES : []
const MEDIA_STUDIO_SOURCE_VALUES            :string[]                   = ( constants.TWITTER_TWEET_SOURCE_TWITTER_MEDIA_STUDIO_VALUES) ? constants.TWITTER_TWEET_SOURCE_TWITTER_MEDIA_STUDIO_VALUES : []
const SPRINKLR_SOURCE_VALUES                :string[]                   = ( constants.TWITTER_TWEET_SOURCE_SPRINKLR_VALUES) ? constants.TWITTER_TWEET_SOURCE_SPRINKLR_VALUES : []
const WEB_APP_SOURCE_VALUES                 :string[]                   = ( constants.TWITTER_TWEET_SOURCE_WEB_APP_VALUES) ? constants.TWITTER_TWEET_SOURCE_WEB_APP_VALUES : []

/**
 * TweetSource
 *
 * @class
 * @extends {Entity}
 */
export default class TweetSource extends Entity {

  private _data: string

  protected _icon: string | undefined

  /**
   * constructor
   * 
   * @constructor
   * @param id {string}
   */

  constructor(data: string, id?: string) {

    super( constants.TWITTER_TWEET_SOURCE_CONTEXT_ID, id)

    this._data = data

    this._setIcon(this._data)
  }

  /**
   * _setIcon
   *
   * @param value {string}
   */

  private _setIcon = (value: string): void => {

    if(TWITTER_AD_SOURCE_ICON && this._isAdValue(value) ) {
      this._icon = TWITTER_AD_SOURCE_ICON
    } else if (TWITTER_SOURCE_IPHONE_ICON && this._isIPhone(value)) {
      this._icon = TWITTER_SOURCE_IPHONE_ICON
    } else if (TWITTER_SOURCE_WEB_APP_ICON && this._isWebApp(value)) {
      this._icon = TWITTER_SOURCE_WEB_APP_ICON
    } else if (TWITTER_SOURCE_ANDROID_ICON && this._isAndroidApp(value)) {
      this._icon = TWITTER_SOURCE_ANDROID_ICON
    } else if (TWITTER_SOURCE_MEDIA_STUDIO_ICON && this._isMediaStudio(value)) {
      this._icon = TWITTER_SOURCE_MEDIA_STUDIO_ICON
    } else if (TWITTER_SOURCE_SPRINKLR_ICON && this._isSprinklr(value)) {
      this._icon = TWITTER_SOURCE_SPRINKLR_ICON
    }
  }

  /**
   * _isAdValue
   *
   * @param value {string}
   * @returns {boolean}
   */

  private _isAdValue = (value: string): boolean | undefined => {
    return AD_SOURCE_VALUES.includes(value)
  }

  private _isAndroidApp = (value: string): boolean => {
    return ANDROID_SOURCE_VALUES.includes(value)
  }

  private _isIPhone = (value: string): boolean => {
    return IPHONE_SOURCE_VALUES.includes(value)
  }

  private _isMediaStudio = (value: string): boolean => {
    return MEDIA_STUDIO_SOURCE_VALUES.includes(value)
  }

  private _isSprinklr = (value: string): boolean => {
    return SPRINKLR_SOURCE_VALUES.includes(value)
  } 

  private _isWebApp = (value: string): boolean => {
    return WEB_APP_SOURCE_VALUES.includes(value)
  }

  /**
   * getLabel
   *
   * @returns {string}
   */

   public getLabel = (): string => {
    return constants.TWITTER_TWEET_SOURCE_LABEL_PREFIX + ": " + this._data
  }

  /**
   * getNode
   *
   * @returns {IGraphNode}
   */

  public getNode = (): IGraphNode => {
    return createNode(this.getID(), this.getLabel(), 2, '', this.getIcon(),  '', 0)
  }

  /**
   * getGraphData
   *
   * @param targetNodeID {string}
   * @returns {IGraphData}
   */

   public getGraphData = (targetNodeID?: string): IGraphData => {

    const nodes: IGraphNode[]               = []
    const links: IGraphLink[]               = []
    const node: IGraphNode | undefined      = this.getNode()

    if (node) {
      nodes.push(node)
    }

    if (targetNodeID) {
      links.push(this.getLink(targetNodeID))
    }

    return createGraphDataObject(nodes, links)
   }
}