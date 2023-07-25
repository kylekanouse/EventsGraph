import ITweetEntityData from "./ITweetEntityData";

/**
 * ITweetEntityMentionData
 *
 * @interface
 * @extends {ITweetEntityData}
 */

export default interface ITweetEntityMentionData extends ITweetEntityData {
  username?: string
}