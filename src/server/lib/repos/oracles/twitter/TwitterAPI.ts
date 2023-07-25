import Twitter from 'twitter-v2'

/**
 * TwitterClient
 *
 * @description Main object to interface with Twitter V2 API
 * @constant
 */

const TwitterClient: Twitter = new Twitter({
  // consumer_key: process.env.TWITTER_CONSUMER_KEY,
  // consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  // access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  // access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  bearer_token: (process.env.TWITTER_BEARER_TOKEN) ? process.env.TWITTER_BEARER_TOKEN : '',
})

export { TwitterClient }