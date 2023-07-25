import ITweetEntityAnnotationData from "./ITweetEntityAnnotationData";
import ITweetEntityCashtagData from "./ITweetEntityCashtagData";
import ITweetEntityHashtagData from "./ITweetEntityHashtagData";
import ITweetEntityMentionData from "./ITweetEntityMentionData";
import ITweetEntityUrlData from "./ITweetEntityUrlData";

/**
 * ITweetEntitiesData
 * 
 * @interface
 */

export default interface ITweetEntitiesData {
  annotations?: ITweetEntityAnnotationData[]
  urls?: ITweetEntityUrlData[]
  hashtags?: ITweetEntityHashtagData[]
  mentions?: ITweetEntityMentionData[]
  cashtags?: ITweetEntityCashtagData[]
}