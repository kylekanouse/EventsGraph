import Link from "../lib/Link"

/**
 * GraphEventData
 *
 * @description interface for a single EventsGraph event data
 * @interface
 */

 export declare type GraphEventData = {
  action      : string
  source      : string
  target      : string
  id?         : string
  category?   : string
  label?      : string
  val?        : number
  type?       : string
  link?       : Link
}