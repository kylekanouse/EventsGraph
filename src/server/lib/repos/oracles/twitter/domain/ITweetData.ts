import IContextAnnotationData from "./ITweetContextAnnotationData";
import ITweetAttachmentsData from "./ITweetAattachmentsData";
import ITweetEntitiesData from "./ITweetEntitiesData";
import ITweetGeoData from "./ITweetGeoData";
import ITweetNonPublicMetricsData from "./ITweetNonPublicMetricsData";
import ITweetPublicMetricsData from "./ITweetPublicMetricsData";
import ITweetReferenceData from "./ITweetReferenceData";

/**
 * ITweetData
 *
 * @description Tweets are the basic building block of all things Twitter. The Tweet object has a long list of ‘root-level’ fields, such as id, text, and created_at. Tweet objects are also the ‘parent’ object to several child objects including user, media, poll, and place. Use the field parameter tweet.fields when requesting these root-level fields on the Tweet object. The Tweet object that can be found and expanded in the user resource. Additional Tweets related to the requested Tweet can also be found and expanded in the Tweet resource. The object is available for expansion with ?expansions=pinned_tweet_id in the user resource or ?expansions=referenced_tweets.id in the Tweet resource to get the object with only default fields. Use the expansion with the field parameter: tweet.fields when requesting additional fields to complete the object.
 * @interface
 */
export default interface ITweetData {

  /**
   * id
   * 
   * @description The unique identifier of the requested Tweet.
   * @example "1050118621198921728"
   * @type {string}
   */

  id: string

  /**
   * text
   * 
   * @description The actual UTF-8 text of the Tweet. See twitter-text for details on what characters are currently considered valid.
   * @example "this is text.\n\nWant to read more? go here for some more: https://someplace.web"
   * @type {sring}
   */

  text?: string

  /**
   * attachments
   * 
   * @description Specifies the type of attachments (if any) present in this Tweet.
   * @type {ITweetAttachmentsData}
   */

  attachments?: ITweetAttachmentsData

  /**
   * author_id
   * 
   * @description The unique identifier of the User who posted this Tweet.
   * @type {string}
   */

  author_id?: string

  /**
   * context_annotations
   *
   * @description Contains context annotations for the Tweet.
   * @type {IContextAnnotationData[]}
   */

  context_annotations?: IContextAnnotationData[]

  /**
   * conversation_id
   *
   * @description The Tweet ID of the original Tweet of the conversation (which includes direct replies, replies of replies).
   * @example "1050118621198921728"
   * @type {string}
   */

  conversation_id?: string

  /**
   * created_at
   *
   * @description date (ISO 8601) Creation time of the Tweet.
   * @example "2019-06-04T23:12:08.000Z"
   * @type {string}
   */

  created_at?: string

  /**
   * entities
   * 
   * @description Entities which have been parsed out of the text of the Tweet. Additionally see entities in Twitter Objects.
   * @type {ITweetEntitiesData}
   */

  entities?: ITweetEntitiesData

  /**
   * geo
   *
   * @description Contains details about the location tagged by the user in this Tweet, if they specified one.
   * @type {ITweetGeoData}
   */

  geo?: ITweetGeoData

  /**
   * in_reply_to_user_id
   * 
   * @description If the represented Tweet is a reply, this field will contain the original Tweet’s author ID. This will not necessarily always be the user directly mentioned in the Tweet.
   * @type {string}
   */

  in_reply_to_user_id?: string

  /**
   * lang
   *
   * @type {string}
   */

  lang?: string

  non_public_metrics?: ITweetNonPublicMetricsData
  organic_metrics?: any
  possibly_sensitive?: boolean
  promoted_metrics?: any

  /**
   * public_metrics
   * 
   * @description Public engagement metrics for the Tweet at the time of the request.
   * @example {
   *      "retweet_count": 8,
   *      "reply_count": 2,
   *      "like_count": 39,
   *      "quote_count": 1
   *     }
   * @type {ITweetPublicMetricsData}
   */

  public_metrics?: ITweetPublicMetricsData

  /**
   * referenced_tweets
   * 
   * @description A list of Tweets this Tweet refers to. For example, if the parent Tweet is a Retweet, a Retweet with comment (also known as Quoted Tweet) or a Reply, it will include the related Tweet referenced to by its parent.
   * @type {ITweetReferenceData[]}
   */

  referenced_tweets?: ITweetReferenceData[]

  /**
   * reply_settings
   * 
   * @description Shows you who can reply to a given Tweet.
   * @type {"everyone" | "mentioned_users" | "followers"}
   */

  reply_settings?: "everyone" | "mentioned_users" | "followers"

  /**
   * source
   *
   * @description The name of the app the user Tweeted from.
   * @example "Twitter Web App"
   * @type {string}
   */

  source?: string

  withheld?: any
}