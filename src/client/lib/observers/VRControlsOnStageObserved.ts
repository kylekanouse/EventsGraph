import Observer from "../Observer"
import { EntityOnStageMessage } from "../../types/EntityOnStageMessage"
import VRControlButton from '../VRControlButton'
import { Object3Ds } from "../../types/Object3Ds"
import ObserverController from "../ObserverController"
import { Entities } from "../../types/Entities"

/**
 * CONST
 */
 
const ID                         : string         = 'VRControlsOnStageObserved',
      ENTITY_CHANNEL_ID          : string         = __OBSERVER_ENTITY_ON_STAGE_CHANNEL_ID__


/**
 * VRControlsOnStageObserved
 *
 * @description main singleton object for observing Entities being added/removed from stage
 * @class
 * @abstract
 */

export default abstract class VRControlsOnStageObserved {

  private static _observer            : Observer<Entities>           = ObserverController.addObserved<Entities>( new Observer<Entities>(ID, new Map()) )

  private static _objsOnStage         : Object3Ds                    = new Map()

  private static _isInitialized       : boolean                      = false

  /**
   * _add
   *
   * @static
   * @param {ActiveNodeMessage} message
   * @returns {EntitiesOnStageObserved}
   */

  private static _add(message: EntityOnStageMessage): void {

    const obj: VRControlButton = message.entity as VRControlButton
    const id: string = obj.id.toString()
  
    if (obj && !VRControlsOnStageObserved._observer.props.get(id)) {
      VRControlsOnStageObserved._observer.props.set(id, obj)
      if (obj.object3D) {
        VRControlsOnStageObserved._objsOnStage.set(id, obj.object3D)
      }
    }

  }

  /**
   * _delete
   *
   * @static
   * @param {EntityOnStageMessage} mesage
   * @returns {EntitiesOnStageObserved}
   */

  private static _delete(message: EntityOnStageMessage): void {

    const obj: VRControlButton = message.entity as VRControlButton
    const id: string = obj.id.toString()
    if (obj) {
      VRControlsOnStageObserved._observer.props.delete(id)
      VRControlsOnStageObserved._objsOnStage.delete(id)
    }
  }

  /**
   * _clear
   *
   * @returns {EntitiesOnStageObserved}
   */

  private static _clear(): void {
    VRControlsOnStageObserved._observer.props.clear()
    VRControlsOnStageObserved._objsOnStage.clear()
  }

  /**
   * ########################################################## PUBLIC
   */

  /**
   * uiEntitiesOnStage
   * 
   * @description getter for retreiving obseerved
   * @returns {Entities}
   */

  public static get uiEntitiesOnStage(): Entities { return VRControlsOnStageObserved._observer.props }

  /**
   * objsOnStage
   * 
   * @description getter for retreiving map of object3d objects associated to entities on stage
   * @returns {Object3Ds}
   */

  public static get objsOnStage(): Object3Ds { return VRControlsOnStageObserved._objsOnStage }

  /**
   * init
   *
   * @static
   * @description Setup subscribtions and mutations to observer channel events
   * @returns {CommandsObserved}
   */

  public static init(): void {

    if (VRControlsOnStageObserved._isInitialized) { return }

    VRControlsOnStageObserved
      ._observer
      .subscribe<EntityOnStageMessage>(
        ENTITY_CHANNEL_ID,
        (message: EntityOnStageMessage): void => {

          // Only listen for VRControls
          if (message.entity.entityTypeID !== VRControlButton.TYPE_ID) { return }

          // keep track of active / inactive states
          switch(message.action) {
            case "added":
              VRControlsOnStageObserved._add(message)
              break
            case "removed":
              VRControlsOnStageObserved._delete(message)
              break
            default:
              return
          }
        }
      )

      VRControlsOnStageObserved._isInitialized = true
  }

  /**
   * clearAll
   *
   * @description clears out all values for current state and publishes
   * @returns 
   */

  public static clear(): void { VRControlsOnStageObserved._clear() }
}