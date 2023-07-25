import { constants } from "../../../../constants"
import Entity from "../../../Entity"
import IGraphData from "../../../../domain/IGraphData"
import IGraphLink from "../../../../domain/IGraphLink"
import IGraphNode from "../../../../domain/IGraphNode"
import { createGraphDataObject, createLink, createNode, getSeperator, mergeGraphData, normalize, formatLabel } from "../../../Utils"
import ITweetPublicMetricsData from "./domain/ITweetPublicMetricsData"

const SEP                           : string = getSeperator()
const PUBLIC_METRICS_ID_PREFIX      : string = ( constants.TWITTER_PUBLIC_METRICS_ID_PREFIX) ? constants.TWITTER_PUBLIC_METRICS_ID_PREFIX : ''
const PUBLIC_METRICS_MULTIPLIER     : number = ( constants.TWITTER_PUBLIC_METRICS_VAL_MULTIPLIER) ? constants.TWITTER_PUBLIC_METRICS_VAL_MULTIPLIER : 1

/**
 * @todo look into using JSON mapping technique https://cloudmark.github.io/Json-Mapping/ for mapping JSON to Objects
 */

export default class TweetPublicMetrics extends Entity {

  private _includeCollectionNode            : boolean                   = true
  private _data                             : Map<string, number>       = new Map()
  protected _icon                           : string | undefined        = process.env.TWITTER_PUBLIC_METRICS_ICON_URL

  /**
   * constructor
   * 
   * @constructor
   * @param id {string}
   */

  constructor(id?: string) {
    super(PUBLIC_METRICS_ID_PREFIX, id)
  }

  /**
   * _getGraphDataFromMetrics
   *
   * @private
   * @returns {IGraphData} 
   */

  private _getGraphDataFromMetrics = (targetNodeID: string): IGraphData => {

    const nodes       : IGraphNode[]    = []
    const links       : IGraphLink[]    = []

    if ( this._data.size ) {

      for (let [metricType, metricValue] of this._data.entries()) {

        const nodeID              = targetNodeID + SEP + PUBLIC_METRICS_ID_PREFIX + SEP + metricType
        const normalizedVal       = normalize(metricValue, 1000, 0)
        const nodeVal             = Math.max(normalizedVal * PUBLIC_METRICS_MULTIPLIER, 5)
        const label               = formatLabel( metricType + ' = ' + metricValue )
  
        nodes.push( createNode(
                                nodeID,
                                label,
                                nodeVal,
                                '',
                                '',
                                PUBLIC_METRICS_ID_PREFIX,
                                1
                              )
                  )

        // Link tweet to Icon node
        links.push( createLink(nodeID, this.getID(), label) )
      }
    }

    return createGraphDataObject(nodes, links)
  }

  /**
   * getLabel
   *
   * @returns {string}
   */

  public getLabel(): string {
    return constants.TWITTER_PUBLIC_METRICS_LABEL
  }

  /**
   * getMetricByType
   *
   * @param type {string}
   * @returns {number | undefined}
   */

  public getMetricValueByType(type: string): number | undefined {
    return this._data.get(type)
  }

  /**
   * getNode
   *
   * @returns {IGraphNode}
   */

  public getNode(): IGraphNode {
    return createNode(this.getID(), '', 5, '', this.getIcon(),  '', 0)
  }


  /**
   * getGraphData
   *
   * @param stargetNodeID {string}
   * @returns {IGraphData}
   */

   public getGraphData = (targetNodeID?: string): IGraphData => {

    let graphData: IGraphData = createGraphDataObject()

    // Check if should add group root node
    if (this._includeCollectionNode) {

      // Add main base tweet entities group node
      graphData.nodes.push( this.getNode() )

      // If root link exists then add to graph data
      if (targetNodeID) {
        graphData.links.push( this.getLink(targetNodeID) )
      }
    }

  
    if (this._data.size) {
      graphData = mergeGraphData(graphData, this._getGraphDataFromMetrics( this.getID() ))
    }

    return graphData
  }

  /**
   * loadData
   *
   * @param {ITweetPublicMetricsData} data
   * @returns {TweetPublicMetrics}
   */

  public loadData(data: ITweetPublicMetricsData): TweetPublicMetrics {
    // parse object data into map
    Object.entries(data).map( ([metricType, metricValue]: [string, any]): void => {
      this._data.set(metricType, metricValue)
    })
    return this
  }
}