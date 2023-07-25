import { AudioListener } from 'three'
import { constants } from "../../server/constants"
import IEventData from "../../server/domain/IEventData"
import Link from './Link'
import EventSound from './EventSound'
import * as Utils from './Utils'
import { GraphEventData } from '../types/GraphEventData'

const EVENT_PREFIX: string = 'egevent'

/**
 * GraphEvent
 *
 * @class
 */

export default class GraphEvent  {

  protected _id               : string

  protected _listener         : AudioListener

  protected _source           : string | number

  protected _target           : string | number

  protected _action           : string | undefined

  protected _category         : string | undefined

  protected _val              : number | undefined

  protected _label            : string | undefined

  protected _type             : string | undefined

  protected _sound            : EventSound

  protected _link             : Link | undefined

  /**
   * constructor
   *
   * @param data
   * @param listener
   */

  constructor(data: GraphEventData, listener: AudioListener) {

    // check or build id
    this._id = (data.id) ? data.id : EVENT_PREFIX + constants.SEP + Date.now().toString()

    // Set default state
    this._source        = data.source
    this._target        = data.target
    this._listener      = listener
    this._action        = data?.action
    this._category      = data?.category
    this._label         = data?.label
    this._val           = data?.val
    this._type          = data?.type

    if (data.link) {
      this._link = data.link
    }

    this._sound = new EventSound(this, this._listener)
  }

  get link(): Link | undefined {
    return this._link
  }

  get source(): string | number {
    return this._source
  }

  get target(): string | number {
    return this.target
  }

  /**
   * getData
   *
   * @returns {IEventData}
   */

  getData(): IEventData {
    return Utils.createEventData( this._id, this._category, this._action, this._label, this._val, this._type, this._source.toString(), this._target.toString() )
  }

  /**
   * playSound
   */

  playSound(): void {
    this._sound.play()
  }
}