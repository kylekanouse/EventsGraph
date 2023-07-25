import IEventData from "./IEventData"
import IGraphData from "./IGraphData"

/**
 * IGraphEntity
 *
 * @interface
 */

export default interface IGraphEntity {

  /**
   * getID
   *
   * @returns {string}
   */

  getID(): string

  /**
   * getGraphData
   * 
   * @param sourceNodeID {string}
   * @returns {IGraphData}
   */

  getGraphData(sourceNodeID?: string): IGraphData

  /**
   * getEventData
   *
   * @returns {IEventData}
   */

  getEventData(): IEventData
}