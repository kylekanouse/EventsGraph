
/**
 * EntityConditions
 * 
 * @description conditional dimensions to be used for decision making regarding Entity Is Active state update
 * @type
 */

export type EntityConditions = {
  isActive?: boolean,
  id?: string,
  typeID?: string,
  isFocused?: boolean,
  isOver?: boolean,
  isOnStage?: boolean,
}