import IConditional from "../../domain/IConditional"
import { NodeConditions } from '../../types/NodeConditions'
import Node from "../Node"
import { NodeFocusedMessage } from "../../types/NodeFocusedMessage"

/**
 * NodeFocusedConditional
 *
 * @class
 * @implements {IConditional}
 */

export default class NodeFocusedConditional implements IConditional {

  /**
   * isConditional
   *
   * @param message 
   * @param conditions 
   * @returns 
   */

  public isConditional(message: NodeFocusedMessage, conditions: NodeConditions): boolean {

    const entity = message.entity as Node
    let pass: boolean

    // Switch through each condition to test
    switch(true) {
      case (conditions.isFocused !== undefined && conditions.isFocused !== message.isFocused):
      case (entity.entityTypeID !== Node.TYPE_ID):
      case (conditions.id && conditions.id !== entity.id.toString()):
        pass = false
        break;
      default:
        // If it got here than let it pass
        pass = true
    }

    return pass
  }
}