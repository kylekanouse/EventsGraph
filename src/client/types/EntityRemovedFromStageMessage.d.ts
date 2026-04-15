import { EntityMessage } from "./EntityMessage"
import { ObjectOnStageAction } from "./EntityOnStageActions"

/**
 * EntityRemovedFromStageMessage
 */

export type EntityRemovedFromStageMessage = EntityMessage & {
  action: EntityOnStageAction = 'removed'
}