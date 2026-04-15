import Observer from "../Observer"
import { NodesOnStage } from "../../types/NodesOnStage"
import { NodesOnStageMessage } from "../../types/NodesOnStageMessage"
import { EntityOnStageMessage } from "../../types/EntityOnStageMessage"
import ICallback from "../../domain/ICallback"
import { Object3Ds } from "../../types/Object3Ds"
import ObserverController from "../ObserverController"
import Node from '../Node'

/**
 * CONST
 */
 
const ID                         : string         = 'NodesOnStageObserved',
      CHANNELID                  : string         = __OBSERVER_NODES_ON_STAGE_CHANNEL_ID__,
      ENTITY_CHANNEL_ID          : string         = __OBSERVER_ENTITY_ON_STAGE_CHANNEL_ID__


/**
 * EntitiesOnStageObserved
 *
 * @description main singleton object for observing Entities being added/removed from stage
 * @class
 * @abstract
 */

export default abstract class NodesOnStageObserved {

  private static _observer            : Observer<NodesOnStage>           = ObserverController.addObserved<NodesOnStage>( new Observer<NodesOnStage>(ID, new Map()) )

  private static _objsOnStage         : Object3Ds                   = new Map()

  private static _callbacks           : Set<ICallback>                   = new Set()

  private static _isInitialized       : boolean                          = false

  /**
   * _add
   *
   * @static
   * @param {ActiveNodeMessage} message
   * @returns {EntitiesOnStageObserved}
   */

  private static _add(message: EntityOnStageMessage): void {

    const obj = message.entity as Node
    const id: string = obj.id.toString()

    if (obj && !NodesOnStageObserved._observer.props.get(id)) {
      NodesOnStageObserved._observer.props.set(id, obj)
      if (obj.object3D) {
        NodesOnStageObserved._objsOnStage.set(id, obj.object3D)
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

    const obj = message.entity as Node
    const id = obj.id.toString()
    if (obj) {
      NodesOnStageObserved._observer.props.delete(id)
      NodesOnStageObserved._objsOnStage.delete(id)
    }
  }

  /**
   * _clear
   *
   * @returns {EntitiesOnStageObserved}
   */

  private static _clear(): void {
    NodesOnStageObserved._observer.props.clear()
    NodesOnStageObserved._objsOnStage.clear()
  }

  /**
   * _produceMessage
   *
   * @static
   * @private
   * @returns 
   */

  private static _produceMessage(): void {
    NodesOnStageObserved._observer.send<NodesOnStageMessage>(CHANNELID, {nodes: NodesOnStageObserved._observer.props} as NodesOnStageMessage )
  }

  /**
   * _updateCallbacks
   *
   * @param {NodesOnStageMessage} event
   * @static
   */

   private static _updateCallbacks(message: NodesOnStageMessage): void {

    // Loop through all callbacks
    NodesOnStageObserved._callbacks.forEach((cb: ICallback): void => {
        cb(message)
    })
  }

  /**
   * ########################################################## PUBLIC
   */

  /**
   * nodesOnStage
   * 
   * @description getter for retreiving obseerved nodes
   * @returns {NodesOnStage}
   */

  public static get nodesOnStage(): NodesOnStage { return NodesOnStageObserved._observer.props }

  /**
   * objsOnStage
   * 
   * @description getter for retreiving map of object3d objects associated to entities on stage
   * @returns {Object3Ds}
   */

  public static get objsOnStage(): Object3Ds { return NodesOnStageObserved._objsOnStage }

  /**
   * init
   *
   * @static
   * @description Setup subscribtions and mutations to observer channel events
   * @returns {CommandsObserved}
   */

  public static init(): void {

    if (NodesOnStageObserved._isInitialized) { return }

    NodesOnStageObserved
      ._observer
      .subscribe<NodesOnStageMessage>(
        CHANNELID,
        NodesOnStageObserved._updateCallbacks
      )
      .subscribe<EntityOnStageMessage>(
        ENTITY_CHANNEL_ID,
        (message: EntityOnStageMessage): void => {

          // Only listen for Node entities
          if (message.entity.entityTypeID !== Node.TYPE_ID) { return }

          // keep track of active / inactive states
          switch(message.action) {
            case "added":
              NodesOnStageObserved._add(message)
              break
            case "removed":
              NodesOnStageObserved._delete(message)
              break
            default:
              return
          }

          // Produce an Object3Ds map product for others to consume
          NodesOnStageObserved._produceMessage()
        }
      )

      NodesOnStageObserved._isInitialized = true
  }

  /**
   * clearAll
   *
   * @description clears out all values for current state and publishes
   * @returns 
   */

  public static clear(): void {

    NodesOnStageObserved._clear()
    NodesOnStageObserved._produceMessage()
  }

  /**
   * onUpdate
   *
   * @param {ICallback} cb
   */

  public static onUpdate(cb: ICallback): void { NodesOnStageObserved._callbacks.add(cb) }

  /**
   * removeOnUpdate
   * @param cb 
   */

  public static removeOnUpdate(cb: ICallback): void { NodesOnStageObserved._callbacks.delete(cb) }
}