import Observer from "../Observer"
import IEntityConditionalCallback from "../../domain/IEntityConditionalCallback"
import EntityFocusedConditional from "../conditionals/EntityFocusedConditional"
import ObserverController from "../ObserverController"
import { EntityFocusedMessage } from "../../types/EntityFocusedMessage"

/**
 * CONST
 */

const ID              : string = 'EntityFocusedObserved',
      CHANNELID       : string = __OBSERVER_ENTITY_FOCUSED_CHANNEL_ID__,
      CONDITIONAL     : EntityFocusedConditional = new EntityFocusedConditional()

/**
 * EntityFocusedObserved
 *
 * @description Main singelton object to handle observing entities
 * @abstract
 * @class
 */

export default abstract class EntityFocusedObserved {

  private static _observer       : Observer<{}>                           = ObserverController.addObserved<{}>( new Observer<{}>(ID) )

  private static _callbacks      : Set<IEntityConditionalCallback>        = new Set()

  private static _isInitialized  : boolean                                = false

  /**
   * ############################################### PRIVATE
   */

  /**
   * _updateCallbacks
   *
   * @param {EntityPointerEventMessage} event
   * @static
   */

  private static _updateCallbacks(message: EntityFocusedMessage): void {

    // Loop through all callbacks
    EntityFocusedObserved._callbacks.forEach((cb: IEntityConditionalCallback): void => {

      const conditions    = cb.conditions,
            callback      = cb.cb

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
   * @returns {EntityFocusedObserved}
   */

  public static init(): void {

    if (EntityFocusedObserved._isInitialized) { return }

    EntityFocusedObserved
      ._observer
      .subscribe<EntityFocusedMessage>(
        CHANNELID,
        (message: EntityFocusedMessage): void => {
          EntityFocusedObserved._updateCallbacks(message)
        }
      )

    EntityFocusedObserved._isInitialized = true
  }

  /**
   * update
   *
   * @description used to send Entity Active message updates
   * @param {EntityPointerEventMessage} message
   * @static
   */

  public static send<EntityType>(message: EntityFocusedMessage): void {

    EntityFocusedObserved
      ._observer
      .send<EntityFocusedMessage>(CHANNELID, message)
  }

  /**
   * onUpdate
   *
   * @param {IEntityConditionalCallback} cb
   * @returns {EntityFocusedObserved}
   * @static
   */

  public static onUpdate(cb: IEntityConditionalCallback): void {
    EntityFocusedObserved._callbacks.add(cb)
  }
}