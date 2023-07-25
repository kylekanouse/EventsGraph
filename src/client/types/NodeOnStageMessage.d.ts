import Node from '../lib/Node'
import { EntityOnStageMessage } from "./EntityOnStageMessage"

/**
 * NodeOnStageMessage
 */

export type NodeOnStageMessage = EntityOnStageMessage & {
  entity: Node
}