import { EntityConditions } from '../../types/EntityConditions'
import { EntityMessage } from '../../types/EntityMessage'
import { EntityPointerEventMessage } from "../../types/EntityPointerEventMessage"
import EntityConditional from "./EntityConditional"

/**
 * EntityClickedConditional
 *
 * @class
 * @implements {IConditional}
 */

export default class EntityClickedConditional extends EntityConditional {

  /**
   * isConditional
   *
   * @param message 
   * @param conditions 
   * @returns 
   */

  public isConditional(message: EntityPointerEventMessage, conditions: EntityConditions): boolean {
    return super.isConditional(message as EntityMessage, conditions)
  }
}