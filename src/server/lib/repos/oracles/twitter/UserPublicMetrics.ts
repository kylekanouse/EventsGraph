import { constants } from "../../../../constants"
import Entity from "../../../Entity"
import IGraphData from "../../../../domain/IGraphData"
import IGraphLink from "../../../../domain/IGraphLink"
import IGraphNode from "../../../../domain/IGraphNode"
import { createGraphDataObject, createLink, createNode, formatLabel, formatNumber, normalize } from "../../../Utils"
import IUserPublicMetricsData from "./domain/IUserPublicMetricsData"

// Get environment vars
const USER_PUBLIC_METRICS_ICON_URL: string            = (process.env.TWITTER_USER_PUBLIC_METRICS_ICON_URL) ? process.env.TWITTER_USER_PUBLIC_METRICS_ICON_URL : ''
const TWITTER_METRICS_NORMALIZE_MULTIPLIER: number    = (process.env.TWITTER_METRICS_NORMALIZE_MULTIPLIER) ? parseInt(process.env.TWITTER_METRICS_NORMALIZE_MULTIPLIER) : 100

/**
 * UserPublicMetrics
 * 
 * @class
 * @extends {PublicMetrics}
 */

export default class UserPublicMetrics extends Entity {

  private _value: number = 0

  private _metrics: IUserPublicMetricsData

  protected _icon: string = USER_PUBLIC_METRICS_ICON_URL

  /**
   * constructor
   *
   * @param data {IUserPublicMetricsData}
   * @param id {string | undefined}
   */

  constructor(data: IUserPublicMetricsData, id?: string) {

    // Call base class constructor with type ID
    super( constants.TWITTER_PUBLIC_METRICS_ID_PREFIX, id)

    // console.log('UserPublicMEtrics | constructor | id = ', id, ' | sourceNodeID = ', sourceNodeID)
    this._metrics = data

    this._setValue()
  }

  /**
   * _setValue
   * 
   * @private
   * @returns {void}
   */

  private _setValue(): void {
    let count = 0
    for (let metricValue of Object.values(this._metrics)) {
      if (metricValue) {
        ++count
      }
    }
    this._value = count
  }

  private _getMetricID(type: string): string {
    return this.getID() + constants.SEP + type
  }

  /**
   * getMetric
   *
   * @param metricName {string}
   * @returns {number}
   */



  /**
   * getLabel
   *
   * @returns {string}
   */

  public getLabel(): string {
    return constants.TWITTER_USER_PUBLIC_METRICS_LABEL
  }

   /**
    * getRootNode
    *
    * @returns {IGraphNode}
    */
 
  public getNode(): IGraphNode {

    return createNode(
                      this.getID(),
                      this.getLabel(),
                      this.getValue(),
                      '',
                      this.getIcon(),
                      this.getType(),
                      1
                    )
  }

  /**
   * getGraphData
   *
   * @returns {IGraphData}
   */

  public getGraphData(targetNodeID?: string): IGraphData {

    // Graph data elements
    const nodes           : IGraphNode[] = []
    const links           : IGraphLink[] = []

    // Add Root User Public Metrc node and link
    nodes.push( this.getNode() )

    if (targetNodeID) {
      links.push( this.getLink(targetNodeID) ) 
    }

    // Loop through metrics
    for (let [metricType, metricValue] of Object.entries(this._metrics)) {

      // Normalize metrics value
      const value = (metricValue) ? Math.min(30, (1 / normalize(metricValue, 0, TWITTER_METRICS_NORMALIZE_MULTIPLIER) * 1000000) - 1000000) : 0

      const displayValue = formatNumber(metricValue)

      const label: string = formatLabel(`${metricType} = ${displayValue}`)

      // Add Metric Node to array
      nodes.push(
                  createNode(
                              this._getMetricID(metricType),
                              label,
                              value
                            )
                )

      // Add Link from Root to child Metric
      links.push( 
                  createLink(
                              this.getID(),
                              this._getMetricID(metricType), 
                              label
                            )
                )
    }

    return createGraphDataObject(nodes, links)
  }

  /**
   * getValue
   *
   * @returns {number}
   */

  public getValue(): number {
    return this._value
  }
}