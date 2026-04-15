import { EntityMessage } from "./EntityMessage"

/**
 * EntityActiveMessage
 */

export type EntityActiveMessage = EntityMessage & {
  isActive: boolean
}