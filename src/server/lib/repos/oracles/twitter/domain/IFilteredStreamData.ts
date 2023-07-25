import IIncludesData from "./IIncludesData";
import IMatchingRuleData from "./IMatchingRuleData";
import ITweetAttachmentsData from "./ITweetAattachmentsData";
import ITweetData from "./ITweetData";
import ITweetEntitiesData from "./ITweetEntitiesData";
import ITweetGeoData from "./ITweetGeoData";
import ITweetPublicMetricsData from "./ITweetPublicMetricsData";

/**
 * IFilteredStreamData
 * 
 * @interface
 */

export default interface IFilteredStreamData {
  id: string
  text?: string
  created_at?: string
  author_id?: string
  conversation_id?: string
  in_reply_to_user_id?: string
  referenced_tweets?: ITweetData[]
  attachments?: ITweetAttachmentsData
  geo?: ITweetGeoData
  context_annotations?: any[]
  entities?: ITweetEntitiesData
  withheld?: any
  public_metrics?: ITweetPublicMetricsData
  organic_metrics?: any
  promoted_metrics?: any
  possibly_sensitive?: boolean
  lang?: string
  souce?: string
  reply_settings?: string
  includes?: IIncludesData
  errors?: any
  matching_rules?: IMatchingRuleData[]
}