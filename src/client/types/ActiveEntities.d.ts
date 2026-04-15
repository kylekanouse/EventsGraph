import Entity from "../lib/Entity"
import { EntityType } from "./EntityType"

/**
 * ActiveEntities
 *
 * @type
 */

export type ActiveEntities = Map<string, Entity<EntityType>>