import { constants } from "../../../../constants"
import IGraphData from "../../../../domain/IGraphData"
import IGraphLink from "../../../../domain/IGraphLink"
import IGraphNode from "../../../../domain/IGraphNode"
import { createGraphDataObject, createLink, createNode, formatLabel, getSeperator, mergeGraphData, normalize } from "../../../Utils"
import IMediaPublicMetricsData from "./domain/IMediaPublicMetricsData"
import { PublicMetrics } from "./PublicMetrics"

const SEP                           : string                    = getSeperator()
const PUBLIC_METRICS_ID_PREFIX      : string                    = constants.TWITTER_PUBLIC_METRICS_ID_PREFIX
const PUBLIC_METRICS_MULTIPLIER     : number                    = constants.TWITTER_PUBLIC_METRICS_VAL_MULTIPLIER

/**
 * MediaPublicMetrics
 *
 * @class
 * @extends {PublicMetrics}
 */

export default class MediaPublicMetrics extends PublicMetrics {

  private _includeCollectionNode: boolean = true

  private _collection: Map<string, number> = new Map()

  protected _icon: string | undefined = process.env.TWITTER_PUBLIC_METRICS_ICON_URL

  /**
   * constructor
   * 
   * @constructor
   * @param data {IMediaPublicMetricsData}
   * @param id {string}
   * @param sourceNodeID {string}
   */

  constructor(data: IMediaPublicMetricsData, id?: string) {

    super(PUBLIC_METRICS_ID_PREFIX, id)

    for (const [key, value] of Object.entries(data)) {
      this._collection.set(key, value)
    }
  }

  /**
   * _getGraphDataFromMetrics
   *
   * @private
   * @param {string} targetNodeID
   * @returns {IGraphData} 
   */

  private _getGraphDataFromMetrics = (targetNodeID: string): IGraphData => {

    const nodes       : IGraphNode[]    = []
    const links       : IGraphLink[]    = []
  
    if (this._collection.size) {
  
      for (const [metricName, metricValue] of this._collection.entries()) {
  
        const nodeID              = targetNodeID + SEP + PUBLIC_METRICS_ID_PREFIX + SEP + metricName
        const normalizedVal       = normalize(metricValue, 1000, 0)
        const val                 = normalizedVal * PUBLIC_METRICS_MULTIPLIER
        const label               = formatLabel(metricName + ' = ' + metricValue)

        nodes.push( createNode(
                                nodeID,
                                label,
                                val,
                                metricName,
                                '',
                                PUBLIC_METRICS_ID_PREFIX,
                                1
                              )
                  )
  
        // Link tweet to Icon node
        links.push( createLink(nodeID, targetNodeID, label) )
      }
    }
  
    return createGraphDataObject(nodes, links)
  }

  /**
   * getLabel
   *
   * @returns {string}
   */

  public getLabel = (): string => {
    return constants.TWITTER_PUBLIC_METRICS_LABEL
  }

  /**
   * getNode
   *
   * @returns {IGraphNode}
   */

  public getNode = (): IGraphNode => {
    return createNode(this.getID(), '', 5, '', this.getIcon(),  '', 0)
  }

  /**
   * getGraphData
   *
   * @param targetNodeID {string}
   * @returns {IGraphData}
   */

   public getGraphData = (targetNodeID?: string): IGraphData => {

    let graphData: IGraphData                     = createGraphDataObject()

    // Check if should add group root node
    if (this._includeCollectionNode) {

      // Add main base tweet entities group node
      graphData.nodes.push( this.getNode() )

      // If root link exists then add to graph data
      if (targetNodeID) {
        graphData.links.push( this.getLink(targetNodeID) )
      }
    }

    if (this._collection.size) {
      graphData = mergeGraphData(graphData, this._getGraphDataFromMetrics( this.getID() ))
    }

    return graphData
  }
}
