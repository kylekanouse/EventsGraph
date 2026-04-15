import IConditional from "../../domain/IConditional"
import { EntityConditions } from "../../types/EntityConditions"
import { EntityMessage } from "../../types/EntityMessage"


export default class EntityConditional implements IConditional {

  /**
   * isConditional
   *
   * @param message 
   * @param conditions 
   * @returns 
   */

   public isConditional(message: EntityMessage, conditions: EntityConditions): boolean {

    const entity = message.entity
    let pass: boolean

    // Switch through each condition to test
    switch(true) {
      case (conditions.id && conditions.id !== entity.id.toString()):
      case (conditions.typeID && conditions.typeID !== entity.entityTypeID):
      case (conditions.isActive !== undefined && conditions.isActive != entity.isActive):
      case (conditions.isFocused !== undefined && conditions.isFocused != entity.isFocused):
      case (conditions.isOnStage !== undefined && conditions.isOnStage != entity.isOnStage):
      case (conditions.isOver !== undefined && conditions.isOver != entity.isOver):
        pass = false
        break
      default:
        // If it got here than let it pass
        pass = true
    }

    return pass
   }
}