import Observer from "../Observer"
import { GraphLoadedMessage } from "../../types/GraphLoadedMessage"
import ObserverController from "../ObserverController"
import ICallback from "../../domain/ICallback"

/**
 * CONST
 */

const ID              : string = 'GraphLoadedObserved',
      CHANNELID       : string = __OBSERVER_GRAPH_LOADED_CHANNEL_ID__

/**
 * GraphLoadedObserved
 *
 * @description Main singelton object to handle observing graph loading
 * @abstract
 * @class
 */

export default abstract class GraphLoadedObserved {

  private static _observer         : Observer<boolean>               = ObserverController.addObserved<boolean>( new Observer<boolean>(ID, false) )

  private static _callbacks        : Set<ICallback>                  = new Set()

  private static _onLoadCallbacks  : Set<ICallback>                  = new Set()

  private static _isInitialized    : boolean                         = false

  /**
   * ############################################### PRIVATE
   */

  /**
   * _updateCallbacks
   *
   * @param {GraphLoadedMessage} message
   */

  private static _updateCallbacks(message: GraphLoadedMessage): void {

    // Loop through all callbacks
    GraphLoadedObserved._callbacks.forEach((cb: ICallback): void => {
      cb(message)
    })

    if (message.isLoaded === true) {
      GraphLoadedObserved._onLoadCallbacks.forEach((cb: ICallback): void => {
        cb(message)
      })
    }
  }

  /**
   * ############################################### PUBLIC
   */

  /**
   * isLoaded
   *
   * @returns {boolean}
   */

  public static isLoaded(): boolean {
    return GraphLoadedObserved._observer.props
  }

  /**
   * init
   *
   * @description initialize observer subscriptions
   * @static
   */

  public static init(): void {

    if (GraphLoadedObserved._isInitialized) { return }
  
    GraphLoadedObserved
      ._observer
      // Setup update subscription
      .mutate<GraphLoadedMessage>(
        CHANNELID,
        (prevState: boolean, message: GraphLoadedMessage): boolean => {
          return message.isLoaded
        }
      )
      .subscribe<GraphLoadedMessage>(
        CHANNELID,
        (message: GraphLoadedMessage): void => {
          GraphLoadedObserved._updateCallbacks(message)
        }
      )
    GraphLoadedObserved._isInitialized = true
  }

  /**
   * update
   *
   * @description used to send loaded message
   * @param {GraphLoadedMessage} message
   */
 
  public static send(message: GraphLoadedMessage): void {
    GraphLoadedObserved
      ._observer
      .send<GraphLoadedMessage>(CHANNELID, message)
  }

  /**
   * onUpdate
   *
   * @param {ICallback} cb
   */

  public static onUpdate(cb: ICallback): void {
    GraphLoadedObserved._callbacks.add(cb)
  }

  public static onLoaded(cb: ICallback): void {
    GraphLoadedObserved._onLoadCallbacks.add(cb)
  }

  /**
   * removeOnUpdate
   *
   * @param {ICallback} cb
   */

  public static removeOnUpdate(cb: ICallback): void { GraphLoadedObserved._callbacks.delete(cb) }

  public static removeOnLoaded(cb: ICallback): void { GraphLoadedObserved._onLoadCallbacks.delete(cb) }
}