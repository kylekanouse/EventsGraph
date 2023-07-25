import IGraphNode from "./IGraphNode";
import IGraphLink from "./IGraphLink";

/**
 * IGraphData
 *
 * @description Main data structure for containg graph data
 * @interface
 *
 */

export default interface IGraphData {
  nodes: any[],
  links: any[]
}