import { EntityConditions } from '../../types/EntityConditions'
import { EntityFocusedMessage } from "../../types/EntityFocusedMessage"
import { EntityMessage } from '../../types/EntityMessage'
import { EntityType } from '../../types/EntityType'
import EntityConditional from "./EntityConditional"

/**
 * EntityFocusedConditional
 *
 * @class
 * @implements {IConditional}
 */

export default class EntityFocusedConditional extends EntityConditional {

  /**
   * isConditional
   *
   * @param message 
   * @param conditions 
   * @returns 
   */

  public isConditional(message: EntityFocusedMessage, conditions: EntityConditions): boolean {

    const entity = message.entity
    let pass: boolean

    // Switch through each condition to test
    switch(true) {
      case (conditions.isFocused !== undefined && conditions.isFocused !== message.isFocused) :
        pass = false
        break
      default:
        // If it got here than let it pass
        pass = true
    }

    return (pass) ? super.isConditional(message as EntityMessage, {...conditions, isFocused: undefined}) : pass
  }
}