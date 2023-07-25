  /// <reference path='../types/index.d.ts' />
import Entity from "./Entity"
import Node from "./Node"
import VRPanel from './VRPanel'
import { Box3, Mesh } from "three"
import { EntityType } from "../types/EntityType"

/**
 * CONST
 */

const ID: EntityType = 'NodeDisplay'

/**
 * NodeDisplay
 *
 * @class
 * @extends {Entity<NodeDisplay>}
 */

export default class NodeDisplay extends Entity<NodeDisplay> {

  public static TYPE_ID           : EntityType                = ID

  private _node                   : Node

  private _box                    : Box3 | undefined

  private _mesh                   : Mesh[] = []

  /**
   * @constructor
   * @param {GraphNodeObject} node
   * @param {Scene} scene
   */

  constructor( node: Node, content: string, title?: string, imageUrl?: string, caption?: string ) {

    // Call parent constructor
    super( 
          new VRPanel(content, title, imageUrl, caption),
          node.id.toString().concat('-' + ID)
        )

    // Get internal reference to node object
    this._node  = node


  }

  /**
   * entityTypeID
   */

  get entityTypeID(): EntityType {
    return NodeDisplay.TYPE_ID
  }

  /**
   * ############################################### PRIVATE
   */

  /**
   * _updatePosition
   *
   * @protected
   */

  protected _updatePosition(): void {

    if (!this._object3D || ! this._node.object3D) { return }

    if (!this._box) {
      this._box = new Box3().setFromObject(this._object3D)
    }

    // Get controls position based on ref node position
    const pos = {
      x: this._node.object3D.position.x + 10 + this._box.max.x,
      y: this._node.object3D.position.y,
      z: this._node.object3D.position.z,
    },
    mesh = this._mesh[0]

    // Set position of object
    this._object3D.position.set(pos.x, pos.y, pos.z)
  }

  /**
   * ############################################### PUBLIC
   */

   isFocusable(): boolean {
    return false
  }
}