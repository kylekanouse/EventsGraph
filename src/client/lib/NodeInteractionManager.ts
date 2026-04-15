import { Raycaster, Vector2, Camera, Intersection } from 'three'
import Node from './Node'
import Cursor from './Cursor'
import { NodePointerEventMessage } from '../types/NodePointerEventMessage'
import NodeClickedObserved from './observers/NodeClickedObserved'
import EntitiesOnStageObserved from './observers/EntitiesOnStageObserved'
import VRControlsOnStageObserved from './observers/VRControlsOnStageObserved'
import Entity from './Entity'
import { Object3Ds } from '../types/Object3Ds'
import InteractionModeManager from './InteractionModeManager'

const raycaster: Raycaster = new Raycaster()

let selectState: boolean = false
let mouse: Vector2 = new Vector2()
let mouseTracked: boolean = false

/**
 * NodeInteractionManager
 *
 * @description Manages click, hover, focus, activate handlers and raycasting for EventsGraph
 */

export default class NodeInteractionManager {

  private _currentNode: Node | undefined
  private _isIntersecting: boolean = false
  private _cursor: Cursor = new Cursor()
  private _activeNodes: Set<Node> = new Set()

  private _onNodeClickedHandler: ((event: NodePointerEventMessage) => void) | undefined
  private _getCamera: () => Camera

  constructor(getCamera: () => Camera) {
    this._getCamera = getCamera
  }

  get currentNode(): Node | undefined { return this._currentNode }

  set currentNode(node: Node | undefined) { this._currentNode = node }

  get isIntersecting(): boolean { return this._isIntersecting }

  /**
   * init
   *
   * @param onNodeClicked callback when a node is clicked at EventsGraph scope
   * @returns {NodeInteractionManager}
   */

  init(onNodeClicked: (event: NodePointerEventMessage) => void): NodeInteractionManager {

    this._onNodeClickedHandler = onNodeClicked

    // Bind to all node clicked events
    NodeClickedObserved.onUpdate({ cb: this._onNodeClickedInternal.bind(this) })

    this._initWindowListeners()

    return this
  }

  /**
   * _initWindowListeners
   *
   * @private
   * @returns {NodeInteractionManager}
   */

  private _initWindowListeners(): NodeInteractionManager {

    // Use pointer up / down to trigger state change
    window.addEventListener('pointerdown', (_event: MouseEvent): void => { selectState = true })
    window.addEventListener('pointerup', (_event: MouseEvent): void => { selectState = false })

    // Track mouse position for desktop raycasting
    window.addEventListener('pointermove', (event: PointerEvent): void => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      mouseTracked = true
    })

    // Handle touch events
    window.addEventListener('touchstart', (_event: TouchEvent): void => {
      selectState = true
    })

    window.addEventListener('touchend', (): void => { selectState = false })

    // Setup click event handler
    document.addEventListener('click', this._onClick.bind(this))
    document.addEventListener('dblclick', this._onDblClick.bind(this))
    window.addEventListener('wheel', this._onMouseWheel.bind(this), false)

    return this
  }

  /**
   * _onClick
   */

  private _onClick(event: MouseEvent): void {
    // Allow clicks on the A-Frame canvas regardless of interaction mode,
    // avoiding the race condition where pointerlockchange flips mode to
    // 'hud' between mousedown and click.
    const target = event.target as HTMLElement
    if (!target) { return }
    const isCanvas = target.tagName === 'CANVAS' && target.closest('a-scene') !== null
    if (!isCanvas) { return }

    if (!this._currentNode) { return }

    const nodeEvent = event as NodePointerEventMessage
    nodeEvent.node = this._currentNode
    this._currentNode.onClick(nodeEvent)
  }

  /**
   * _onDblClick
   */

  private _onDblClick(event: MouseEvent): void {
    if (!this._currentNode) { return }
    this._currentNode.onDblClick(event)
  }

  /**
   * _onMouseWheel
   */

  private _onMouseWheel(_e: WheelEvent): void {
    // Reserved for future zoom/scroll interactions
  }

  /**
   * _onNodeClickedInternal
   *
   * @description Internal handler for node clicked observer
   */

  private _onNodeClickedInternal(event: NodePointerEventMessage): void {
    if (this._onNodeClickedHandler) {
      this._onNodeClickedHandler(event)
    }
  }

  /**
   * onNodeHover
   */

  onNodeHover(node: Node): void {
    this._currentNode = node.onHover()
  }

  /**
   * onNodeOut
   */

  onNodeOut(node: Node): void {
    node.onOut()
    this._currentNode = undefined
  }

  /**
   * onCursorIntersecting
   */

  private _onCursorIntersecting(): void { this._isIntersecting = true }

  /**
   * onCursorOut
   */

  private _onCursorOut(): void { this._isIntersecting = false }

  /**
   * activateCursor
   */

  activateCursor(): void { this._cursor.activate() }

  /**
   * deactivateCursor
   */

  deactivateCursor(): void { this._cursor.deactivate() }

  /**
   * deactivateAllNodes
   */

  deactivateAllNodes(getFocusedNode: () => Node | undefined): void {
    const focusedNode: Node | undefined = getFocusedNode()

    if (focusedNode) {
      focusedNode.onBlurred()
    }

    this._activeNodes.clear()
  }

  /**
   * _raycast
   *
   * @returns {Intersection | undefined}
   */

  private _raycast(): Intersection | undefined {
    const objects: Object3Ds = EntitiesOnStageObserved.objs
    let closestIntersection: Intersection | undefined

    objects.forEach((obj: any): void => {
      if (obj.userData['type'] && obj.userData['type'] === 'graphEntity') { return }

      // Defensive: skip objects removed from scene graph mid-frame
      if (!obj.parent) { return }

      try {
        const intersection: Intersection[] = raycaster.intersectObject(obj, true)

        if (!intersection[0]) { return }

        if (!closestIntersection || intersection[0].distance < closestIntersection.distance) {
          intersection[0].object = obj
          closestIntersection = intersection[0]
        }
      } catch (_e) {
        // Object may have been removed mid-frame; skip safely
      }
    })

    return closestIntersection
  }

  /**
   * update
   *
   * @description Called every frame to handle raycasting and intersection state
   */

  update(): void {
    if (InteractionModeManager.mode !== 'scene-focus') { return }

    const objects: Object3Ds = EntitiesOnStageObserved.objs

    if (!objects || !objects.size) { return }

    const isPointerLocked = !!document.pointerLockElement

    let intersect: any

    if (isPointerLocked) {
      // Under pointer lock, the camera follows the mouse via look-controls.
      // Raycast from screen center for VR control buttons only.
      // ForceGraphVR's A-Frame raycaster handles node hover/click.
      const camera = this._getCamera()
      raycaster.setFromCamera(new Vector2(0, 0), camera)
      raycaster.camera = camera
      intersect = this._raycast()

      // Only handle UI elements (VR control buttons), not nodes
      if (intersect && intersect.object.isUI) {
        intersect.object.setState(selectState ? 'selected' : 'hovered')
      } else {
        intersect = undefined // Don't process node intersections
      }
    } else {
      // No pointer lock — use real mouse position
      if (!mouseTracked) { return }

      const camera = this._getCamera()
      raycaster.setFromCamera(mouse, camera)
      raycaster.camera = camera
      intersect = this._raycast()

      if (intersect) {
        this._onCursorIntersecting()

        if (intersect.object.isUI) {
          intersect.object.setState(selectState ? 'selected' : 'hovered')
        } else if (intersect.object.name) {
          const entity = EntitiesOnStageObserved.entitiesOnStage.get(intersect.object.name)

          if (entity) {
            const node = entity as Node

            if (this._currentNode && this._currentNode !== node) {
              this._currentNode.onOut()
            }

            if (this._currentNode !== node) {
              this._currentNode = node
              node.onHover()
            }
          }
        }
      } else {
        this._onCursorOut()

        if (this._currentNode) {
          this._currentNode.onOut()
          this._currentNode = undefined
        }
      }
    }

    // loop through all other clickables and set inactive state
    VRControlsOnStageObserved.objsOnStage.forEach((obj: any): void => {
      if ((!intersect || obj !== intersect.object)) {
        obj.setState('idle')
      }
    })
  }
}
