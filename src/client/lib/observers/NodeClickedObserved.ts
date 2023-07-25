import Observer from "../Observer"
import Node from '../Node'
import { NodePointerEventMessage } from "../../types/NodePointerEventMessage"
import { EntityPointerEventMessage } from "../../types/EntityPointerEventMessage"
import ObserverController from "../ObserverController"
import INodeConditionalCallback from "../../domain/INodeConditionalCallback"
import NodeClickedConditional from "../conditionals/NodeClickedConditional"

/**
 * CONST
 */

const ID                    : string                      = 'NodeCLickedObserved',
      CHANNELID             : string                      = __OBSERVER_NODE_CLICKED_CHANNEL_ID__,
      ENTITY_CHANNELID      : string                      = __OBSERVER_ENTITY_CLICKED_CHANNEL_ID__,
      CONDITIONAL           : NodeClickedConditional      = new NodeClickedConditional()

/**
 * NodeClickedObserved
 *
 * @class
 * @abstract
 */

export default abstract class NodeClickedObserved {

  private static _observer        : Observer<NodePointerEventMessage>       = ObserverController.addObserved<NodePointerEventMessage>( new Observer<NodePointerEventMessage>(ID, {} as NodePointerEventMessage) )

  private static _callbacks       : Set<INodeConditionalCallback>           = new Set()

  private static _isInitialized   : boolean                                 = false

  /**
   * _produceNodeEvent
   *
   * @static
   * @param event 
   */

  private static _produceNodeMessage(message: EntityPointerEventMessage): void {

    // Check if entity is a Node entity
    if (message.entity.entityTypeID === Node.TYPE_ID) {

      // Cast message as a Node message
      const nodeEventMessage: NodePointerEventMessage = <NodePointerEventMessage> event

      // Associate type cast object to event
      nodeEventMessage.node = <Node> message.entity

      // Produce Node pointer event message for consumers
      NodeClickedObserved._observer.send<NodePointerEventMessage>(CHANNELID, nodeEventMessage)
    }
  }

  /**
   * _updateCallbacks
   *
   * @param {EntityPointerEventMessage} event
   * @static
   */

  private static _updateCallbacks(message: NodePointerEventMessage): void {

    // Loop through all callbacks
    NodeClickedObserved._callbacks.forEach((cb: INodeConditionalCallback): void => {

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

    if (NodeClickedObserved._isInitialized) { return }

    NodeClickedObserved
      ._observer
      // Subscribe to Entity clicked channel to consume
      .subscribe<EntityPointerEventMessage>(
        ENTITY_CHANNELID,
        NodeClickedObserved._produceNodeMessage
      )
      // Subscribe to all nodes being clicked
      .subscribe<NodePointerEventMessage>(
        CHANNELID,
        NodeClickedObserved._updateCallbacks
      )

      NodeClickedObserved._isInitialized = true
  }

  /**
   * onUpdate
   *
   * @param {INodeConditionalCallback} cb
   * @static
   */

  public static onUpdate(cb: INodeConditionalCallback): void { NodeClickedObserved._callbacks.add(cb) }
}