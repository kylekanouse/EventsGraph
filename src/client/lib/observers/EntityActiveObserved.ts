import Observer from "../Observer"
import IEntityConditionalCallback from "../../domain/IEntityConditionalCallback"
import { EntityActiveMessage } from "../../types/EntityActiveMessage"
import EntityIsActiveConditional from "../conditionals/EntityIsActiveConditional"
import ObserverController from "../ObserverController"

/**
 * CONST
 */

const ID              : string = 'EntityActiveObserved',
      CHANNELID       : string = __OBSERVER_ENTITY_ACTIVE_CHANNEL_ID__,
      CONDITIONAL     : EntityIsActiveConditional = new EntityIsActiveConditional()

/**
 * EntityActiveObserved
 *
 * @description Main singelton object to handle observing entities
 * @abstract
 * @class
 */

export default abstract class EntityActiveObserved {

  private static _observer         : Observer<{}>                           = ObserverController.addObserved<{}>( new Observer<{}>(ID) )

  private static _callbacks        : Set<IEntityConditionalCallback>        = new Set()

  private static _isInitialized    : boolean                                = false

  /**
   * ############################################### PRIVATE
   */

  /**
   * _updateCallbacks
   *
   * @param {EntityPointerEventMessage} event
   */

  private static _updateCallbacks(message: EntityActiveMessage): void {

    // Loop through all callbacks
    EntityActiveObserved._callbacks.forEach((cb: IEntityConditionalCallback): void => {

      const conditions    = cb.conditions,
            callback      = cb.cb,
            entity        = message.entity

      // Check to make sure any conditions are met before calling callback
      if (!conditions || CONDITIONAL.isConditional(message, conditions)) {
        callback(message)
      }
    })
  }

  /**
   * ############################################### PUBLIC
   */

  /**
   * init
   *
   * @description initialize observer subscriptions
   * @static
   */

  public static init(): void {

    if (EntityActiveObserved._isInitialized) { return }
  
    EntityActiveObserved
      ._observer
      .subscribe<EntityActiveMessage>(
        CHANNELID,
        (message: EntityActiveMessage): void => {
          EntityActiveObserved._updateCallbacks(message)
        }
      )

      EntityActiveObserved._isInitialized = true
  }

  /**
   * update
   *
   * @description used to send Entity Active message updates
   * @param {EntityActiveMessage} message
   */

  public static send(message: EntityActiveMessage): void {
    EntityActiveObserved
      ._observer
      .send<EntityActiveMessage>(CHANNELID, message)
  }

  /**
   * onUpdate
   *
   * @param {ICallback} cb
   */

  public static onUpdate(cb: IEntityConditionalCallback): void {
    EntityActiveObserved._callbacks.add(cb)
  }
}