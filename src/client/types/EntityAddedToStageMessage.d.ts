import { EntityMessage } from "./EntityMessage"
import { EntityOnStageAction } from "./EntityOnStageActions"

/**
 * EntityAddedToStageMessage
 */

export type EntityAddedToStageMessage = EntityMessage & {
  action: EntityOnStageAction = 'added'
}