import { constants } from "../../../../constants"
import Entity from "../../../Entity"
import IGraphData from "../../../../domain/IGraphData"
import IGraphNode from "../../../../domain/IGraphNode"
import { createGraphDataObject, createNode, formatLabel, mergeGraphData } from "../../../Utils"
import IMediaData from "./domain/IMediaData"
import MediaPublicMetrics from "./MediaPublicMetrics"

/**
 * Media
 *
 * @class
 * @implements {Entity}
 */

export default class Media extends Entity {

  protected _durationMS: number | undefined

  protected _height: number | undefined

  protected _nonPublicMetrics: any | undefined

  protected _organicMetrics: any | undefined

  protected _url: string | undefined

  protected _previewImageUrl: string | undefined

  protected _promotedMetrics: any | undefined
  
  protected _publicMetrics: MediaPublicMetrics | undefined
  
  protected _width: number | undefined

  protected _icon: string = ''

  protected _media_key: string | undefined

  

  /**
   * constructor
   *
   * @param data {IMediaData}
   * @param id {string | undefined}
   */

  constructor(data: IMediaData) {

    // Call parent constructor
    super(data.type, data.media_key)

    // Extract values from JSON data object
    this._durationMS                 = data.duration_ms
    this._height                     = data.height
    this._url                        = data.url
    this._previewImageUrl            = data.preview_image_url
    this._width                      = data.width
    this._media_key                  = data.media_key

    if (data.public_metrics) {
      this._publicMetrics = new MediaPublicMetrics( data.public_metrics, this._getMediaPublicMetricsID() ) 
    }

    if (this._url) {
      this._icon = this._url
    } else if (this._previewImageUrl) {
      this._icon = this._previewImageUrl
    }
  }

  /**
   * _getMediaPublicMetricsID
   *
   * @returns {string}
   */

  private _getMediaPublicMetricsID(): string {
    return this.getID() + constants.SEP + constants.TWITTER_PUBLIC_METRICS_POSTFIX_ID
  }

  /**
   * getLabel
   *
   * @returns {string}
   */

  public getLabel(): string {
    return formatLabel((this._url) ? this._url : (this._previewImageUrl) ? this._previewImageUrl : '')
  }

  /**
  * getNode
  *
  * @returns {IGraphNode}
  */

  getNode(): IGraphNode {
    return createNode(this.getID(), '', 1, '', this.getIcon(), this.getType())
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

    // Check for target node and add link
    if (targetNodeID) {
      graphData.links.push ( this.getLink(targetNodeID) )
    }

    // Get public metrics
    if (this._publicMetrics) {
      graphData = mergeGraphData(graphData, this._publicMetrics.getGraphData( this.getID() ))
    }

    return graphData
  }
}