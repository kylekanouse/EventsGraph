import { EventType } from "../types/EventType"
import Event from "./Event"

const TYPE_ID: EventType = 'link'

/**
 * LinkEvent
 *
 * @class
 * @extends {Event}
 */

export default class LinkEvent extends Event {

  constructor() {
    super(TYPE_ID)
  }

}