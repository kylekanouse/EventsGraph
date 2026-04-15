import Observer from "../Observer"
import Node from '../Node'
import { constants } from "../../../server/constants"
import ObserverController from "../ObserverController"
import INodeConditionalCallback from "../../domain/INodeConditionalCallback"
import NodeFocusedConditional from "../conditionals/NodeFocusedConditional"
import { NodeFocusedMessage } from "../../types/NodeFocusedMessage"
import { EntityFocusedMessage } from "../../types/EntityFocusedMessage"

/**
 * CONST
 */

const ID                    : string                    = 'NodeFocusedObserved',
      CHANNELID             : string                    = __OBSERVER_NODE_FOCUSED_CHANNEL_ID__,
      ENTITY_CHANNELID      : string                    = __OBSERVER_ENTITY_FOCUSED_CHANNEL_ID__,
      CONDITIONAL           : NodeFocusedConditional    = new NodeFocusedConditional()

/**
 * NodeFocusedObserved
 *
 * @class
 * @abstract
 */

export default abstract class NodeFocusedObserved {

  private static _observer        : Observer<NodeFocusedMessage>            = ObserverController.addObserved<NodeFocusedMessage>( new Observer<NodeFocusedMessage>(ID) )

  private static _callbacks       : Set<INodeConditionalCallback>           = new Set()

  private static _isInitialized   : boolean                                 = false
  

  /**
   * _produceNodeEvent
   *
   * @static
   * @param event 
   */

  private static _produceNodeMessage(message: EntityFocusedMessage): void {

    // Check if entity is a Node entity
    if (message.entity.entityTypeID === Node.TYPE_ID) {

      // Cast message as a Node message
      const nodeEventMessage: NodeFocusedMessage = <NodeFocusedMessage> message

      // Associate type cast object to event
      nodeEventMessage.node = <Node> message.entity

      // Produce Node pointer event message for consumers
      NodeFocusedObserved._observer.send<NodeFocusedMessage>(CHANNELID, nodeEventMessage)
    }
  }

  /**
   * _updateCallbacks
   *
   * @param {NodeFocusedMessage} event
   * @static
   */

  private static _updateCallbacks(message: NodeFocusedMessage): void {

    // Loop through all callbacks
    NodeFocusedObserved._callbacks.forEach((cb: INodeConditionalCallback): void => {

      const conditions    = cb.conditions,
            callback      = cb.cb

      // Check to make sure any conditions are met before calling callback
      if (!conditions || CONDITIONAL.isConditional(message, conditions)) {
        callback(message)
      }
    })
  }

  /**
   * _init
   */

  public static init(): void {
    
    if (NodeFocusedObserved._isInitialized) { return }

    NodeFocusedObserved
      ._observer
      // Subscribe to Entity channel to consume
      .subscribe<EntityFocusedMessage>(
        ENTITY_CHANNELID,
        (message: EntityFocusedMessage): void => {

          // Convert Entity event into a Node event
          NodeFocusedObserved._produceNodeMessage(message)
        }
      )
      // Subscribe to all nodes being clicked
      .subscribe<NodeFocusedMessage>(
        CHANNELID,
        (message: NodeFocusedMessage): void => {
  
          // Update callbacks for Node event
          NodeFocusedObserved._updateCallbacks(message)
        }
      )

    NodeFocusedObserved._isInitialized = true
  }

  /**
   * onUpdate
   *
   * @param {INodeConditionalCallback} cb
   * @static
   */

  public static onUpdate(cb: INodeConditionalCallback): void {
    NodeFocusedObserved._callbacks.add(cb)
  }
}