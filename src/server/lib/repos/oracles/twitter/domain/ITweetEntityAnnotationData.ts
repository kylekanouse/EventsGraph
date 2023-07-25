import ITweetEntityData from "./ITweetEntityData";

/**
 * ITweetEntityAnnotationData
 * 
 * @interface
 * @extends {ITweetEntityData}
 */

export default interface ITweetEntityAnnotationData extends ITweetEntityData {
  probability? : number
  type? : string
  normalized_text? : string
}