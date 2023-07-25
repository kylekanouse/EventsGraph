import { EntityConditions } from '../../types/EntityConditions'
import { EntityMessage } from "../../types/EntityMessage"
import { EntityOnStageMessage } from '../../types/EntityOnStageMessage'
import EntityConditional from "./EntityConditional"

/**
 * EntityOnStageConditional
 *
 * @class
 * @implements {IConditional}
 */

export default class EntityOnStageConditional extends EntityConditional {

  /**
   * isConditional
   *
   * @param message 
   * @param conditions 
   * @returns 
   */

  public isConditional(message: EntityOnStageMessage, conditions: EntityConditions): boolean {

    const entity = message.entity
    let pass: boolean

    // Switch through each condition to test
    switch(true) {
      // Check Context specific conditions
      case (conditions.isOnStage !== undefined && conditions.isOnStage !== message.action):
        pass = false
        break;
      default:
        // If it got here than let it pass
        pass = true
    }

    return (pass) ? super.isConditional(message as EntityMessage, {...conditions, isOnStage: undefined}) : pass
  }
}