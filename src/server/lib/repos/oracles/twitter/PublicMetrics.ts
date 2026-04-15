import { constants } from "../../../../constants"
import Entity from "../../../Entity"

/**
 * PublicMetrics
 *
 * @abstract
 * @class
 * @extends {Entity}
 */

export abstract class PublicMetrics extends Entity {

  /**
   * constructor
   *
   * @param type {string}
   * @param id {string | undefined}
   * @param icon {string | undefined}
   */

  constructor(type: string, id?: string, icon?: string) {
    super(type, id, icon)
  }

  /**
   * getID
   *
   * @returns {string}
   */

  public getID = (postFix?:string): string => {
    return this._id + ((postFix) ? ( constants.SEP + postFix) : '')
  }
}