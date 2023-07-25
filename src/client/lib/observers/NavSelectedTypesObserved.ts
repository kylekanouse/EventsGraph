  /// <reference path='../../types/index.d.ts' />
import Observer from "../Observer"
import { SetStringsMessage } from "../../types/SetStringsMessage"
import ICallback from "../../domain/ICallback"
import ObserverController from "../ObserverController"
import { UniqueStrings } from "../../types/UniqueStrings"

/**
 * CONST
 */

const ID                         : string = 'NavSelectedTypesObserved',
      CHANNELID                  : string = __OBSERVER_NAV_SELECTED_TYPES_CHANNEL_ID__

/**
 * NavSelectedTypesObserved
 *
 * @class
 * @abstract
 */

export default abstract class NavSelectedTypesObserved {

  private static _observer: Observer<UniqueStrings>           = ObserverController.addObserved<UniqueStrings>( new Observer<UniqueStrings>(ID, new Set() as UniqueStrings) )

  private static _callbacks: Set<ICallback>                   = new Set()

  private static _isInitialized: boolean                      = false

  /**
   * _updateCallbacks
   * 
   * @static
   * @private
   */

  private static _updateCallbacks(message: SetStringsMessage): void {

    // loop through callbacks
    NavSelectedTypesObserved._callbacks.forEach((cb: ICallback): void => {
      cb(message)
    })
  }

  /**
   * ########################################################## PUBLIC
   */

  static get selectedTypes(): UniqueStrings {
    return NavSelectedTypesObserved._observer.props
  }

  /**
   * clear
   * 
   * @static
   */

  public static clear(): void {
    NavSelectedTypesObserved._observer.send<SetStringsMessage>(CHANNELID, {values: new Set()})
  }

  /**
   * init
   *
   * @static
   * @description Setup subscribtions and mutations to observer channel events
   */

   public static init(): void {

    if (NavSelectedTypesObserved._isInitialized) { return }

    NavSelectedTypesObserved
      ._observer
      .mutate<SetStringsMessage>(
        CHANNELID,
        (prevState: UniqueStrings, message: SetStringsMessage): UniqueStrings => {
          return message.values
        }
      )
      .subscribe<SetStringsMessage>(
        CHANNELID,
        NavSelectedTypesObserved._updateCallbacks
      )

    NavSelectedTypesObserved._isInitialized = true
  }

  /**
   * onUpdate
   *
   * @static
   * @param {ICallback} cb
   */

  public static onUpdate(cb: ICallback): void { NavSelectedTypesObserved._callbacks.add(cb) }

  /**
   * removeOnUpdate
   *
   * @static
   * @param {ICallback} cb
   */

  public static removeOnUpdate(cb: ICallback): void { NavSelectedTypesObserved._callbacks.delete(cb) }

  /**
   * send
   *
   * @static
   * @param {SetStringsMessage} message
   */

  public static send(message: SetStringsMessage): void { NavSelectedTypesObserved._observer.send<SetStringsMessage>(CHANNELID, message) }
}