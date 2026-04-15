import { BufferGeometry, Camera, Group, Material, Scene,  WebGLRenderer } from "three"
import { GraphNodeObject } from "../types/GraphNodeObject"
import GraphEntity from "./GraphEntity"
import NodeUrl from './NodeUrl'
import NodeDisplay from './NodeDisplay'
import NodeFocusedObserved from './observers/NodeFocusedObserved'
import NodeClickedObserved from './observers/NodeClickedObserved'
import NodeActiveObserved from './observers/NodeActiveObserved'
import { EntityConditions } from "../types/EntityConditions"
import { EntityType } from "../types/EntityType"

/**
 * CONST
 */

const ID: EntityType = 'Node'

/**
 * Node
 *
 * @class
 * @extends {GraphEntity<Node, GraphNodeObject>}
 */

export default class Node extends GraphEntity<Node, GraphNodeObject> {

  public static TYPE_ID     : EntityType = ID

  private _graphObj         : GraphNodeObject

  private _urlNode          : NodeUrl

  private _value            : number | undefined

  private _height           : number | undefined

  private _geometry         : BufferGeometry | undefined

  private _display          : NodeDisplay

  private _isDisplayVisible : boolean = false

  /**
   * constructor
   * 
   * @param {GraphNodeObject} node
   * @param {Scene} scene
   * @constructor
   */

  constructor(node: GraphNodeObject) {

    // Call abstract constructor
    super(node.__threeObj, node.id)

    // assign local reference to node object
    this._graphObj                        = node
    this._value                           = node.val
    this._urlNode                         = new NodeUrl( this )
    this._display                         = new NodeDisplay(this, this._graphObj?.desc || this.label, this.label, this._urlNode.url, 'Node')

    // Use onBeforeRender to get access to Three.js elements that 3D force Graph does not expose
    if (this.object3D) {
      this.object3D.onBeforeRender        = (
                                              renderer: WebGLRenderer,
                                              scene: Scene,
                                              camera: Camera,
                                              geometry: BufferGeometry,
                                              material: Material,
                                              group: Group
                                            ) => {
                                              this._rendered(renderer, scene, camera, geometry, material, group)
                                            }
    }

    this._initNode()
  }

  /**
   * ############################################### GETTER / SETTER
   */

  get entityTypeID(): EntityType {
    return Node.TYPE_ID
  }

  /**
   * defaultLabel
   * 
   * @returns {string}
   */

  get defaultLabel(): string { return ID + " " + this.id }

  /**
   * label
   *
   * @type {string}
   */

  get label(): string { return (this._graphObj.label) ? this._graphObj.label : this.defaultLabel }

  /**
   * height
   *
   * @type {number | undefined}
   */

  get height(): number | undefined { return this._height }

  /**
   * icon
   * 
   * @returns {string}
   */

  get icon(): string | undefined { return this._graphObj.icon }

  /**
   * value
   * 
   * @returns {number | undefined}
   */

  get value(): number | undefined { return this._value }

  /**
   * type
   * 
   * @returns {string | undefined}
   */

  get type(): string | undefined { return this._graphObj.type }

  /**
   * isActive
   *
   * @returns {boolean}
   */

  get isActive(): boolean { return this._isActive }

  /**
   * ############################################### PRIVATE
   */

  /**
   * _activateNode
   *
   * @private
   * @returns {Node}
   */

  private _activateNode(): Node { return this._displayVisible() }

  /**
   * _blurredNode
   *
   * @returns {Node}
   */

  private _blurrNode(): Node { return this }

  /**
   * _deactivateNode
   *
   * @private
   * @returns {Node} 
   */

  private _deactivateNode(): Node { return this._hideDisplay() }

  /**
   * _displayVisible
   *
   * @returns 
   */

  private _displayVisible(): Node {
    
    // console.log('Node | _displayVisible() : this._isDisplayVisible = ', this._isDisplayVisible )
    if (this._isDisplayVisible) { return this }

    this._urlNode.addToStage()
    this._display.addToStage()
    this._isDisplayVisible = true

    return this
  }

  /**
   * _onFocused
   *
   * @returns {Node}
   */

  private _focusNode(): Node { return this }

  /**
   * _hideDisplay
   *
   * @private
   */

  private _hideDisplay(): Node {
    console.log('Node | _hideDisplay() : this._isDisplayVisible = ', this._isDisplayVisible )
    if (!this._isDisplayVisible) { return this }

    this._urlNode.removeFromStage()
    this._display.removeFromStage()
    this._isDisplayVisible = false

    return this
  }

  /**
   * _initNode
   */

  private _initNode(): void {
  
    // Setup ID condition for callbacks
    const idCondition: EntityConditions = {id: this.id.toString()}

    // Setup Clicked Observe
    NodeClickedObserved.onUpdate({cb: this._onClick.bind(this), conditions: idCondition})

    // Add activated update callback
    NodeActiveObserved.onUpdate({
      cb: this._activateNode.bind(this), 
      conditions: {...idCondition, ...{isActive: true}} 
    })

    // Add deactivate update callback
    NodeActiveObserved.onUpdate({
      cb: this._deactivateNode.bind(this), 
      conditions: {...idCondition, ...{isActive: false}} 
    })

    // Add focysed update callback
    NodeFocusedObserved.onUpdate({
      cb: this._focusNode.bind(this), 
      conditions: {...idCondition, ...{isFocused: true}} 
    })

    // Add blurred update callback
    NodeFocusedObserved.onUpdate({
      cb: this._blurrNode.bind(this), 
      conditions: {...idCondition, ...{isFocused: false}} 
    })
  }

  /**
   * _onClick
   *
   * @param {MouseEvent} event
   */

  private _onClick(event: MouseEvent): void {}

  /**
   * _rendered
   *
   * @description Used to gain access to Three js elements that 3D force graph does not expose in VR version
   * @param {WebGLRenderer} renderer
   * @param {Scene} scene
   * @param {Camera} camera
   * @param {BufferGeometry} geometry
   * @param {Material} material
   * @param {Group} group
   */

  private _rendered(
                    renderer: WebGLRenderer,
                    scene: Scene,
                    camera: Camera,
                    geometry: BufferGeometry,
                    material: Material,
                    group: Group
                  ): void {

    this._geometry = geometry

    this._geometry.computeBoundingSphere()
    this._height = (this._geometry.boundingSphere?.radius) ? this._geometry.boundingSphere.radius * 2 : 20
  }

  /**
   * _updateHoverPosition
   *
   * @protected
   */

  protected _updateHoverPosition(): void {

    if (!this._hoverObj) { return }
  
    const yOffest: number = (this.height!==undefined) ? this.height : 20

    const pos: Coords = {
      x: (this._graphObj.x) ? this._graphObj.x : 0,
      y: (this._graphObj.y) ? this._graphObj.y + yOffest: 0,
      z: (this._graphObj.z) ? this._graphObj.z : 0
    }

    this._hoverObj.position.set( pos.x, pos.y, pos.z )
  }

  /**
   * ############################################### PUBLIC
   */
  
  /**
   * getData
   * 
   * returns EventsGraph data as graph data
   * 
   * @returns {GraphNodeObject}
   */

  getData(): GraphNodeObject { return this._graphObj }

  /**
   * onBlurred
   *
   * @returns {Node}
   */

  onBlurred(): Node { super.onBlurred(); return this }

  /**
   * onClick
   *
   * @param {MouseEvent} event
   */

  onClick(event?: MouseEvent): Node { super.onClick(event); return this }

  /**
   * onDblClick
   *
   * @param {MouseEvent} event
   * @returns 
   */

  onDblClick(event?: MouseEvent): Node { super.onDblClick(event); return this }

  /**
   * onFocused
   *
   * @returns {Node}
   */

  onFocused(): Node { super.onFocused(); return this }

  /**
   * onHover
   *
   * @param {GraphNodeObject} node
   * @returns {Node}
   */

  onHover(): Node { super.onHover(); return this }

  /**
   * onOut
   *
   * @param {GraphNodeObject} node
   * @returns {Node}
   */

  onOut(): Node { super.onOut(); return this }

  /**
   * activate
   *
   * @returns {Node}
   */

  activate(): Node { super.activate(); return this }

  /**
   * onDeactivate
   *
   * @returns {Node}
   */

  deactivate(): Node { super.deactivate(); return this }
}