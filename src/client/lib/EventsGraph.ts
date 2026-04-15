  /// <reference path='../types/index.d.ts' />
import { AudioListener, PlaneGeometry, MeshLambertMaterial, Mesh, DoubleSide, AudioLoader, Audio, Raycaster, Scene, Camera, Vector2, WebGLRenderer, Intersection, Group } from 'three'
import { constants } from "../../server/constants"
import IGraphData from "../../server/domain/IGraphData"
import { createLink } from "../../server/lib/Utils"
import Loader from './Loader'
import IEventData from "../../server/domain/IEventData"
import GraphEvent from "./GraphEvent"
import Link from "./Link"
import Node from './Node'
import Graph from './Graph'
import { GraphEventData } from "../types/GraphEventData"
import { getCamera, getCameraGroup, getScene } from "./Utils"
import ThreeMeshUI from 'three-mesh-ui'
import VRControlsUI from './VRControlsUI'
import TWEEN, { Tween } from '../lib/tween/tween'
import ObserverController from './ObserverController'
import { NodePointerEventMessage } from '../types/NodePointerEventMessage'
import EGNodeFocusedObserved from './observers/EGNodeFocusedObserved'
import EventsGraphStaticObservers from './EventsGraphStaticObservers'
import CommandsObserved from './observers/CommandsObserved'
import IEventsGraphControls from '../domain/IEventsGraphControls'
import { CommandMessage } from '../types/CommandMessage'
import CommandNext from './commands/CommandNext'
import CommandPrev from './commands/CommandPrev'
import KeysController from './KeysController'
import EntitiesOnStageObserved from './observers/EntitiesOnStageObserved'
import NodeClickedObserved from './observers/NodeClickedObserved'
import Cursor from './Cursor'
import Entity from './Entity'
import VRControlsOnStageObserved from './observers/VRControlsOnStageObserved'
import Stats from 'stats.js'
import { Object3Ds } from '../types/Object3Ds'
// import 'aframe-mouse-cursor-component'

/**
 * CONST
 */

const fontURL                       : string                        = __MAIN_FONT_URL__,
      initLoadSoundUrl              : string                        = __INIT_SOUND_LOAD_URL__,
      initLoadSoundVol              : number                        = 0.2,
      raycaster                     : Raycaster                     = new Raycaster(),
      defaultStatsPanelID           : 0 | 1 | 2                     = 0 // 0: fps, 1: ms, 2: mb, 3+: custom

/**
 * VARS
 */
let lastNodeID                      : string | number | undefined,
    selectState                     : boolean                       = false,
    mouse                           : Vector2                       = new Vector2()

/**
 * EventsGraph
 *
 * @description Main class for handling EventsGraph client service
 * @class
 */

export default class EventsGraph implements IEventsGraphControls<EventsGraph> {

  private _id                         : string

  private _activeNodes                : Set<Node>                     = new Set()

  private _cursor                     : Cursor                        = new Cursor()

  private _isIntersecting             : boolean                       = false

  private _listener                   : AudioListener                 = new AudioListener()

  private _graph                      : Graph

  private _loader                     : Loader | undefined

  private _loadingText                : string

  private _loadingSound               : Audio

  private _plane                      : Mesh | undefined

  private _renderer                   : WebGLRenderer | undefined

  private _vrControlsUI               : VRControlsUI

  private _commandsOB                 : CommandsObserved

  private _currentNode                : Node | undefined

  private _stats                      : Stats | undefined

  /**
   * constructor
   *
   * @param {string} id
   * @param {HTMLElement} ele 
   * @param monitorEle 
   * @param loadingText 
   */

  constructor(id: string, ele: HTMLElement, loadingText = "Loading") {

    this._id                  = id

    // Setup loading text
    this._loadingText         = loadingText
    this._loadingSound        = new Audio(this._listener)
                                      .setLoop(false)
                                      .setVolume(initLoadSoundVol)
    this._loader              = new Loader( this._loadingText )

    // Create instance of Force Graph
    this._graph               = new Graph( ele )

    // create instance of VR controls
    this._vrControlsUI        = new VRControlsUI()

    // Setup Observed
    this._commandsOB          = ObserverController.addObserved<CommandMessage>( new CommandsObserved(this.id) ) as CommandsObserved

    // Setup Stats
    this._stats               = (__ENABLE_STATS__ === true) ? new Stats() : undefined

    // init instance
    this._init()
  }

  /**
   * ########################################################## GETTER / SETTER
   */

  get id(): string { return this._id }

  /**
   * get scene
   * 
   * @returns {Scene}
   */

  get scene(): Scene { return getScene() }

  /**
   * camera
   *
   * @description Camera 
   * @returns {Camera}
   */

  get camera(): Camera { return getCamera() }

    /**
   * camera
   *
   * @description Group object containing the camera along with parent group holding other objects to be moved relative to the camera
   * @returns {Group}
   */

  get cameraGroup(): Group { return getCameraGroup() }

  /**
   * ########################################################## Private
   */

  /**
   * _deactivatecontrols
   *
   * @returns {EventsGraph}
   */

  private _deactivatecontrols(): EventsGraph {
    this._vrControlsUI.deactivate()
    return this
  }

  /**
   * _deactivateAllNodes
   *
   * @returns {EventsGraph}
   */

  private _deactivateAllNodes(): EventsGraph {

    console.log('EventsGraph | _deactivateAllNodes( ): ', )
    const focusededNode: Node | undefined = this.getFocusedNode()

    if (focusededNode) {
      focusededNode.onBlurred()
    }

    this._activeNodes.clear()

    // this._activeNodes.forEach((node: Node): void => {
    //   node.destroy()
    // })

    return this
  }

  /**
   * _init
   * 
   * @description initializes Event Graph with default properties
   * @private
   */

  private _init(): EventsGraph {

    // set default stats panel
    if (this._stats) {
      this._stats.showPanel( defaultStatsPanelID ) 
      document.body.appendChild( this._stats.dom )
    }

    // Initialize static observers
    EventsGraphStaticObservers.init(this)

    // Setup render function callback
    requestAnimationFrame((time: number): void => {
      this._render(time)
    })

    return this._initObservedCallbacks()
               ._initWindowListeners()
               ._initGraph()
               ._initScene()
               ._initCommands()
  }

  /**
   * _initObservedCallbacks
   *
   * @returns {EventsGraph}
   */

  private _initObservedCallbacks(): EventsGraph {

    // Bind to all node clicked events
    NodeClickedObserved.onUpdate({cb: this._onNodeClicked.bind(this)})

    return this
  }

  /**
   * _initGraph
   * 
   * @private
   * @returns {EventsGraph}
   */

  private _initGraph(): EventsGraph {

    this._graph
        .onNodeHover( this._onNodeHover.bind(this) )
        .onNodeOut( this._onNodeOut.bind(this) )

    return this
  }

  /**
   * _initCommands
   *
   * @returns {EventsGraph}
   */

  private _initCommands(): EventsGraph {

    this._commandsOB.addCommand( new CommandNext(this) )
    this._commandsOB.addCommand( new CommandPrev(this) )

    KeysController.init()

    return this
  }

  /**
   * _initScene
   * 
   * @private
   * @returns {EventsGraph}
   */

  private _initScene(): EventsGraph {

    const planeGeometry       = new PlaneGeometry(2000, 2000, 1, 1)
    const planeMaterial       = new MeshLambertMaterial({ color: constants.MAIN_PLANE_COLOR, side: DoubleSide })
    this._plane               = new Mesh(planeGeometry, planeMaterial)

    // Set position
    this._plane.position.set(-100, -800, -100)
    this._plane.rotation.set(0.5 * Math.PI, 0, 0)

    // // Add plane to scene
    this.scene.add( this._plane )

    // Use onBeforeRender to get access to Three.js elements that 3D force Graph does not expose
    this.scene.onBeforeRender = (
                                  renderer: WebGLRenderer,
                                  scene: THREE.Scene,
                                  camera: Camera,
                                  renderTarget: any
                                ): void => {
                                  this._rendered(renderer, scene, camera, renderTarget)
                                }

    return this
  }

  /**
   * _initWindowListeners
   *
   * @private
   * @returns {EventsGraph}
   */

  private _initWindowListeners(): EventsGraph {

    // Add pointermove event to map mouse movement
    // window.addEventListener( 'pointermove', ( event: MouseEvent ) => {
    //   // mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
    //   // mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
    // })

    // Use pointer up / down to trigger state change
    window.addEventListener( 'pointerdown', (event: MouseEvent): void => { selectState = true })
    window.addEventListener( 'pointerup', (event: MouseEvent): void => { selectState = false })

    // Handle touch events
    window.addEventListener( 'touchstart', ( event: TouchEvent ): void => {
      selectState = true
      // mouse.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1
      // mouse.y = - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1
    })

    window.addEventListener( 'touchend', (): void => { selectState = false })

    // Setup click event handler
    document.addEventListener( 'click', this._onClick.bind(this))

    document.addEventListener( 'dblclick', this._onDblClick.bind(this))

    window.addEventListener( 'wheel', this._onMouseWheel.bind(this), false)

    // document.querySelector('a-scene').addEventListener('enter-vr', (): void => {
    //   console.log("SCENE ENTERED VR");
    // })

    // document.querySelector('a-scene').addEventListener('exit-vr', (): void => {
    //   console.log("SCENE EXIT VR");
    // })

    return this
  }

  /**
   * _onPointerClick
   *
   * @param event 
   */

  private _onClick( event: MouseEvent ): void {

    // Make sure only hijacking certain clicks and not while interecting UI controls
    if (!this._currentNode || this._isIntersecting) { return }

    // Cast as Node Pointer Event type
    const nodeEvent = event as NodePointerEventMessage

    // Associate the current node with the event
    nodeEvent.node = this._currentNode

    this._currentNode.onClick(nodeEvent)
  }

  /**
   * _onDblClick
   *
   * @param {MouseEvent} event
   */

  private _onDblClick(event: MouseEvent): void {

    if (!this._currentNode || this._isIntersecting) { return }

    // Call double click on current node
    this._currentNode.onDblClick(event)
  }

  /**
   * _onCursorIntersecting
   *
   * @returns 
   */

  private _onCursorIntersecting(): EventsGraph { this._isIntersecting = true; return this }

  /**
   * _onCursorOut
   *
   * @returns 
   */

  private _onCursorOut(): EventsGraph { this._isIntersecting = false; return this }

  /**
   * _onMouseWheel
   *
   * @param {WheelEvent} e
   */

  private _onMouseWheel(e: WheelEvent) {

    // if (e.deltaY > 0) {
    //   window.dispatchEvent(new KeyboardEvent('keydown', {'code': 'KeyX', 'key': 'z'}))
    // } else {
    //   window.dispatchEvent(new KeyboardEvent('keydown', {'code': 'KeyZ', 'key': 'x'}))
    // }
  }

  /**
   * _onNodeClicked
   *
   * @description method to handle a node being clicked from an eventsgraph scope
   * @param {NodePointerEventMessage} event
   * @returns {EventsGraph}
   */

  private _onNodeClicked(event: NodePointerEventMessage): EventsGraph {

    const node = event.node

    if (node) {
      this.focusEntity(node)
    }

    return this
  }

  /**
   * _onNodeHover
   *
   * @param node 
   */

  private _onNodeHover(node: Node): EventsGraph {

    // console.log('EventsGraph | _onNodeHover | : node = ', node, ' | this._isIntersecting = ', this._isIntersecting, ' | this._currentNode = ', this._currentNode)
    if (this._isIntersecting && this._currentNode?.id != node.id) { return this }
    this._currentNode = node.onHover()
    return this
  }

  /**
   * _onNodeOut
   *
   * @param node 
   */

  private _onNodeOut(node: Node): EventsGraph { 
    node.onOut()
    this._currentNode = undefined 
    return this
  }

  /**
   * _playInitLoadingSoud
   * 
   * @returns {EventsGraph}
   */

  private _playInitLoadingSoud(): EventsGraph {

    if (this._loadingSound.buffer) {
      this._loadingSound.play()
      return this
    }

    // Load sound url, initialize, and play
    new AudioLoader().load(initLoadSoundUrl, (buffer: AudioBuffer): void => {
      this._loadingSound.setBuffer(buffer)
                        .play()
    }, () => {}, () => {})

    return this
  }

  /**
   * _raycast
   *
   * @todo Create new observer for only non-graph entities on stage and remove check in forEach
   * @returns {Intersection}
   */

  private _raycast(): Intersection | undefined {

    // Get objects on stage to test
    const objects: Object3Ds = EntitiesOnStageObserved.objs

    let closestIntersection: Intersection | undefined

    // Loop through all testable objects to see if ray intersects and grab shortests distanced object
    objects.forEach((obj: any): void => {

      // Dont intercept graph entities
      if (obj.userData['type'] && obj.userData['type'] === 'graphEntity') { return }

      // Use raycater to check if intersects
      const intersection: Intersection[] = raycaster.intersectObject( obj, true )

      // If no intersections than exit out
      if ( !intersection[0] ) { return }

      if ( !closestIntersection || intersection[0].distance < closestIntersection.distance ) {

        intersection[0].object = obj

        closestIntersection = intersection[0]
      }
    })

    return closestIntersection
  }

  /**
   * _render
   * 
   * @description main method called on every frame to handle EventGraph scope animations
   * @param {number} time
   * @private
   */
  
  private _render(time: number): void {

    // Start stats metric if enabled
    if (this._stats) { this._stats.begin() }

    // Update VR Controls
    ThreeMeshUI.update()

    // Update Tweening functionality
    TWEEN.update(time)

    // Update EventsGraph scope
    this._update()

    // Finish up stats metrics if enabled
    if (this._stats) { this._stats.end() }

    // Get render frame function so we can call this function on every frame
    requestAnimationFrame((time: number): void => {
      this._render(time)
    })
  }

  /**
   * _rendered
   *
   * @description used to access three.js elements that 3D force VR does not expose
   * @private
   * @param renderer 
   * @param scene 
   * @param camera 
   * @param renderTarget 
   */

  private _rendered(
                      renderer: WebGLRenderer,
                      scene: THREE.Scene,
                      camera: Camera,
                      renderTarget: any
                    ): void {

    // Grab renderer from three object
    if (!this._renderer) {
      this._renderer = renderer
      this._renderer.xr.enabled = true
    }
  }

  /**
   * _update
   *
   * @returns {EventsGraph}
   */

  private _update(): EventsGraph {

    // Get objects on stage
    const objects: Object3Ds = EntitiesOnStageObserved.objs

    // Do not need to process if there are no objects to test
    if (!objects || !objects.size) { return this }

    let intersect: any

    // Set mouse to camera cursor center
    // let cursor = getCursor()
    mouse.x = 0
    mouse.y = 0

    // Raycast to see what objects are intersecting
    if ( mouse.x !== null && mouse.y !== null ) {

      raycaster.setFromCamera( mouse, this.camera )

      intersect = this._raycast()
    }

    // process intersects
    if ( intersect ) {

      // Set state to intersecting
      this._onCursorIntersecting()

      if ( selectState ) {

        if (intersect.object.isUI) {
          intersect.object.setState( 'selected' )
        } else if (intersect.object.name) {

          // Check if pointer is intersecting an EventsGraph Entity
          const entity = EntitiesOnStageObserved.entitiesOnStage.get(intersect.object.name)

          // Set entity as current node
          if (entity) {
            this._currentNode = entity as Node

            // disable intersecting override to enable entity clickability
            this._onCursorOut()
          }
        }

      } else {

        if (intersect.object.isUI) {
          intersect.object.setState( 'hovered' )
        }

      }
    } else {
      // If not interecting then set property to prevent override of object clickability
      this._onCursorOut()
    }

    // loop through all other clickables and set inactive state
    VRControlsOnStageObserved.objsOnStage.forEach( (obj: any): void => {
      if ((!intersect || obj !== intersect.object) ) {
          obj.setState( 'idle' )
      }
    })

    return this
  }

  /**
   * ########################################################## PUBLIC
   */

  /**
   * activateControls
   *
   * @param {Node} node
   * @returns {EventsGraph}
   */

  activateControls(node: Node): EventsGraph { this._vrControlsUI.activate(node); return this }

  /**
   * activateCursor
   * 
   * @returns {EventsGraph}
   */

  activateCursor(): EventsGraph { this._cursor.activate(); return this }

  /**
   * clear
   *
   * @description clears out existing graph data
   * @returns {EventsGraph}
   */

  clear(): EventsGraph {

    if (!this._graph.size) { return this }

    // Clear observers
    EventsGraphStaticObservers.clear()

    console.log('EventsGraph | clear | this._graph.size = ', this._graph.size)
    this._deactivateAllNodes()
    this._vrControlsUI.deactivate()
    this._graph.clear()

    return this
  }

  /**
   * deactivateCursor
   *
   * @returns {EventsGraph}
   */

  deactivateCursor(): EventsGraph { this._cursor.deactivate(); return this }

  /**
   * focusEntity
   *
   * @param {Entity<any>} entity
   * @returns {EventsGraph}
   */

  focusEntity(entity: Entity<any>): EventsGraph { entity.onFocused(); return this }

  /**
   * getFocusedNode
   *
   * @returns {Node | undefined}
   */

  getFocusedNode(): Node | undefined { return EGNodeFocusedObserved.node }

  /**
   * hideLoader
   *
   * @description removes the loader object from the scene
   * @returns {EventsGraph}
   */

  hideLoader(): EventsGraph {

    if (this._loader) {
      this.scene.remove( this._loader.stop().reset().getObject3D() )
    }

    return this
  }

  /**
   * loadGraphData
   * 
   * @param {IGraphData} data 
   * @returns {EventsGraph}
   */

  loadGraphData(data: IGraphData): EventsGraph {

    if (this._graph.size === 0) {
      // if loading from empty graph play loading sound
      this._playInitLoadingSoud()
    }

    this.hideLoader()

    this._graph.load(data)

    return this
  }

  /**
   * moveCameraToEntity
   *
   * @param {Entity<any>} entity
   * @returns {EventsGraph}
   */

  moveCameraToEntity(entity: Entity<any>): EventsGraph {

    if (!entity.object3D) { return this }

    // Setup new coordinate to move camera to
    const toChords = {x: entity.object3D.position.x, y: entity.object3D.position.y, z: entity.object3D.position.z + 50}

    // Tween camera to new location
    new Tween(this.cameraGroup.position)
          .to(toChords)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start()

    return this
  }

  /**
   * next
   *
   * @returns {EventsGraph}
   */

  next(): EventsGraph { this._commandsOB.sendCommand({commandID: 'next'}); return this }

  /**
   * prev
   *
   * @returns {EventsGraph}
   */

  prev(): EventsGraph { this._commandsOB.sendCommand({commandID: 'prev'}); return this }

  /**
   * sendEvent
   * 
   * Main handler for processing events on the graph
   * 
   * @param {GraphEvent} event
   * @returns {EventsGraph}
   */

  sendEvent(event: GraphEvent): EventsGraph { this._graph.sendEvent( event ); return this }

  /**
   * sendEventFromData
   *
   * @param {IEventData} data
   * @returns {EventsGraph}
   */

  sendEventFromData(data: IEventData): EventsGraph {

    const link: Link | undefined = this._graph.getLinkByNodeIDs(data.source, data.target)

    if (link) {

      // Create events data object
      const EventData = data as GraphEventData

      // Add link to events data object
      EventData.link = link

      // Send event
      this.sendEvent( new GraphEvent(EventData, this._listener) )
    }

    return this
  }

  /**
   * showLoader
   *
   * @returns {EventsGraph}
   */

  showLoader(progress?: number): EventsGraph {

    this.updateProgressText(progress)

    if (this._loader) {
      this.scene.add( this._loader.start().getObject3D() )
    }

    return this
  }

  /**
   * updateGraphData
   *
   * @param {IGraphData} data 
   * @param {string | number} rootNodeID 
   * @returns {EventsGraph}
   */

  updateGraphData(data: IGraphData, rootNodeID?: string | number): EventsGraph {

    // extract graph data from graph
    const { nodes, links } = this._graph.graphData()

    // Create link to attach new graphdata to current
    if (nodes.length > 0) {
      lastNodeID = (lastNodeID) ? lastNodeID : (rootNodeID) ? rootNodeID : nodes[0].id
      if (lastNodeID) {
        data.links.push( createLink(data.nodes[0].id, lastNodeID.toString(), '', 0) )
        lastNodeID = data.nodes[0].id
      }
    }

    // Merge data and load graph
    return this.loadGraphData({
      nodes: [...nodes, ...data.nodes],
      links: [...links, ...data.links]
    })
  }

  /**
   * updateProgressText
   *
   * @param progress 
   */

  updateProgressText(progress?: number): EventsGraph {

    if (this._loader) {
      this._loader.updateProgress(progress)
    }

    return this
  }
}