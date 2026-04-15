import { ColorName } from "../types/ColorName"
import { getCursor } from "./Utils"

/**
 * CONST
 */

const DELAY                       : number          = 5,
      DEFAULT_COLOR               : ColorName       = 'lavender',
      ACTIVE_COLOR                : ColorName       = 'red',
      DEFAULT_OPACITY             : number          = 0.5,
      ACTIVE_OPACITY              : number          = 1

/**
 * Cursor
 *
 * @description wrapper class to interface with AFrame cursor object
 */

export default class Cursor {

  private _cursor: any

  /**
   * constructor
   */

  constructor() {
    setTimeout(() => {
      this._cursor = getCursor()
    }, DELAY)
  }

  /**
   * activate
   *
   * @returns {Cursor}
   */

  activate(): Cursor {
    this._cursor.setAttribute('color', ACTIVE_COLOR)
    this._cursor.setAttributes('opacity', ACTIVE_OPACITY)
    return this
  }

  /**
   * deactivate
   *
   * @returns {Cursor}
   */

  deactivate(): Cursor {
    this._cursor.setAttribute('color', DEFAULT_COLOR)
    this._cursor.setAttributes('opacity', DEFAULT_OPACITY)
    return this
  }
}