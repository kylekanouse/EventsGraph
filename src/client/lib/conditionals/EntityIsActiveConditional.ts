import { EntityConditions } from '../../types/EntityConditions'
import { EntityActiveMessage } from '../../types/EntityActiveMessage'
import { EntityMessage } from "../../types/EntityMessage"
import EntityConditional from "./EntityConditional"

/**
 * EntityIsActiveConditional
 *
 * @class
 * @implements {IConditional}
 */

export default class EntityIsActiveConditional extends EntityConditional {

  /**
   * isConditional
   *
   * @param message 
   * @param conditions 
   * @returns 
   */

  public isConditional(message: EntityActiveMessage, conditions: EntityConditions): boolean {

    const entity = message.entity
    let pass: boolean

    // Switch through each condition to test
    switch(true) {
      case (conditions.isActive !== undefined && conditions.isActive !== message.isActive):
        pass = false
        break
      default:
        // If it got here than let it pass
        pass = true
    }

    return (pass) ? super.isConditional(message as EntityMessage, {...conditions, isActive: undefined}) : pass
  }
}