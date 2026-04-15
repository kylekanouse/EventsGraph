import { constants } from "../../server/constants"
import IEventData from '../../server/domain/IEventData'

const ID_PREFIX: string = 'egevent',
      SEP: string = constants.SEP

/**
 * Event
 *
 * @class
 */

export default class Event {

  private _id               : string

  private _timestamp        : number

  private _data             : IEventData | undefined

  /**
   * constructor
   *
   * @param id 
   */

  constructor(data?: IEventData) {
    this._data          = data
    this._timestamp     = data.timestamp || Date.now() 
    this._id            = data.id || ID_PREFIX.concat(SEP, this._timestamp.toString())
  }
}