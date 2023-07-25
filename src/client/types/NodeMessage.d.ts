import Node from '../lib/Node'
import Entity from '../lib/Entity'

/**
 * NodeMessage
 * 
 * @type
 */

export type NodeMessage = {
  node: Node,
  entity?: Entity<Node>
}