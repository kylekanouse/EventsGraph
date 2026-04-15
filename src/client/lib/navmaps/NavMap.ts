import INavigation from "../../domain/INavigation"
import Entity from "../Entity"
import { NavMapType } from  '../../types/NavMapType'
import { Entities } from "../../types/Entities"

/**
 * NavMap
 * 
 * @abstract
 * @class
 * @implements {INavigation}
 */

export default abstract class NavMap implements INavigation {

  protected _typeID               : NavMapType

  protected _label                : string                        = ''

  protected _map                  : Map<number, string>           = new Map()

  protected _idMap                : Map<string, number>           = new Map()

  protected _index                : number                        = 0

  protected _entities             : Entities

  /**
   * constructor
   *
   * @param {Map<string, Entity<any>>} entities
   */

  constructor(typeID: NavMapType, entities: Map<string, Entity<any>>) {

    // Set internals
    this._typeID      = typeID
    this._entities    = entities

    // Create map
    this._createMap()
  }

  /**
   * _createMap
   * @param entities 
   */

  protected abstract _createMap(): void

  /**
   * typeID
   *
   * @type {NavMapType}
   */

  get typeID(): NavMapType { return this._typeID }

  /**
   * getNext
   *
   * @returns 
   */

   public getNext(): Entity<any> | undefined {

    // Get next id in the map
    const id: string | undefined = this._map.get(Math.abs(++this._index) % this._map.size )

    return (id) ? this._entities.get(id ) : undefined
  }

  /**
   * getPrev
   *
   * @returns 
   */

  public getPrev(): Entity<any> | undefined {

    // If index is negative then covert to corresponding positive index
    if (this._index <= 0) {
      this._index = this._map.size + this._index
    }

    // Get prev id in the map
    const id: string | undefined = this._map.get(Math.abs(--this._index) % this._map.size )

    return (id) ? this._entities.get(id ) : undefined
  }

  /**
   * setIndexByID
   *
   * @param id
   */

  public setCurrent(id: string | number): NavMap {

    let index

    if (typeof id === 'number') {
      if (Math.abs(id) > this._map.size) { id = id % this._map.size }
      this._index = (id >= 0) ? id : this._map.size + id
    } else if ((index = this._idMap.get(id)) !== undefined) {
      this._index = index
    }

    return this
  }
}