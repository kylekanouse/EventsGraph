
/**
 * IStreamRuleData
 * 
 * @interface
 */

export default interface IStreamRuleData {

  /**
   * id
   * 
   * @description Unique identifier of this rule. This is returned as a string in order to avoid complications with languages and tools that cannot handle large integers.
   * @type {string}
   */

  id?: string

  /**
   * value
   * 
   * @description The rule text as submitted when creating the rule.
   * @type {string}
   * 
   */

  value: string

  /**
   * tag
   * 
   * @description The tag label as defined when creating the rule.
   * @type {string}
   */

  tag?: string 
}