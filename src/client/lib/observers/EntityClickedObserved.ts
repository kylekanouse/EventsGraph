import Observer from "../Observer"
import IEntityConditionalCallback from "../../domain/IEntityConditionalCallback"
import EntityClickedConditional from "../conditionals/EntityClickedConditional"
import ObserverController from "../ObserverController"
import { EntityPointerEventMessage } from "../../types/EntityPointerEventMessage"

/**
 * CONST
 */

const ID              : string = 'EntityClickedObserved',
      CHANNELID       : string = __OBSERVER_ENTITY_CLICKED_CHANNEL_ID__,
      CONDITIONAL     : EntityClickedConditional = new EntityClickedConditional()

/**
 * EntityClickedObserved
 *
 * @description Main singelton object to handle observing entities
 * @abstract
 * @class
 */

export default abstract class EntityClickedObserved {

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

  private static _updateCallbacks(message: EntityPointerEventMessage): void {

    // Loop through all callbacks
    EntityClickedObserved._callbacks.forEach((cb: IEntityConditionalCallback): void => {

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
   * @returns {EntityClickedObserved}
   */

  public static init(): void {

    if (EntityClickedObserved._isInitialized) { return }

    EntityClickedObserved
      ._observer
      .subscribe<EntityPointerEventMessage>(
        CHANNELID,
        (message: EntityPointerEventMessage): void => {
          EntityClickedObserved._updateCallbacks(message)
        }
      )
    
    EntityClickedObserved._isInitialized = true
  }

  /**
   * update
   *
   * @description used to send Entity Active message updates
   * @param {EntityPointerEventMessage} message
   * @static
   */

  public static send(message: EntityPointerEventMessage): void {
    EntityClickedObserved
      ._observer
      .send<EntityPointerEventMessage>(CHANNELID, message)
  }

  /**
   * onUpdate
   *
   * @param {IEntityConditionalCallback} cb
   * @returns {EntityClickedObserved}
   * @static
   */

  public static onUpdate(cb: IEntityConditionalCallback): void {
    EntityClickedObserved._callbacks.add(cb)
  }
}