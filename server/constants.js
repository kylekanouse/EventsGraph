"use strict";
/**
 * constants
 *
 * @description main container for application scope constants
 * @abstract
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.constants = void 0;
class constants {
}
exports.constants = constants;
/**
 * SEP
 *
 * @description short for SEPERATOR string value to seperate elements in string
 * @static
 * @type {string}
 */
constants.SEP = '-';
constants.LABEL_MAX_WORD_COUNT = 150;
constants.LABEL_MAX_WORDS_BEFORE_NEW_LINE = 10;
constants.DEFAULT_COLLECTION_ASSOCIATION_TYPE = "central";
constants.DEFAULT_NODE_VALUE = 30;
/**
 * DummyData
 */
constants.DUMMY_DATA_COLLECTION_ID = 'dummydata';
constants.DUMMY_DATA_BASIC_CONTEXT_ID = 'dummydata-basic';
/**
 * BasicNetwork
 */
constants.BASICNETWORK_COLLECTION_ID = 'basicnetwork';
constants.BASICNETWORK_OPERATIONS_CONTEXT_ID = 'basicnetwork-operations';
/**
 * TWITTER RELATED
 */
constants.TWITTER_BASE_URL = 'https://twitter.com/';
constants.TWITTER_TWEET_URL_PATTERN = '{AUTHOR_ID}/status/{ID}';
constants.TWITTER_HASHTAG_SEARCH_URL_PATTERN = 'hashtag/{HASHTAG}';
constants.TWITTER_CASHTAG_SEARCH_URL_PATTERN = 'search?q=%24{CASHTAG}';
constants.TWITTER_DEFAULT_TWEET_COUNT = 30;
constants.TWITTER_COLLECTION_ID = 'twitter';
constants.TWITTER_TWEET_COLLECTIN_ID = 'tweet-collection';
constants.TWITTER_TWEET_COLLECTIN_LABEL_PREFIX = 'Tweet Collection';
constants.TWITTER_TWEET_ENTITIES_LABEL_PREFIX = 'Entities';
constants.TWITTER_TWEET_PATH_ID = 'tweets';
constants.TWITTER_TWEET_LOOKUP_CONTEXT_ID = 'tweet-lookup';
constants.TWITTER_TWEETS_LOOKUP_CONTEXT_ID = 'tweets-lookup';
constants.TWITTER_TWEETS_LOKUP_PLACEHOLDER_TEXT = 'Enter Tweet ID(s)';
constants.TWITTER_USER_LOOKUP_CONTEXT_ID = 'user-lookup';
constants.TWITTER_USER_LOKUP_PLACEHOLDER_TEXT = 'Enter @Username(s)';
constants.TWITTER_USER_PATH_ID = 'users/by';
constants.TWITTER_USER_COLLECTIN_ID = 'user-collection';
constants.TWITTER_USER_COLLECTIN_LABEL_PREFIX = 'User Collection';
constants.TWITTER_TWEET_SEARCH_CONTEXT_ID = 'search-tweets';
constants.TWITTER_TWEETS_QUERY_PLACEHOLDER_TEXT = 'Search:';
constants.TWITTER_TWEET_SEARCH_RECENT_PATH_ID = 'tweets/search/recent';
constants.TWITTER_FILTERED_STREAM_CONTEXT_ID = 'filtered-stream';
constants.TWITTER_FILTERED_STREAM_PATH_ID = 'tweets/search/stream';
constants.TWITTER_FILTERED_STREAM_RULES_PATH_ID = 'tweets/search/rules';
constants.TWITTER_FITERED_STREAM_MAX_SAMPLE_SIZE = 70;
constants.TWITTER_TWEET_TYPE_ID = 'tweet';
constants.TWITTER_TWEET_CONTEXT_ANNOTATION_ID = 'context-annotation';
constants.TWITTER_TWEET_CONTEXT_ANNOTATIONS_LABEL = 'Context Annotations';
constants.TWITTER_ENTITY_ID_PREFIX = 'entity';
constants.TWITTER_ENTITIES_ID_PREFIX = 'entities';
constants.TWITTER_USER_ID_PREFIX = 'user';
constants.TWITTER_MEDIA_ENTITY_ID_PREFIX = 'media';
constants.TWITTER_MEDIA_COLLECTION_ID = 'media-collection';
constants.TWITTER_MEDIA_ENTITY_LABEL_PREFIX = 'Media';
constants.TWITTER_USER_PUBLIC_METRICS_LABEL = 'User Public Metrics';
constants.TWITTER_PUBLIC_METRICS_ID_PREFIX = 'public-metrics';
constants.TWITTER_PUBLIC_METRICS_LABEL = 'Public Metrics';
constants.TWITTER_PUBLIC_METRICS_POSTFIX_ID = 'metric';
constants.TWITTER_PUBLIC_METRICS_VAL_MULTIPLIER = 25;
constants.TWITTER_ENTITY_NODE_GROUP_VALUE = 1;
constants.TWITTER_ENTITIES_HASHTAGS_ID = 'hashtags';
constants.TWITTER_ENTITIES_MENTIONS_ID = 'mentions';
constants.TWITTER_ENTITIES_ANNOTATIONS_ID = 'annotations';
constants.TWITTER_ENTITIES_URLS_ID = 'urls';
constants.TWITTER_ENTITIES_CASHTAG_ID = 'cashtags';
constants.TWITTER_ENTITIES_NODE_VALUE = 1;
constants.TWITTER_TWEET_SOURCE_CONTEXT_ID = "tweet-source";
constants.TWITTER_TWEET_SOURCE_LABEL_PREFIX = "Source";
constants.TWITTER_TWEET_SOURCE_AD_VALUES = ['Twitter for Advertisers (legacy)', 'Twitter Ads'];
constants.TWITTER_TWEET_SOURCE_IPHONE_VALUES = ['Twitter for iPhone'];
constants.TWITTER_TWEET_SOURCE_WEB_APP_VALUES = ['Twitter Web App'];
constants.TWITTER_TWEET_SOURCE_TWITTER_MEDIA_STUDIO_VALUES = ['Twitter Media Studio'];
constants.TWITTER_TWEET_SOURCE_TWITTER_ANDROID_VALUES = ['Twitter for Android'];
constants.TWITTER_TWEET_SOURCE_SPRINKLR_VALUES = ['Sprinklr'];
/**
 * Tweet Errors messages
 */
constants.TWITTER_TWEET_NO_ID_PROVIDED = 'Tweet ID is required';
/**
 * Client
 */
constants.CONTROLS_SUBMIT_BUTTON_TEXT = 'Get Graph';
constants.LINK_TEXT_COLOR = 'lightgrey';
constants.LINK_TEXT_HEIGHT = 1.5;
constants.NODE_DEFAULT_COLOR = 0x00ff00;
constants.MAIN_PLANE_COLOR = 0xFF0000;
//# sourceMappingURL=constants.js.map