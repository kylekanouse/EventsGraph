import Observer from "../Observer"
import { ActiveNodeMessage } from "../../types/ActiveNodeMessage"
import { EntityActiveMessage } from "../../types/EntityActiveMessage"
import IEntityConditionalCallback from "../../domain/IEntityConditionalCallback"
import EntityIsActiveConditional from '../conditionals/EntityIsActiveConditional'
import ObserverController from "../ObserverController"
import Node from "../Node"
import { EntityConditions } from "../../types/EntityConditions"
import ICallback from "../../domain/ICallback"

/**
 * CONST
 */

 const ID                               : string                                    = 'NodeActiveObserved',
       CHANNELID                        : string                                    = __OBSERVER_NODE_ACTIVE_CHANNEL_ID__,
       ENTITY_ACTIVE_CHANNEL_ID         : string                                    = __OBSERVER_ENTITY_ACTIVE_CHANNEL_ID__,
       CONDITIONAL                      : EntityIsActiveConditional                 = new EntityIsActiveConditional()

/**
 * NodeActiveObserved
 * 
 * @class
 * @extends { Observer<ActiveNodeMessage>}
 */

export default abstract class NodeActiveObserved {

  private static _observer              : Observer<ActiveNodeMessage>               = ObserverController.addObserved<ActiveNodeMessage>( new Observer<ActiveNodeMessage>(ID) )

  private static _callbacks             : Set<IEntityConditionalCallback>           = new Set()

  private static _isInitialized         : boolean                                   = false

  /**
   * _produceNodeActiveMessage
   *
   * @param {ActiveNodeMessage} message
   */

  private static _produceNodeActiveMessage(message: any): void {

    // Convert Entity message to Node message
    message.node                          = message.entity as Node
    const nodeMessage:ActiveNodeMessage   = <ActiveNodeMessage> message

    // Publish on main channel
    NodeActiveObserved._observer.send<ActiveNodeMessage>(CHANNELID, nodeMessage)
  }

  /**
   * _updateCallbacks
   *
   * @param {EntityPointerEventMessage} event
   */

  private static _updateCallbacks(message: ActiveNodeMessage): void {

    // Loop through all callbacks
    NodeActiveObserved._callbacks.forEach((cb: IEntityConditionalCallback): void => {

      const conditions: EntityConditions | undefined    = cb.conditions,
            callback: ICallback                         = cb.cb

      // Check to make sure any conditions are met before calling callback
      if (!conditions || CONDITIONAL.isConditional(message as EntityActiveMessage, conditions)) {
        callback(message)
      }
    })
  }

  /**
   * _init
   *
   * @description Setup subscribtions and mutations to observer channel events
   * @returns {CommandsObserved}
   */

  public static init(): void {

    if (NodeActiveObserved._isInitialized) { return }

    NodeActiveObserved
      ._observer
      .subscribe<ActiveNodeMessage>(
        CHANNELID,
        NodeActiveObserved._updateCallbacks
      )
      .subscribe<EntityActiveMessage>(
        ENTITY_ACTIVE_CHANNEL_ID,
        (message: EntityActiveMessage): void => {

          // Check if Entity is of type Node
          if (message.entity && message.entity.entityTypeID === Node.TYPE_ID) {
            NodeActiveObserved._produceNodeActiveMessage(message)
          }
        }
      )

    NodeActiveObserved._isInitialized = true
  }

  /**
   * onUpdate
   *
   * @param {IEntityConditionalCallback} cb
   * @returns {EntityActiveObserved}
   */

  public static onUpdate(cb: IEntityConditionalCallback): void { NodeActiveObserved._callbacks.add(cb) }
}