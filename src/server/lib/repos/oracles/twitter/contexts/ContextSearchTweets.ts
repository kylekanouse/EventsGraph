import IEventsGraphCollectionContextResponse from '../../../../../domain/IEventsGraphCollectionContextResponse'
import IEventsGraphCollectionContextRequest from '../../../../../domain/IEventsGraphCollectionContextRequest'
import { constants } from '../../../../../constants'
import { Context } from "../../../Context"
import LooseObject from '../../../../../domain/ILooseObject'
import IUpdateGraphDataCallback from '../../../../../domain/IUpdateGraphDataCallback'
import { TweetService } from '../TweetService'

/**
 * ContextSearchTweets
 *
 * @class
 * @extends {Context}
 */

class ContextSearchTweets extends Context {

  /**
   * _id
   * 
   * @description ID for context
   * @protected
   * @type {string}
   */

  protected _id: string = constants.TWITTER_TWEET_SEARCH_CONTEXT_ID

  /**
   * _buildRequestParameters
   *
   * @param request {IEventsGraphCollectionContextRequest}
   * @returns {LooseObject}
   */

  protected _buildRequestParameters( request: IEventsGraphCollectionContextRequest ): LooseObject {

    let date              : Date                      = new Date()
    const timeOffset      : number                    = Number(process.env.DEFAULT_VALUE_TWEET_SEARCH_END_TIME_OFFSET_VALUE),
          defaultParams   : Map<string, string>       = new Map()

    // Setup offset time into distance to search tweets
    date.setDate( date.getDate() -  timeOffset )

    if (process.env.TWITTER_KEY_VALUE_TWEET_FIELDS && process.env.DEFAULT_VALUE_TWEET_SEARCH_TWEET_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_TWEET_FIELDS, process.env.DEFAULT_VALUE_TWEET_SEARCH_TWEET_FIELDS)
    }
    if (process.env.TWITTER_KEY_VALUE_EXPANSIONS && process.env.DEFAULT_VALUE_TWEET_SEARCH_EXPANSIONS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_EXPANSIONS, process.env.DEFAULT_VALUE_TWEET_SEARCH_EXPANSIONS)
    }
    if (process.env.TWITTER_KEY_VALUE_USER_FIELDS && process.env.DEFAULT_VALUE_TWEET_SEARCH_USER_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_USER_FIELDS, process.env.DEFAULT_VALUE_TWEET_SEARCH_USER_FIELDS)
    }
    if (process.env.TWITTER_KEY_VALUE_MEDIA_FIELDS && process.env.DEFAULT_VALUE_TWEET_SEARCH_MEDIA_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_MEDIA_FIELDS, process.env.DEFAULT_VALUE_TWEET_SEARCH_MEDIA_FIELDS)
    }
    if (process.env.TWITTER_KEY_VALUE_END_TIME_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_END_TIME_FIELDS, date.toISOString())
    }
    if (process.env.TWITTER_KEY_VALUE_PLACE_FIELDS && process.env.DEFAULT_VALUE_TWEET_SEARCH_PLACE_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_PLACE_FIELDS, process.env.DEFAULT_VALUE_TWEET_SEARCH_PLACE_FIELDS)
    }
    if (process.env.TWITTER_KEY_VALUE_POLL_FIELDS && process.env.DEFAULT_VALUE_TWEET_SEARCH_POLL_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_POLL_FIELDS, process.env.DEFAULT_VALUE_TWEET_SEARCH_POLL_FIELDS)
    }

    if (!request.params?.max_results
        && process.env.TWITTER_KEY_VALUE_MAX_RESULTS_FIELDS
        && process.env.DEFAULT_VALUE_TWEET_SEARCH_MAX_RESULTS_VALUE
      ) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_MAX_RESULTS_FIELDS, process.env.DEFAULT_VALUE_TWEET_SEARCH_MAX_RESULTS_VALUE)
    }

    // Merge default values with requested parameters
    return {...Object.fromEntries(defaultParams.entries()), ...request.params} as LooseObject
  }

  /**
   * isStreamable
   *
   * @returns {boolean}
   */
  
  public isStreamable(): boolean {
    return false
  }

  /**
   * callAction
   *
   * @description execute action
   * @param request {IEventsGraphCollectionContextRequest}
   * @returns {Promise<IEventsGraphCollectionContextResponse>}
   */

  public async getData(request: IEventsGraphCollectionContextRequest) : Promise<IEventsGraphCollectionContextResponse> {
    return TweetService.getTweets(constants.TWITTER_TWEET_SEARCH_RECENT_PATH_ID, this._buildRequestParameters( request ), request)
  }

  /**
   * getDataStream
   *
   * @param {IEventsGraphCollectionContextRequest} request 
   * @param {IUpdateGraphDataCallback} cb 
   */

  public getDataStream(request: IEventsGraphCollectionContextRequest, cb: IUpdateGraphDataCallback): void {
    cb(new Error('Stream not available'))
  }

  public async getDataStreamSample(request: IEventsGraphCollectionContextRequest) : Promise<IEventsGraphCollectionContextResponse> {
    return new Promise( async (resolve, reject) => {
      reject('Context does not support stream sample')
    })
  }
}

export default new ContextSearchTweets()