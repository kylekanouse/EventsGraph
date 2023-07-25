
/**
 * constants
 *
 * @description main container for application scope constants
 * @abstract
 */

export abstract class constants {

  /**
   * SEP
   *
   * @description short for SEPERATOR string value to seperate elements in string
   * @static
   * @type {string}
   */

  static readonly SEP: string = '-'

  static readonly LABEL_MAX_WORD_COUNT: number = 150

  static readonly LABEL_MAX_WORDS_BEFORE_NEW_LINE: number = 10

  static readonly DEFAULT_COLLECTION_ASSOCIATION_TYPE: string = "central"

  static readonly DEFAULT_NODE_VALUE: number = 30

  /**
   * DummyData
   */

  static readonly DUMMY_DATA_COLLECTION_ID: string = 'dummydata'

  static readonly DUMMY_DATA_BASIC_CONTEXT_ID: string = 'dummydata-basic'

  /**
   * BasicNetwork
   */

   static readonly BASICNETWORK_COLLECTION_ID: string = 'basicnetwork'

   static readonly BASICNETWORK_OPERATIONS_CONTEXT_ID: string = 'basicnetwork-operations'

  /**
   * TWITTER RELATED
   */

  static readonly TWITTER_BASE_URL: string = 'https://twitter.com/'

  static readonly TWITTER_TWEET_URL_PATTERN: string = '{AUTHOR_ID}/status/{ID}'

  static readonly TWITTER_HASHTAG_SEARCH_URL_PATTERN: string = 'hashtag/{HASHTAG}'

  static readonly TWITTER_CASHTAG_SEARCH_URL_PATTERN: string = 'search?q=%24{CASHTAG}'

  static readonly TWITTER_DEFAULT_TWEET_COUNT: number = 30

  static readonly TWITTER_COLLECTION_ID: string = 'twitter'

  static readonly TWITTER_TWEET_COLLECTIN_ID: string = 'tweet-collection'

  static readonly TWITTER_TWEET_COLLECTIN_LABEL_PREFIX: string = 'Tweet Collection'

  static readonly TWITTER_TWEET_ENTITIES_LABEL_PREFIX: string = 'Entities'

  static readonly TWITTER_TWEET_PATH_ID: string = 'tweets'

  static readonly TWITTER_TWEET_LOOKUP_CONTEXT_ID: string = 'tweet-lookup'

  static readonly TWITTER_TWEETS_LOOKUP_CONTEXT_ID: string = 'tweets-lookup'

  static readonly TWITTER_TWEETS_LOKUP_PLACEHOLDER_TEXT: string = 'Enter Tweet ID(s)'

  static readonly TWITTER_USER_LOOKUP_CONTEXT_ID: string = 'user-lookup'

  static readonly TWITTER_USER_LOKUP_PLACEHOLDER_TEXT: string = 'Enter @Username(s)'

  static readonly TWITTER_USER_PATH_ID: string = 'users/by'

  static readonly TWITTER_USER_COLLECTIN_ID: string = 'user-collection'

  static readonly TWITTER_USER_COLLECTIN_LABEL_PREFIX: string = 'User Collection'

  static readonly TWITTER_TWEET_SEARCH_CONTEXT_ID: string = 'search-tweets'

  static readonly TWITTER_TWEETS_QUERY_PLACEHOLDER_TEXT: string = 'Search:'

  static readonly TWITTER_TWEET_SEARCH_RECENT_PATH_ID: string = 'tweets/search/recent'

  static readonly TWITTER_FILTERED_STREAM_CONTEXT_ID: string = 'filtered-stream'

  static readonly TWITTER_FILTERED_STREAM_PATH_ID: string = 'tweets/search/stream'

  static readonly TWITTER_FILTERED_STREAM_RULES_PATH_ID: string = 'tweets/search/rules'

  static readonly TWITTER_FITERED_STREAM_MAX_SAMPLE_SIZE: number = 70

  static readonly TWITTER_TWEET_TYPE_ID: string = 'tweet'

  static readonly TWITTER_TWEET_CONTEXT_ANNOTATION_ID: string = 'context-annotation'

  static readonly TWITTER_TWEET_CONTEXT_ANNOTATIONS_LABEL: string = 'Context Annotations'

  static readonly TWITTER_ENTITY_ID_PREFIX: string = 'entity'

  static readonly TWITTER_ENTITIES_ID_PREFIX: string = 'entities'

  static readonly TWITTER_USER_ID_PREFIX: string = 'user'

  static readonly TWITTER_MEDIA_ENTITY_ID_PREFIX: string = 'media'

  static readonly TWITTER_MEDIA_COLLECTION_ID: string = 'media-collection'

  static readonly TWITTER_MEDIA_ENTITY_LABEL_PREFIX: string = 'Media'

  static readonly TWITTER_USER_PUBLIC_METRICS_LABEL: string = 'User Public Metrics'

  static readonly TWITTER_PUBLIC_METRICS_ID_PREFIX: string = 'public-metrics'

  static readonly TWITTER_PUBLIC_METRICS_LABEL: string = 'Public Metrics'

  static readonly TWITTER_PUBLIC_METRICS_POSTFIX_ID: string = 'metric'

  static readonly TWITTER_PUBLIC_METRICS_VAL_MULTIPLIER: number = 25

  static readonly TWITTER_ENTITY_NODE_GROUP_VALUE: number = 1

  static readonly TWITTER_ENTITIES_HASHTAGS_ID: string = 'hashtags'

  static readonly TWITTER_ENTITIES_MENTIONS_ID: string = 'mentions'

  static readonly TWITTER_ENTITIES_ANNOTATIONS_ID: string = 'annotations'

  static readonly TWITTER_ENTITIES_URLS_ID: string = 'urls'

  static readonly TWITTER_ENTITIES_CASHTAG_ID: string = 'cashtags'

  static readonly TWITTER_ENTITIES_NODE_VALUE: number = 1

  static readonly TWITTER_TWEET_SOURCE_CONTEXT_ID: string = "tweet-source"

  static readonly TWITTER_TWEET_SOURCE_LABEL_PREFIX: string = "Source"

  static readonly TWITTER_TWEET_SOURCE_AD_VALUES: string[] = ['Twitter for Advertisers (legacy)', 'Twitter Ads']

  static readonly TWITTER_TWEET_SOURCE_IPHONE_VALUES: string[] = ['Twitter for iPhone']

  static readonly TWITTER_TWEET_SOURCE_WEB_APP_VALUES: string[] = ['Twitter Web App']

  static readonly TWITTER_TWEET_SOURCE_TWITTER_MEDIA_STUDIO_VALUES: string[] = ['Twitter Media Studio']

  static readonly TWITTER_TWEET_SOURCE_TWITTER_ANDROID_VALUES: string[] = ['Twitter for Android']

  static readonly TWITTER_TWEET_SOURCE_SPRINKLR_VALUES: string[] = ['Sprinklr']


  /**
   * Tweet Errors messages
   */
  static readonly TWITTER_TWEET_NO_ID_PROVIDED: string = 'Tweet ID is required'


  /**
   * Client
   */
  static readonly CONTROLS_SUBMIT_BUTTON_TEXT: string = 'Get Graph'

  static readonly LINK_TEXT_COLOR: string = 'lightgrey'

  static readonly LINK_TEXT_HEIGHT: number = 1.5

  static readonly NODE_DEFAULT_COLOR: number = 0x00ff00

  static readonly MAIN_PLANE_COLOR: number = 0xFF0000

}