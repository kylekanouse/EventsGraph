import INavigation from '../domain/INavigation'
import { NavMapActions } from './NavMapActions'
import { NavMapType } from './NavMapType'

/**
 * NavMapMessage
 * 
 * @type
 */

export type NavMapMessage = {
  action: NavMapActions
  navMapID: NavMapType
}