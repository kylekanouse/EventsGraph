import ITweetEntityData from "./ITweetEntityData";

/**
 * ITweetEntityHashtagData
 *
 * @interface
 * @extends {ITweetEntityData}
 */

export default interface ITweetEntityHashtagData extends ITweetEntityData {
  tag?: string
}