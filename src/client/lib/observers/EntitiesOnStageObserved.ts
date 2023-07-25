import Observer from "../Observer"
import { EntitiesOnStage } from "../../types/EntitiesOnStage"
import { EntityOnStageMessage } from "../../types/EntityOnStageMessage"
import { EntitiesOnStageMessage } from '../../types/EntitiesOnStageMessage'
import ICallback from "../../domain/ICallback"
import { Object3Ds } from "../../types/Object3Ds"
import ObserverController from "../ObserverController"

/**
 * CONST
 */
 
const ID                         : string                         = 'EntitiesOnStageObserved',
      CHANNELID                  : string                         = __OBSERVER_ENTITIES_ON_STAGE_CHANNEL_ID__,
      ENTITY_CHANNEL_ID          : string                         = __OBSERVER_ENTITY_ON_STAGE_CHANNEL_ID__


/**
 * EntitiesOnStageObserved
 *
 * @description main singleton object for observing Entities being added/removed from stage
 * @class
 * @abstract
 */

export default abstract class EntitiesOnStageObserved {

  private static _observer          : Observer<EntitiesOnStage>           = ObserverController.addObserved<EntitiesOnStage>( new Observer<EntitiesOnStage>(ID, new Map()) )

  private static _objs              : Object3Ds                           = new Map()

  private static _callbacks         : Set<ICallback>                      = new Set()

  private static _isInitialized     : boolean                             = false

  /**
   * _add
   *
   * @static
   * @param {ActiveNodeMessage} message
   */

  private static _add(message: EntityOnStageMessage): void {

    const obj = message.entity

    const id = obj.id.toString()

    if (obj && !EntitiesOnStageObserved._observer.props.get(id)) {
      EntitiesOnStageObserved._observer.props.set(id, obj)
      if (obj.object3D) {
        EntitiesOnStageObserved._objs.set(id, obj.object3D)
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

    const obj = message.entity
    const id = obj.id.toString()
    if (obj) {
      EntitiesOnStageObserved._observer.props.delete(id)
      EntitiesOnStageObserved._objs.delete(id)
    }
  }

  /**
   * _clearAll
   *
   * @returns {EntitiesOnStageObserved}
   */

  private static _clear(): void {
    EntitiesOnStageObserved._observer.props.clear()
    EntitiesOnStageObserved._objs.clear()
  }

  /**
   * _produceMessage
   *
   * @static
   * @private
   * @returns 
   */

  private static _produceMessage(): void {

    EntitiesOnStageObserved._observer.send<EntitiesOnStageMessage>(CHANNELID, {entities: EntitiesOnStageObserved._observer.props} as EntitiesOnStageMessage )
  }

  /**
   * _updateCallbacks
   *
   * @param {EntityPointerEventMessage} event
   * @static
   */

   private static _updateCallbacks(message: EntitiesOnStageMessage): void {

    // Loop through all callbacks
    EntitiesOnStageObserved._callbacks.forEach((cb: ICallback): void => {
        cb(message)
    })
  }

  /**
   * ########################################################## PUBLIC
   */

  /**
   * entitiesOnStage
   * 
   * @description getter for retreiving obseerved entities
   * @returns {EntitiesOnStage}
   */

  public static get entitiesOnStage(): EntitiesOnStage {
    return EntitiesOnStageObserved._observer.props
  }

  /**
   * objs
   *
   * @description getter for retreiving map of object3d objects associated to entities on stage
   * @returns {Object3Ds}
   */

  public static get objs(): Object3Ds {
    return EntitiesOnStageObserved._objs
  }

  /**
   * init
   *
   * @static
   * @description Setup subscribtions and mutations to observer channel events
   */

  public static init(): void {

    if (EntitiesOnStageObserved._isInitialized) { return }

    EntitiesOnStageObserved
      ._observer
      .subscribe<EntitiesOnStageMessage>(
        CHANNELID,
        (message: EntitiesOnStageMessage): void => {
          EntitiesOnStageObserved._updateCallbacks( message )
        }
      )
      .subscribe<EntityOnStageMessage>(
        ENTITY_CHANNEL_ID,
        (message: EntityOnStageMessage): void => {
          // keep track of active / inactive states
          switch(message.action) {
            case "added":
              EntitiesOnStageObserved._add(message)
              break
            case "removed":
              EntitiesOnStageObserved._delete(message)
              break
            default:
              return
          }

          // Produce an Object3Ds map product for others to consume
          EntitiesOnStageObserved._produceMessage()
        }
      )

    EntitiesOnStageObserved._isInitialized = true
  }

  /**
   * clear
   *
   * @description clears out all values for current state and publishes
   * @returns 
   */

  public static clear(): void {

    EntitiesOnStageObserved._clear()
    EntitiesOnStageObserved._produceMessage()
  }

  /**
   * onUpdate
   *
   * @param {ICallback} cb
   */

  public static onUpdate(cb: ICallback): void {
    EntitiesOnStageObserved._callbacks.add(cb)
  }
}