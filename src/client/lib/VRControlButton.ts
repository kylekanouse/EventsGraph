import { Object3D } from "three"
import { EntityType } from "../types/EntityType"
import Entity from "./Entity"

/**
 * CONST
 */

const ID: EntityType = 'VRControlButton'

/**
 * VRControlButton
 *

 * @class
 * @extends {Entity<VRControlButton>}
 */

export default class VRControlButton extends Entity<VRControlButton> {

  /**
   * TYPE_ID
   *
   * @static
   */

  public static TYPE_ID: EntityType = ID

  /**
   * @constructor
   * @param {Node} node
   */

  constructor( btn: Object3D, id: string ) {

    // Call parent constructor
    super( btn, id)
  }

  /**
   * button
   * 
   * @description getter helper for accessing object3D
   * @returns any
   */

  get button(): any {
    return this._object3D
  }

  /**
   * entityTypeID
   */

  get entityTypeID(): EntityType {
    return VRControlButton.TYPE_ID
  }

  /**
   * ############################################### PUBLIC
   */

  isFocusable(): boolean {
    return false
  }
}