import Node from "../lib/Node"

/**
 * IGraphCallback
 *
 * @interface
 */

export default interface IGraphCallback { 
  (node: Node): void 
}