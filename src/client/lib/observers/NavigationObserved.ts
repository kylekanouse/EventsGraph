import Observer from "../Observer"
import ObserverController from "../ObserverController"
import INavigation from "../../domain/INavigation"
import { NavMapType } from "../../types/NavMapType"
import ICallback from "../../domain/ICallback"
import { NavMapMessage } from '../../types/NavMapMessage'
import { NodesOnStageMessage } from "../../types/NodesOnStageMessage"
import { Entities } from "../../types/Entities"
import NavMapByIndex, { TYPE_ID as NAVBY_INDEX_ID, LABEL as NAVBY_INDEX_LABEL } from "../navmaps/NavMapByIndex"
import NavMapByType, { TYPE_ID as NAVBY_TYPE_ID, LABEL as NAVBY_TYPE_LABEL } from '../navmaps/NavMapByType'
import { NavMapActions } from "../../types/NavMapActions"
import { NavMapsInfo } from "../../types/NavMapsInfo"
import { UniqueStrings } from "../../types/UniqueStrings"
import { SetStringsMessage } from "../../types/SetStringsMessage"

/**
 * CONST
 */

 const ID                               : string                                    = 'NavigationObserved',
       CHANNELID                        : string                                    = __OBSERVER_NAVIGATION_CHANNEL_ID__,
       NODES_ON_STAGE_CHANNELID         : string                                    = __OBSERVER_NODES_ON_STAGE_CHANNEL_ID__,
       SELECTED_TYPES_CHANNELID         : string                                    = __OBSERVER_NAV_SELECTED_TYPES_CHANNEL_ID__,
       DEFAULT_NAV_MAP_TYPE_ID          : NavMapType                                = NAVBY_TYPE_ID,
       AVAILABLE_NAVS_MAP               : NavMapsInfo                               = new Map([
                                                                                                        [NAVBY_INDEX_ID, NAVBY_INDEX_LABEL],
                                                                                                        [NAVBY_TYPE_ID, NAVBY_TYPE_LABEL]
                                                                                                      ]),
       USE_ACTION_ID                    : NavMapActions                             = 'use'

/**
 * NavigationObserved
 *
 * @abstract
 */

export default abstract class NavigationObserved {

  private static _observer              : Observer<INavigation>                   = ObserverController.addObserved<INavigation>( new Observer<INavigation>(ID) )

  private static _callbacks             : Set<ICallback>                          = new Set()

  private static _isInitialized         : boolean                                 = false

  private static _entities              : Entities                                = new Map()

  private static _currentNavMapTypeID   : NavMapType                              = DEFAULT_NAV_MAP_TYPE_ID

  private static _selectedTypes         : UniqueStrings                           = new Set()

  /**
   * _getNavMap
   *
   * @param id 
   * @returns 
   */

  private static _getNavMap(id: NavMapType): INavigation {

    let NavMap: INavigation

    switch(id) {
      case NAVBY_TYPE_ID:
        const NavMapType: NavMapByType = new NavMapByType(NavigationObserved._entities)
        NavMapType.selectedTypes = NavigationObserved._selectedTypes
        NavMap = NavMapType
        break 
      case NAVBY_INDEX_ID:
      default:
        NavMap = new NavMapByIndex(NavigationObserved._entities)
    }

    NavigationObserved._currentNavMapTypeID = id
    return NavMap
  }

  /**
   * _produceUpdateMapMessage
   *
   * @param message 
   */

  private static _produceUpdateMapMessage(): void {
    NavigationObserved._observer.send<NavMapMessage>(CHANNELID, {navMapID: NavigationObserved._currentNavMapTypeID, action: USE_ACTION_ID})
  }

  /**
   * _processNodesOnStageMessage
   *
   * @param message 
   */

  private static _processNodesOnStageMessage(message: NodesOnStageMessage): void {
    NavigationObserved._entities = message.nodes
    NavigationObserved._produceUpdateMapMessage()
  }

  /**
   * _processSelecedTypesMessage
   *
   * @param message 
   */

  private static _processSelectedTypesMessage(message: SetStringsMessage): void {

    NavigationObserved._selectedTypes = message.values

    // Update Map
    NavigationObserved._produceUpdateMapMessage()
  }

  /**
   * _updateCallbacks
   *
   * @param {INavigation} event
   * @static
   */

  private static _updateCallbacks(navMap: INavigation): INavigation {

    // Loop through all callbacks
    NavigationObserved._callbacks.forEach((cb: ICallback): void => {
        cb(navMap)
    })

    return navMap
  }

  /**
   * ########################################################## GETTER / SETTER
   */

  /**
   * navMap
   */

  static get navMap() : INavigation { return NavigationObserved._observer.props }

  /**
   * availableMaps
   */

  static get availableMaps() : NavMapsInfo {
    return AVAILABLE_NAVS_MAP
  }

  /**
   * ########################################################## PUBLIC
   */

  /**
   * init
   * 
   * @static
   */

  public static init(): void {

    // Make sure only initialized once
    if (NavigationObserved._isInitialized) { return }

    NavigationObserved
      ._observer
      // Setup update subscription
      .mutate<NavMapMessage>(
        CHANNELID,
        (prevState: INavigation, message: NavMapMessage): INavigation => {

          // Make sure is "use" action and requested map is available to be used
          if (message.action !== USE_ACTION_ID || ![...AVAILABLE_NAVS_MAP.keys()].includes(message.navMapID)) { return prevState }

          // Return new nav map for state
          return NavigationObserved._updateCallbacks( NavigationObserved._getNavMap(message.navMapID) )
        }
      )
      // Setup Nodes subscription
      .subscribe<NodesOnStageMessage>(
        NODES_ON_STAGE_CHANNELID,
        NavigationObserved._processNodesOnStageMessage
      )
      // Setup Nodes subscription
      .subscribe<SetStringsMessage>(
        SELECTED_TYPES_CHANNELID,
        NavigationObserved._processSelectedTypesMessage
      )

    // Initalize map
    NavigationObserved._produceUpdateMapMessage()

    NavigationObserved._isInitialized = true
  }

  /**
   * send
   *
   * @param {NavMapMessage} message
   */

  public static send(message: NavMapMessage): void {
    NavigationObserved._observer.send<NavMapMessage>(CHANNELID, message)
  }
}