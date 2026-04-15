import IStreamRuleData from "./domain/IStreamRuleData"

/**
 * StreamRule
 *
 * @class
 */

export default class StreamRule {

  private _value: string

  private _tag: string | undefined

  private _id: string | undefined

  /**
   * constructor
   *
   * @param {IStreamRuleData} data 
   */

  constructor(data: IStreamRuleData) {
    this._value = data.value
    this._tag = data.tag
    this._id = data.id
  }

  get id(): string | undefined {
    return this._id
  }

  get value(): string {
    return this._value
  }

  /**
   * value
   * 
   * @param {string} value
   */

  set value(value: string) {
    this._value = value
  }

  /**
   * tag
   * 
   * @param {string} tag
   */

  set tag(tag: string) {
    this._tag = tag
  }

  /**
   * getData
   *
   * @returns {IStreamRuleData}
   */

  public getData(): IStreamRuleData {
    return {
      value: this._value,
      tag: this._tag
    }
  }
}