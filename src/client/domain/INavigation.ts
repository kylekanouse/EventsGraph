import Entity from "../lib/Entity"

/**
 * INavigation
 *
 * @interface
 */

export default interface INavigation {
  getNext(): Entity<any> | undefined
  getPrev(): Entity<any> | undefined
  setCurrent(id: string | number): INavigation
}