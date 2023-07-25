import IConditional from "../../domain/IConditional"
import { EntityConditions } from '../../types/EntityConditions'
import { NodePointerEventMessage } from "../../types/NodePointerEventMessage"
import Node from "../Node"

/**
 * NodeClickedConditional
 *
 * @class
 * @implements {IConditional}
 */

export default class NodeClickedConditional implements IConditional {

  /**
   * isConditional
   *
   * @param message 
   * @param conditions 
   * @returns 
   */

  public isConditional(message: NodePointerEventMessage, conditions: EntityConditions): boolean {

    const entity = <unknown> message.entity as Node
    let pass: boolean

    // Switch through each condition to test
    switch(true) {
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