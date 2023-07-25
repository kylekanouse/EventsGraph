import Observer from '../Observer'
import EventsGraph from '../EventsGraph'
import ObserverController from '../ObserverController'
import { EntityHoverMessage } from '../../types/EntityHoverMessage'

/**
 * CONST
 */

const ID              : string = 'EGEntityHoverObserved',
      CHANNELID       : string = __OBSERVER_ENTITY_HOVER_CHANNEL_ID__

/**
 * EGEntityHoverObserved
 *
 * @class
 * @extends {Observed}
 */

export default abstract class EGEntityHoverObserved {

  private static _observer        : Observer<EntityHoverMessage>      = ObserverController.addObserved<EntityHoverMessage>( new Observer<EntityHoverMessage>(ID) )

  private static _isInitialized   : boolean                           = false

  /**
   * _onMessageUpdate
   *
   * @param {EventsGraph} controller
   * @param {EntityHoverMessage<EntityType>} message
   */

  private static _onMessageUpdate(controller: EventsGraph, message: EntityHoverMessage): void {

    if (message.isOver) {
      controller.activateCursor()
    } else {
      controller.deactivateCursor()
    }
  }

  /**
   * init
   * 
   * @static
   */

  public static init(controller: EventsGraph): void {

    // Make sure only initialized once
    if (EGEntityHoverObserved._isInitialized) { return }

    EGEntityHoverObserved
      ._observer
      // Setup subscription(s)
      .subscribe<EntityHoverMessage>(
        CHANNELID,
        (message: EntityHoverMessage): void => {
          EGEntityHoverObserved._onMessageUpdate(controller, message)
        }
      )

    EGEntityHoverObserved._isInitialized = true
  }
}