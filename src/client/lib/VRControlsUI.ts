import { Color, Object3D } from 'three'
import ThreeMeshUI from 'three-mesh-ui'
import FontJSON from '../assets/fonts/Roboto-msdf.json'
import FontImage from '../assets/fonts/Roboto-msdf.png'
import Node from './Node'
import { getScene } from './Utils'
import VRControlsClickedObserved from './observers/VRControlsClickedObserved'
import ObserverController from './ObserverController'
import { CommandMessage } from '../types/CommandMessage'
import VRControlButton from './VRControlButton'
import EntityOnStageObserved from './observers/EntityOnStageObserved'

const buttonOptions = {
  width: 30,
  height: 11.25,
  justifyContent: 'center',
  alignContent: 'center',
  offset: 0.15,
  margin: 0.1,
  borderRadius: 5
}

const hoveredStateAttributes = {
  state: "hovered",
  attributes: {
  offset: 0.035,
  backgroundColor: new Color( 0xffffff ),
  backgroundOpacity: 1,
    fontColor: new Color( 0x999999 )
  },
}

const idleStateAttributes = {
  state: "idle",
  attributes: {
  offset: 0.035,
  backgroundColor: new Color( 0x222222 ),
  backgroundOpacity: 0.3,
    fontColor: new Color( 0x666666 )
  },
}

const selectedAttributes = {
  offset: 0.02,
  backgroundColor: new Color( 0x222222 ),
  fontColor: new Color( 0x777777 )
}

/**
 * VRControlsUI
 *
 * @description Main object used to handle VR controls UI for Events Graph interfacing
 * @class
 */

export default class VRControlsUI {

  private _container                     : Object3D

  private _btnPrev                       : VRControlButton

  private _btnNext                       : VRControlButton

  private _isActive                      : boolean = false

  private _currentNode                   : Node | undefined

  private _clickedOB                     : VRControlsClickedObserved

  /**
   * constructor
   *
   */

  constructor() {

    this._container           = new ThreeMeshUI.Block({
                                                        justifyContent: 'center',
                                                        alignContent: 'center',
                                                        contentDirection: 'row-reverse',
                                                        fontFamily: FontJSON,
                                                        fontTexture: FontImage,
                                                        fontSize: 5,
                                                        padding: 0.02,
                                                        borderRadius: 5
                                                      })

    this._btnNext             = new VRControlButton( new ThreeMeshUI.Block( buttonOptions ), 'next-btn' )
    this._btnPrev             = new VRControlButton( new ThreeMeshUI.Block( buttonOptions ), 'prev-btn' )

    this._clickedOB           = ObserverController.addObserved<CommandMessage>(
                                    new VRControlsClickedObserved( 'VRControlsUI' )
                                  ) as VRControlsClickedObserved
    this._init()
  }

  /**
   * ########################### PRIVATE
   */

  /**
   * _init
   *
   * @private
   */
  
  private _init() {

    // this._nodeVRControlsContainer.position.set( 0, 0.6, 12 )
    this._container.rotation.x = -0.55

    // Add text to buttons
    this._btnNext.button.add(
      new ThreeMeshUI.Text({ content: "next" })
    )

    this._btnPrev.button.add(
      new ThreeMeshUI.Text({ content: "previous" })
    )

    this._btnNext.button.setupState({
      state: "selected",
      attributes: selectedAttributes,
      onSet: (obj: any): void => {

        this._clickedOB.onClick({commandID: 'next'} as CommandMessage)
      }
    })

    this._btnNext.button.setupState( hoveredStateAttributes )
    this._btnNext.button.setupState( idleStateAttributes )

    //

    this._btnPrev.button.setupState({
      state: "selected",
      attributes: selectedAttributes,
      onSet: (obj: any): void => {
        this._clickedOB.onClick({commandID: 'prev'} as CommandMessage)
      }
    })

    // Setup state on previous button
    this._btnPrev.button.setupState( hoveredStateAttributes )
    this._btnPrev.button.setupState( idleStateAttributes )

    // Add buttons to group object
    if (this._btnNext.object3D && this._btnPrev.object3D) {
      this._container.add( this._btnNext.object3D, this._btnPrev.object3D )
    }
  }

  /**
   * ########################### GETTERS
   */

  /**
   * isActive
   */

  get isActive(): boolean {
    return this._isActive
  }

  /**
   * currentNode
   */
  
  get currentNode(): Node | undefined {
    return this._currentNode
  }

  /**
   * ########################### PUBLIC
   */

  /**
   * activate
   *
   * @returns {VRControlsUI}
   */

  activate(node: Node): VRControlsUI {

    if (!node.object3D) { return this }

    // Assign current node to local reference
    this._currentNode = node

    // Get controls position based on node
    const controlsPos = {
      x: node.object3D.position.x,
      y: node.object3D.position.y - 20,
      z: node.object3D.position.z + 18,
    }
  
    // Set controls position
    this._container.position.set(controlsPos.x, controlsPos.y, controlsPos.z)

    // Show controls if not already being displayed
    if (!this._isActive) {
      getScene().add( this._container )
      this._isActive = true

      if (this._btnPrev) {
        EntityOnStageObserved.send({action: "added" , entity: this._btnPrev})
      }

      if (this._btnNext) {
        EntityOnStageObserved.send({action: "added" , entity: this._btnNext})
      }
    }

    return this
  }

  /**
   * deactivate
   *
   * @returns {VRControlsUI}
   */

  deactivate(): VRControlsUI {

    this._isActive = false

    if (this._btnPrev) {
      EntityOnStageObserved.send({action: "removed" , entity: this._btnPrev})
    }

    if (this._btnNext) {
      EntityOnStageObserved.send({action: "removed" , entity: this._btnNext})
    }

    getScene().remove( this._container )

    return this
  }
}