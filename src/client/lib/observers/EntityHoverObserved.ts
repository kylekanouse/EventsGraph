import Observer from "../Observer"
import IEntityConditionalCallback from "../../domain/IEntityConditionalCallback"
import EntityHoverConditional from "../conditionals/EntityHoverConditional"
import ObserverController from "../ObserverController"
import { EntityHoverMessage } from "../../types/EntityHoverMessage"

/**
 * CONST
 */

const ID              : string = 'EntityHoverObserved',
      CHANNELID       : string = __OBSERVER_ENTITY_HOVER_CHANNEL_ID__,
      CONDITIONAL     : EntityHoverConditional = new EntityHoverConditional()

/**
 * EntityHoverObserved
 *
 * @description Main singelton object to handle observing entities
 * @abstract
 * @class
 */

export default abstract class EntityHoverObserved {

  private static _observer       : Observer<EntityHoverMessage>                     = ObserverController.addObserved<EntityHoverMessage>( new Observer<EntityHoverMessage>(ID) )

  private static _callbacks      : Set<IEntityConditionalCallback>                  = new Set()

  private static _isInitialized  : boolean                                          = false

  /**
   * ############################################### PRIVATE
   */

  /**
   * _updateCallbacks
   *
   * @param {EntityPointerEventMessage} event
   * @static
   */

  private static _updateCallbacks(message: EntityHoverMessage): void {

    // Loop through all callbacks
    EntityHoverObserved._callbacks.forEach((cb: IEntityConditionalCallback): void => {

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
   * @returns {EntityHoverObserved}
   */

  public static init(): void {

    if (EntityHoverObserved._isInitialized) { return }

    EntityHoverObserved
      ._observer
      .subscribe<EntityHoverMessage>(
        CHANNELID,
        (message: EntityHoverMessage): void => {
          EntityHoverObserved._updateCallbacks(message)
        }
      )

    EntityHoverObserved._isInitialized = true
  }

  /**
   * update
   *
   * @description used to send Entity Active message updates
   * @param {EntityHoverMessage} message
   * @static
   */

  public static send(message: EntityHoverMessage): void {

    EntityHoverObserved
      ._observer
      .send<EntityHoverMessage>(CHANNELID, message)
  }

  /**
   * onUpdate
   *
   * @param {IEntityConditionalCallback} cb
   * @returns {EntityHoverObserved}
   * @static
   */

  public static onUpdate(cb: IEntityConditionalCallback): void {
    EntityHoverObserved._callbacks.add(cb)
  }
}