import Entity from "../../../Entity"
import ITweetEntityData from "./domain/ITweetEntityData"

/**
 * TweetEntity
 *
 * @interface
 * @extends {Entity}
 */

export default abstract class TweetEntity extends Entity {

  protected _start: number | undefined

  protected _end: number | undefined

  /**
   * constructor
   * 
   * @param {ITweetEntityData} data
   * @param {string | undefined} type
   * @param {string | undefined} id
   * @param {string | undefined} icon
   */

  constructor(data: ITweetEntityData, type: string, id?: string, icon?: string) {

    super(type, id, icon)

    this._start           = (typeof data === 'object' && data.start) ? data.start       : undefined
    this._end             = (typeof data === 'object' && data.end) ? data.end           : undefined
  }
}