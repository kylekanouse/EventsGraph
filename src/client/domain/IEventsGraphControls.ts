import Entity from '../lib/Entity'

/**
 * EventsGraphControls
 *
 * @interface
 */

export default interface EventsGraphControls<T> {
  next(): T
  prev(): T
  focusEntity(entity: Entity<any>): T
  moveCameraToEntity(entity: Entity<any>): T
}