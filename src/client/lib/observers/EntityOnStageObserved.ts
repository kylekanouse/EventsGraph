import Observer from "../Observer"
import { EntityOnStageMessage } from "../../types/EntityOnStageMessage"
import { EntityRemovedFromStageMessage } from "../../types/EntityRemovedFromStageMessage"
import ObserverController from "../ObserverController"
import IEntityConditionalCallback from "../../domain/IEntityConditionalCallback"
import EntityOnStageConditional from '../conditionals/EntityOnStageConditional'

/**
 * CONST
 */

const ID                         : string = 'EntityOnStageObserved',
      CHANNELID                  : string = __OBSERVER_ENTITY_ON_STAGE_CHANNEL_ID__,
      CONDITIONAL                : EntityOnStageConditional = new EntityOnStageConditional()

/**
 * EntityOnStageObserved
 *
 * @class
 * @abstract
 */

export default abstract class EntityOnStageObserved {

  private static _observer          : Observer<EntityOnStageMessage>        = ObserverController.addObserved<EntityOnStageMessage>( new Observer<EntityOnStageMessage>(ID) )

  private static _callbacks         : Set<IEntityConditionalCallback>       = new Set()

  private static _isInitialized     : boolean                               = false

  /**
   * _updateCallbacks
   *
   * @param {EntityPointerEventMessage} event
   * @static
   */

  private static _updateCallbacks(message: EntityOnStageMessage): void {

    // Loop through all callbacks
    EntityOnStageObserved._callbacks.forEach((cb: IEntityConditionalCallback): void => {

      const conditions    = cb.conditions,
            callback      = cb.cb

      // Check to make sure any conditions are met before calling callback
      if (!conditions || CONDITIONAL.isConditional(message, conditions)) {
        callback(message)
      }
    })
  }
  

  /**
   * ########################################################## PUBLIC
   */

  /**
   * init
   *
   * @static
   * @description Setup subscribtions and mutations to observer channel events
   * @returns {CommandsObserved}
   */

  public static init(): void {

    if (EntityOnStageObserved._isInitialized) { return }

    EntityOnStageObserved
      ._observer
      .subscribe<EntityOnStageMessage>(
        CHANNELID,
        (message: EntityOnStageMessage): void => {
          EntityOnStageObserved._updateCallbacks( message )
        }
      )

      EntityOnStageObserved._isInitialized = true
  }

  /**
   * send
   *
   * @static
   * @param {EntityRemovedFromStageMessage} message
   */

  public static send(message: EntityRemovedFromStageMessage): void {
    EntityOnStageObserved._observer.send<EntityOnStageMessage>(CHANNELID, message )
  }

  /**
   * onUpdate
   *
   * @static
   * @param {IEntityConditionalCallback} cb
   * @returns {ActiveNodesObserved}
   */

  public static onUpdate(cb: IEntityConditionalCallback): void {

    // Add callback to set
    EntityOnStageObserved._callbacks.add(cb)
  }
}