/**
 * ITweetPublicMetricsData
 *
 * @description interface for public metirics associated to tweets
 * @interface
 */

export default interface ITweetPublicMetricsData {
  retweet_count?: number,
  reply_count?: number,
  like_count?: number,
  quote_count?: number
}