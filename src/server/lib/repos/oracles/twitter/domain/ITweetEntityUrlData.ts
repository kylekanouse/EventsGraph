import IImageData from "./IImageData";
import ITweetEntityData from "./ITweetEntityData";

/**
 * ITweetEntityUrlData
 *
 * @interface
 * @extends {ITweetEntityData}
 */

export default interface ITweetEntityUrlData extends ITweetEntityData {
  url?: string
  expanded_url?: string
  display_url?: string
  unwound_url?: string
  images?: IImageData[]
}