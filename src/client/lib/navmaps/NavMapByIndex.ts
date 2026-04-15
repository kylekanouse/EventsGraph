import { NavMapType } from '../../types/NavMapType'
import Entity from '../Entity'
import NavMap from './NavMap'

/**
 * CONST
 */

export const TYPE_ID      : NavMapType          = 'index'

export const LABEL        : string              = 'Sequential'

/**
 * NavMapByIndex
 *
 * @class
 * @extends {NavMap}
 */

export default class NavMapByIndex extends NavMap {

  protected _label: string = LABEL

  /**
   * constructor
   *
   * @param entities 
   */

  constructor(entities: Map<string, Entity<any>>, typeID?: NavMapType) {
    super( (typeID) ? typeID : TYPE_ID, entities)
  }

  /**
   * _update
   *
   * @description create a basic map of entities based on their repective index position
   * @private
   */

  protected _createMap(): void {

    let index: number = 0

    this._entities.forEach((entity: Entity<any>, key: string) => {

      // Add to map
      this._map.set( index, key)

      // Use ID to make ID map to index
      this._idMap.set(key, index)

      index++
    })
  }
}
