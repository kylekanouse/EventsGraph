import Observer from "../Observer"
import { ActiveNodeMessage } from "../../types/ActiveNodeMessage"
import { ActiveNodes } from "../../types/ActiveNodes"
import { ActiveNodesMessage } from "../../types/ActiveNodesMessage"
import ICallback from "../../domain/ICallback"
import ObserverController from "../ObserverController"
import Node from "../Node"

/**
 * CONST
 */

const ID                         : string = 'ActiveNodesObserved',
      CHANNELID                  : string = __OBSERVER_NODES_ACTIVE_CHANNEL_ID__ ,
      NODE_ACTIVE_CHANNEL_ID     : string = __OBSERVER_NODE_ACTIVE_CHANNEL_ID__

/**
 * ActiveNodesObserved
 *
 * @class
 * @abstract
 */

export default abstract class ActiveNodesObserved {

  private static _observer: Observer<ActiveNodes>           = ObserverController.addObserved<ActiveNodes>( new Observer<ActiveNodes>(ID, new Map() as ActiveNodes) )

  private static _callbacks: Set<ICallback>                 = new Set()

  private static _isInitialized: boolean                    = false

  /**
   * _add
   *
   * @static
   * @param {ActiveNodes} activeNodes
   * @param {ActiveNodeMessage} message
   * @returns {ActiveNodesObserved}
   */

  private static _add(activeNodes: ActiveNodes, message: ActiveNodeMessage): ActiveNodes {

    const node: Node = message.node

    if (node && !activeNodes.get( node.id.toString()) ) {
      activeNodes.set( node.id.toString(), node )
    }

    return activeNodes
  }

  /**
   * _delete
   *
   * @static
   * @param {ActiveNodes} activeNodes
   * @param {ActiveNodeMessage} mesage
   * @returns {ActiveNodesObserved}
   */

  private static _delete(activeNodes: ActiveNodes, message: ActiveNodeMessage): void {

    const node: Node = message.node

    if (node) {
      activeNodes.delete( node.id.toString() )
    }

    return activeNodes
  }

  /**
   * _processActiveNodeMessage
   *
   * @param {ActiveNodeMessage} message
   */

  private static _processActiveNodeMutation(prevState: ActiveNodes, message: ActiveNodeMessage): void {
    
    console.log('_processActiveNodeMutation | ActiveNodesObserved._observer.props = ', ActiveNodesObserved._observer.props);
    // Produce an activeNodes map product for others to consume
    return ActiveNodesObserved._produceActiveNodesMessage((message.isActive) 
                                                            ? ActiveNodesObserved._add(prevState, message)
                                                            : ActiveNodesObserved._delete(prevState, message)
                                                          )
  }

  /**
   * _processActiveNodesMessage
   *
   * @param {ActiveNodesMessage} message
   * @private
   * @static
   */

  private static _processActiveNodesMessage(message: ActiveNodesMessage): void {

    // loop through callbacks
    ActiveNodesObserved._callbacks.forEach((cb: ICallback) => {
      cb(message.activeNodes)
    })
  }

  /**
   * _produceActiveNodesMessage
   *
   * @private
   * @static
   */

  private static _produceActiveNodesMessage(activeNodes: ActiveNodes): ActiveNodes {

    ActiveNodesObserved._observer.send<ActiveNodesMessage>(CHANNELID, {activeNodes: activeNodes} as ActiveNodesMessage)

    return activeNodes
  }

  /**
   * ########################################################## GETTER / SETTER
   */

  /**
   * activeNodes
   */

  static get activeNodes(): ActiveNodes { return ActiveNodesObserved._observer.props }

  /**
   * ########################################################## PUBLIC
   */

  /**
   * clear
   *
   * @static
   */

  public static clear(): void { ActiveNodesObserved._observer.props.clear() }

  /**
   * init
   *
   * @static
   * @description Setup subscribtions and mutations to observer channel events
   */

  public static init(): void {

    if (ActiveNodesObserved._isInitialized) { return }

    ActiveNodesObserved
      ._observer
      .subscribe<ActiveNodesMessage>(
        CHANNELID,
        ActiveNodesObserved._processActiveNodesMessage
      )
      // Setup update subscription
      .mutate<ActiveNodeMessage>(
        NODE_ACTIVE_CHANNEL_ID,
        ActiveNodesObserved._processActiveNodeMutation
      )

    ActiveNodesObserved._isInitialized = true
  }

  /**
   * onUpdate
   *
   * @static
   * @param {ICallback} cb
   */

  public static onUpdate(cb: ICallback): void { ActiveNodesObserved._callbacks.add(cb) }

  /**
   * removeOnUpdate
   *
   * @static
   * @param {ICallback} cb
   */

  public static removeOnUpdate(cb: ICallback): void { ActiveNodesObserved._callbacks.delete(cb) }
}