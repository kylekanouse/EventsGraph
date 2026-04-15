import { Object3D } from "three"
import { EntityType } from "../types/EntityType"
import Entity from "./Entity"
import Node from "./Node"
import { createImageObject3D, extractCustomNodeParams } from "./Utils"

/**
 * CONST
 */

const ID          : EntityType      = 'NodeUrl',
      ICON_URL    : string          = './assets/images/external-link.icon.png'

/**
 * NodeUrl
 *
 * @description Main entity to be used by nodes to create clickable objects to represent external URL links
 * @class
 * @extends {Entity}
 */

export default class NodeUrl extends Entity<NodeUrl> {

  public static TYPE_ID           : EntityType              = ID

  private _parentNode             : Node

  private _url                    : string | undefined


  /**
   * @constructor
   * @param {Node} node
   */

  constructor( node: Node ) {

    // Call parent constructor
    super( 
          createImageObject3D(ICON_URL),
          node.id.toString().concat('-url'),
        )

    // Get internal reference to node object
    this._parentNode = node

    // Extract URL from custom paramters added to data object
    const { url }                         = extractCustomNodeParams( node.getData() )

    // Get internal reference to url
    this._url = url

  }

  /**
   * ############################################### GETTER / SETTER
   */

  get entityTypeID(): EntityType {
    return NodeUrl.TYPE_ID
  }

  /**
   * url
   *
   * @returns {string}
   */

  get url(): string {
    return (this._url) ? this._url : ''
  }

  /**
   * ############################################### Protected
   */

    /**
   * _updatePosition
   *
   * @protected
   */

  protected _updatePosition(): void {

    if (!this._object3D || ! this._parentNode.object3D) { return }

    const pos: Coords = {
      x: this._parentNode.object3D.position.x,
      y: this._parentNode.object3D.position.y + 20,
      z: this._parentNode.object3D.position.z,
    }

    // Set position of object
    this._object3D.position.set(pos.x, pos.y, pos.z)
  }

  /**
   * ############################################### PUBLIC
   */

  isFocusable(): boolean {
    return false
  }

  /**
   * onDblClick
   *
   * @param {MouseEvent} event
   * @returns {NodeUrl}
   */

  onDblClick(event: MouseEvent): NodeUrl {

    if (this._url) {
      let handle = window.open(this.url, this._parentNode.id.toString())
      handle?.blur()
      window.focus()
    }

    return this
  }
}