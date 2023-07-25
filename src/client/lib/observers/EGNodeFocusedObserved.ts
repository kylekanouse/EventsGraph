import Observer from '../Observer'
import Node from '../Node'
import EventsGraph from '../EventsGraph'
import { NodeFocusedMessage } from '../../types/NodeFocusedMessage'
import ObserverController from '../ObserverController'

/**
 * CONST
 */

const ID              : string = 'EGNodeFocusedObserved',
      CHANNELID       : string = __OBSERVER_NODE_FOCUSED_CHANNEL_ID__

/**
 * EGNodeFocusedObserver
 *
 * @class
 * @extends {Observed}
 */

export default abstract class EGNodeFocusedObserved {

  private static _observer       : Observer<NodeFocusedMessage>           = ObserverController.addObserved<NodeFocusedMessage>( new Observer<NodeFocusedMessage>(ID) )

  private static _isInitialized  : boolean                                = false

  /**
   * node
   *
   * @description getter wrapper to expose the Node object contained in the last message state
   * @returns {Node | undefined}
   */

  static get node(): Node | undefined { return (EGNodeFocusedObserved._observer.props as NodeFocusedMessage)?.node }

  /**
   * init
   * 
   * @static
   */

  public static init(controller: EventsGraph): void {

    // Make sure only initialized once
    if (EGNodeFocusedObserved._isInitialized) { return }

    EGNodeFocusedObserved
      ._observer
      // Setup subscription to blur the previous node
      .mutate<NodeFocusedMessage>(
        CHANNELID,
        (prevState: NodeFocusedMessage, message: NodeFocusedMessage): NodeFocusedMessage => {

          if (prevState.node && message.isFocused) {
            prevState.node.onBlurred()
          }

          return prevState
        }
      )
      // Setup update subscription
      .mutate<NodeFocusedMessage>(
        CHANNELID,
        (prevState: NodeFocusedMessage, message: NodeFocusedMessage): NodeFocusedMessage => {

          let newState = {}

          if (message.isFocused) {
            newState = {node: message.node}
          }

          return {
            ...prevState,
            ...newState
          }
        }
      )
      // Setup focused action
      .subscribe<NodeFocusedMessage>(
        CHANNELID,
        (message: NodeFocusedMessage): void => {

          // Make sure node and message is to focus
          if (!message.node || !message.isFocused) { return }

          // Get node from message body
          const node = message.node as Node

          controller.activateControls(node)

          // move camera to focus on current node
          controller.moveCameraToEntity(node)
        }
      )
  
    EGNodeFocusedObserved._isInitialized = true
  }
}