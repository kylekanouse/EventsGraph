/// <reference path='../types/index.d.ts' />
import { Scene, Camera, WebGLRenderer, Group } from 'three'
import IGraphData from "../../server/domain/IGraphData"
import { createLink } from "../../server/lib/Utils"
import IEventData from "../../server/domain/IEventData"
import GraphEvent from "./GraphEvent"
import Link from "./Link"
import Node from './Node'
import Graph from './Graph'
import { GraphEventData } from "../types/GraphEventData"
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
import Entity from './Entity'
import Stats from 'stats.js'

// Sub-managers
import AudioManager from './AudioManager'
import SceneManager from './SceneManager'
import NodeInteractionManager from './NodeInteractionManager'
import StreamProgressManager from './StreamProgressManager'
import FocusManager from './FocusManager'
import InteractionModeManager from './InteractionModeManager'

/**
 * CONST
 */

const initLoadSoundUrl              : string                        = __INIT_SOUND_LOAD_URL__,
      initLoadSoundVol              : number                        = 0.2,
      defaultStatsPanelID           : 0 | 1 | 2                     = 0 // 0: fps, 1: ms, 2: mb, 3+: custom

/**
 * VARS
 */
let lastNodeID                      : string | number | undefined

/**
 * EventsGraph
 *
 * @description Main orchestrator class for the EventsGraph client
 * @class
 */

export default class EventsGraph implements IEventsGraphControls<EventsGraph> {

  private _id                         : string

  private _graph                      : Graph

  private _vrControlsUI               : VRControlsUI

  private _commandsOB                 : CommandsObserved

  private _stats                      : Stats | undefined

  // Sub-managers
  private _audioManager               : AudioManager
  private _sceneManager               : SceneManager
  private _interactionManager         : NodeInteractionManager
  private _progressManager            : StreamProgressManager

  /**
   * constructor
   *
   * @param {string} id
   * @param {HTMLElement} ele
   * @param loadingText
   */

  constructor(id: string, ele: HTMLElement, loadingText = "Loading") {

    this._id                  = id

    // Initialize sub-managers
    this._audioManager        = new AudioManager(initLoadSoundUrl, initLoadSoundVol)
    this._sceneManager        = new SceneManager()
    this._interactionManager  = new NodeInteractionManager(() => this.camera)
    this._progressManager     = new StreamProgressManager(loadingText, () => this.scene)

    // Create instance of Force Graph
    this._graph               = new Graph(ele)

    // Create instance of VR controls
    this._vrControlsUI        = new VRControlsUI()

    // Setup Observed
    this._commandsOB          = ObserverController.addObserved<CommandMessage>(new CommandsObserved(this.id)) as CommandsObserved

    // Setup Stats
    this._stats               = (__ENABLE_STATS__ === true) ? new Stats() : undefined

    // Init instance
    this._init()
  }

  /**
   * ########################################################## GETTER / SETTER
   */

  get id(): string { return this._id }

  get scene(): Scene { return this._sceneManager.scene }

  get camera(): Camera { return this._sceneManager.camera }

  get cameraGroup(): Group { return this._sceneManager.cameraGroup }

  /**
   * ########################################################## Private
   */

  /**
   * _init
   *
   * @description initializes Event Graph with default properties
   * @private
   */

  private _init(): EventsGraph {

    // Install global focus guard for HUD → scene focus recovery
    FocusManager.attachGlobalFocusGuard()
    FocusManager.patchAFrameKeyCapture()

    // Initialize interaction mode manager
    const rootElement = document.querySelector('.events-graph-app') as HTMLElement
    if (rootElement) {
      InteractionModeManager.init(rootElement)
    }

    // Subscribe to mode changes for A-Frame control toggling
    InteractionModeManager.onModeChange((mode) => {
      this._toggleAFrameControls(mode === 'scene-focus')
    })

    // Expose InteractionModeManager on window for console testing (Phase 2)
    ;(window as any).InteractionModeManager = InteractionModeManager

    // set default stats panel
    if (this._stats) {
      this._stats.showPanel(defaultStatsPanelID)
      document.body.appendChild(this._stats.dom)
    }

    // Initialize static observers
    EventsGraphStaticObservers.init(this)

    // Setup render function callback
    requestAnimationFrame((time: number): void => {
      this._render(time)
    })

    // Initialize interaction manager with node-clicked handler
    this._interactionManager.init(this._onNodeClicked.bind(this))

    return this._initGraph()
               ._initScene()
               ._initCursor()
               ._initCommands()
  }

  /**
   * _toggleAFrameControls
   *
   * @description Enables or disables A-Frame look-controls and wasd-controls on the camera entity
   * @param {boolean} enabled
   * @private
   */
  private _toggleAFrameControls(enabled: boolean): void {
    const cameraEl = document.querySelector('[camera]')
    if (!cameraEl) { return }

    cameraEl.setAttribute('look-controls', 'enabled', String(enabled))
    cameraEl.setAttribute('wasd-controls', 'enabled', String(enabled))
  }

  /**
   * _initCursor
   *
   * @description Injects the a-cursor element into the A-Frame camera after the scene is created.
   *              The cursor was commented out in 3d-force-graph-vr; this restores it.
   * @private
   * @returns {EventsGraph}
   */

  private _initCursor(): EventsGraph {
    const camera = document.querySelector('[camera]')
    if (!camera) { return this }

    const cursor = document.createElement('a-cursor')
    cursor.setAttribute('color', 'lavender')
    cursor.setAttribute('opacity', '0.5')
    cursor.setAttribute('raycaster', 'objects: ----none----') // disable cursor raycaster
    camera.appendChild(cursor)

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
        .onNodeHover((node: Node): EventsGraph => {
          this._interactionManager.onNodeHover(node)
          return this
        })
        .onNodeOut((node: Node): EventsGraph => {
          this._interactionManager.onNodeOut(node)
          return this
        })

    return this
  }

  /**
   * _initCommands
   *
   * @returns {EventsGraph}
   */

  private _initCommands(): EventsGraph {

    this._commandsOB.addCommand(new CommandNext(this))
    this._commandsOB.addCommand(new CommandPrev(this))

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

    this._sceneManager.initScene(
      (renderer: WebGLRenderer, _scene: Scene, _camera: Camera, _renderTarget: any): void => {
        this._sceneManager.captureRenderer(renderer)
      }
    )

    return this
  }

  /**
   * _onNodeClicked
   *
   * @description method to handle a node being clicked from an EventsGraph scope
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
   * _render
   *
   * @description main method called on every frame
   * @param {number} time
   * @private
   */

  private _render(time: number): void {

    if (this._stats) { this._stats.begin() }

    // Update VR Controls
    ThreeMeshUI.update()

    // Update Tweening functionality
    TWEEN.update(time)

    // Update interaction manager (raycasting, hover state)
    this._interactionManager.update()

    if (this._stats) { this._stats.end() }

    requestAnimationFrame((time: number): void => {
      this._render(time)
    })
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

  activateCursor(): EventsGraph { this._interactionManager.activateCursor(); return this }

  /**
   * clear
   *
   * @description clears out existing graph data
   * @returns {EventsGraph}
   */

  clear(): EventsGraph {

    if (!this._graph.size) { return this }

    EventsGraphStaticObservers.clear()

    this._interactionManager.deactivateAllNodes(() => this.getFocusedNode())
    this._vrControlsUI.deactivate()
    this._graph.clear()

    return this
  }

  /**
   * deactivateCursor
   *
   * @returns {EventsGraph}
   */

  deactivateCursor(): EventsGraph { this._interactionManager.deactivateCursor(); return this }

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
    this._progressManager.hideLoader()
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
      this._audioManager.playInitLoadingSound()
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

    const toChords = { x: entity.object3D.position.x, y: entity.object3D.position.y, z: entity.object3D.position.z + 50 }

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

  next(): EventsGraph { this._commandsOB.sendCommand({ commandID: 'next' }); return this }

  /**
   * prev
   *
   * @returns {EventsGraph}
   */

  prev(): EventsGraph { this._commandsOB.sendCommand({ commandID: 'prev' }); return this }

  /**
   * sendEvent
   *
   * @param {GraphEvent} event
   * @returns {EventsGraph}
   */

  sendEvent(event: GraphEvent): EventsGraph { this._graph.sendEvent(event); return this }

  /**
   * sendEventFromData
   *
   * @param {IEventData} data
   * @returns {EventsGraph}
   */

  sendEventFromData(data: IEventData): EventsGraph {

    const link: Link | undefined = this._graph.getLinkByNodeIDs(data.source, data.target)

    if (link) {
      const EventData = data as GraphEventData
      EventData.link = link
      this.sendEvent(new GraphEvent(EventData, this._audioManager.listener))
    }

    return this
  }

  /**
   * showLoader
   *
   * @returns {EventsGraph}
   */

  showLoader(progress?: number): EventsGraph {
    this._progressManager.showLoader(progress)
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

    const { nodes, links } = this._graph.graphData()

    if (nodes.length > 0) {
      lastNodeID = (lastNodeID) ? lastNodeID : (rootNodeID) ? rootNodeID : nodes[0].id
      if (lastNodeID) {
        data.links.push(createLink(data.nodes[0].id, lastNodeID.toString(), '', 0))
        lastNodeID = data.nodes[0].id
      }
    }

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
    this._progressManager.updateProgressText(progress)
    return this
  }
}
