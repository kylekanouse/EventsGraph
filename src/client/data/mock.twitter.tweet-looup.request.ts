  /// <reference path='../types/index.d.ts' />
import IEventsGraphCollectionContextRequest from "../../server/domain/IEventsGraphCollectionContextRequest"
import { constants } from '../../server/constants'

/**
 * DummyRequests
 *
 * @abstract
 * @class
 */
export default abstract class DummyRequests {

  /**
   * dummyDataRequest
   *
   * @type {IEventsGraphCollectionContextRequest}
   */

  static readonly dummyDataRequest: IEventsGraphCollectionContextRequest = {
    collection:  constants.DUMMY_DATA_COLLECTION_ID,
    context:  constants.DUMMY_DATA_BASIC_CONTEXT_ID,
    isStream: false,
    params: {
      type: 'basic'
    }
  }

  /**
   * basicnetworkOperationsRequest
   *
   * @type {IEventsGraphCollectionContextRequest}
   */

  static readonly basicnetworkOperationsRequest: IEventsGraphCollectionContextRequest = {
    collection:  constants.BASICNETWORK_COLLECTION_ID,
    context:  constants.BASICNETWORK_OPERATIONS_CONTEXT_ID,
    isStream: true,
    params: {}
  }

  /**
   * twitterTweetLookupTweetRequest
   *
   * @description Mock request bject for looking up single tweet
   * @static
   * @readonly
   * @type {IEventsGraphCollectionContextRequest}
   */

  static readonly twitterTweetLookupTweetRequest: IEventsGraphCollectionContextRequest = {
    collection:  constants.TWITTER_COLLECTION_ID,
    context:  constants.TWITTER_TWEET_LOOKUP_CONTEXT_ID,
    isStream: false,
    params: {
      id: __TWITTER_TEST_TWEET_ID__
    }
  }

  /**
   * twitterTweetLookupTweetsRequest
   *
   * @description Mock request bject for looking up multiple tweets
   * @static
   * @readonly
   * @type {IEventsGraphCollectionContextRequest}
   */

  static readonly twitterTweetLookupTweetsRequest: IEventsGraphCollectionContextRequest = {
    collection:  constants.TWITTER_COLLECTION_ID,
    context:  constants.TWITTER_TWEETS_LOOKUP_CONTEXT_ID,
    isStream: false,
    params: {
      ids: __TWITTER_TEST_TWEET_IDS__
    }
  }

  /**
   * twitterTweetSearchRequest
   *
   * @description Mock request object for testing search context
   * @static
   * @readonly
   * @type {IEventsGraphCollectionContextRequest}
   */

  static readonly twitterTweetSearchRequest: IEventsGraphCollectionContextRequest = {
    collection:  constants.TWITTER_COLLECTION_ID,
    context:  constants.TWITTER_TWEET_SEARCH_CONTEXT_ID,
    isStream: false,
    params: {
      query: __TWITTER_TEST_TWEET_SEARCH_QUERY__
    }
  }

  /**
   * twitterUserLookupRequest
   *
   * @static
   * @readonly
   * @type {IEventsGraphCollectionContextRequest}
   */

  static readonly twitterUserLookupRequest: IEventsGraphCollectionContextRequest = {
    collection: constants.TWITTER_COLLECTION_ID,
    context: constants.TWITTER_USER_LOOKUP_CONTEXT_ID,
    isStream: false,
    params: {
      usernames: __TWITTER_TEST_USERNAME_IDS__
    }
  }

  /**
   * twitterFIlteredStreamRequest
   *
   * @static
   * @readonly
   * @type {IEventsGraphCollectionContextRequest}
   */

  static readonly twitterFIlteredStreamRequest: IEventsGraphCollectionContextRequest = {
    collection: constants.TWITTER_COLLECTION_ID,
    context: constants.TWITTER_FILTERED_STREAM_CONTEXT_ID,
    isStream: true,
    params: {
      rules: [
        {"value": "arizona has:media", "tag": "Arizona with media"},
        {"value": "meme has:images"}
      ],
      sampleSize: 30
    }
  }
}