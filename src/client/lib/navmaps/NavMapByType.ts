import { NavMapType } from '../../types/NavMapType'
import Entity from '../Entity'
import { UniqueStrings } from '../../types/UniqueStrings'
import NavMapByIndex from './NavMapByIndex'
import Node from '../Node'

/**
 * CONST
 */

export const TYPE_ID        : NavMapType      = 'type'

export const LABEL          : string          = 'By Type'

/**
 * NavMapByType
 *
 * @class
 * @extends {NavMap}
 */

export default class NavMapByType extends NavMapByIndex {

  protected _label                : string                = LABEL

  private _selectedTypes          : UniqueStrings         = new Set()

  /**
   * constructor
   *
   * @param entities 
   */

  constructor(entities: Map<string, Entity<any>>) {
    super(entities, TYPE_ID)
  }

  /**
   * selectedTypes
   *
   * @returns
   */

  get selectedTypes(): UniqueStrings {
    return this._selectedTypes
  }

  /**
   * selectedTypes
   *
   * @param {UniqueStrings} seectedTypes
   */

  set selectedTypes(seectedTypes: UniqueStrings) {
    this._selectedTypes = seectedTypes
  }

  /**
   * getNext
   *
   * @returns 
   */

  public getNext(): Node | undefined {

    let count       : number                      = 0,
        response    : Node | undefined            = undefined

    while(count < this._map.size) {

      count++

      const node: Node | undefined = super.getNext() as Node

      if (!node || !node.type) { continue }

      // Check if type is included in selected types
      if (this._selectedTypes.size > 0 && ![...this._selectedTypes].includes(node.type) ) { continue }

      response = node

      break
    }

    return response
  }

  /**
   * getPrev
   *
   * @returns 
   */

  public getPrev(): Node | undefined {

    let count       : number                      = 0,
        response    : Node | undefined            = undefined

    while(count < this._map.size) {

      count++

      const node: Node | undefined = super.getPrev() as Node

      if (!node || !node.type) { continue }

      // Check if type is included in selected types
      if (this._selectedTypes.size > 0 && ![...this._selectedTypes].includes(node.type) ) { continue }

      response = node

      break
    }

    return response
  }
}
