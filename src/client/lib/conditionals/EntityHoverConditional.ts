import { EntityConditions } from '../../types/EntityConditions'
import { EntityHoverMessage } from "../../types/EntityHoverMessage"
import { EntityMessage } from "../../types/EntityMessage"
import EntityConditional from "./EntityConditional"

/**
 * EntityHoverConditional
 *
 * @class
 * @implements {IConditional}
 */

export default class EntityHoverConditional extends EntityConditional {

  /**
   * isConditional
   *
   * @param message 
   * @param conditions 
   * @returns 
   */

  public isConditional(message: EntityHoverMessage, conditions: EntityConditions): boolean {

    const entity = message.entity
    let pass: boolean

    // Switch through each condition to test
    switch(true) {
      // Check Context specific conditions
      case (conditions.isOver !== undefined && conditions.isOver !== message.isOver):
        pass = false
        break;
      default:
        // If it got here than let it pass
        pass = true
    }

    return (pass) ? super.isConditional(message as EntityMessage, {...conditions, isOver: undefined}) : pass
  }
}