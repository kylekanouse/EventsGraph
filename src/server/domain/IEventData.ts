 /**
 * IEventData
 *
 * @description interface for a single EventsGraph event data
 * @interface
 */
export default interface IEventData {
  action      : string
  source      : string
  target      : string
  id?         : string
  category?   : string
  label?      : string
  val?        : number
  type?       : string
  timestamp?  : number
}