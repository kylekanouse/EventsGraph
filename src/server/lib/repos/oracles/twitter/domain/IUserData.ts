import IUserEntitiesData from "./IUserEntitiesData"
import IUserPublicMetricsData from "./IUserPublicMetricsData"

/**
 * IUserData
 *
 * @description The user object contains Twitter user account metadata describing the referenced user. The user object is the primary object returned in the User Lookup endpoint. When requesting additional user fields on this endpoint, simply use the fields parameter user.fields. The user object can also be found as a child object and expanded in the Tweet object. The object is available for expansion with ?expansions=author_id or ?expansions=in_reply_to_user_id to get the condensed object with only default fields. Use the expansion with the field parameter: user.fields when requesting additional fields to complete the object.
 * @interface
 */

export default interface IUserData {
  id: string
  name?: string
  username?: string
  created_at?: string
  protected?: boolean
  withheld?: any
  location?: string
  url?: string
  description?: string
  verified?: boolean
  entities?: IUserEntitiesData
  profile_image_url?: string
  public_metrics?: IUserPublicMetricsData
  pinned_tweet_id?: string
}