import { NodeMessage } from "./NodeMessage"

/**
 * ActiveNodeMessage
 *
 * @type
 */

export type ActiveNodeMessage = NodeMessage & {
  isActive: boolean
}