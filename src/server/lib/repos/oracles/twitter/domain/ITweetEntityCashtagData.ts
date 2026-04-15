import ITweetEntityData from "./ITweetEntityData";

/**
 * ITweetEntityCashtagData
 *
 * @interface
 * @extends {ITweetEntityData}
 */

export default interface ITweetEntityCashtagData extends ITweetEntityData {
  tag?: string
}