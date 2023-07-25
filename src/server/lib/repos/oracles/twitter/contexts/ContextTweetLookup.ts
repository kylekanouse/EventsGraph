
import IEventsGraphCollectionContextResponse from '../../../../../domain/IEventsGraphCollectionContextResponse'
import IEventsGraphCollectionContextRequest from '../../../../../domain/IEventsGraphCollectionContextRequest'
import { constants } from '../../../../../constants'
import { Context } from "../../../Context"
import LooseObject from '../../../../../domain/ILooseObject'
import IUpdateGraphDataCallback from '../../../../../domain/IUpdateGraphDataCallback'
import { TweetService } from '../TweetService'

/**
 * ContextTweetLookup
 *
 * @description main context for dealing with a single or multiple tweet
 * @class
 */

class ContextTweetLookup extends Context {

  /**
   * _id
   * 
   * @description ID for context
   * @protected
   * @type {string}
   */

  protected _id: string = constants.TWITTER_TWEET_LOOKUP_CONTEXT_ID

  /**
   * _buildRequestParameters
   *
   * @param request {IEventsGraphCollectionContextRequest}
   * @returns {LooseObject}
   */

  protected _buildRequestParameters( request: IEventsGraphCollectionContextRequest ): LooseObject {

    // Remove ID from params due to namespace collision
    delete request.params.id

    // Populate default field values
    const defaultParams: Map<string, string> = new Map()
    // console.log('process.env = ', process.env)
    if (process.env.TWITTER_KEY_VALUE_TWEET_FIELDS && process.env.DEFAULT_VALUE_TWEETS_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_TWEET_FIELDS, process.env.DEFAULT_VALUE_TWEETS_FIELDS)
    }
    if (process.env.TWITTER_KEY_VALUE_EXPANSIONS && process.env.DEFAULT_VALUE_TWEETS_EXPANSIONS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_EXPANSIONS, process.env.DEFAULT_VALUE_TWEETS_EXPANSIONS)
    }
    if (process.env.TWITTER_KEY_VALUE_USER_FIELDS && process.env.DEFAULT_VALUE_TWEETS_USER_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_USER_FIELDS, process.env.DEFAULT_VALUE_TWEETS_USER_FIELDS)
    }
    if (process.env.TWITTER_KEY_VALUE_MEDIA_FIELDS && process.env.DEFAULT_VALUE_TWEETS_MEDIA_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_MEDIA_FIELDS, process.env.DEFAULT_VALUE_TWEETS_MEDIA_FIELDS)
    }
    if (process.env.TWITTER_KEY_VALUE_PLACE_FIELDS && process.env.DEFAULT_VALUE_TWEETS_PLACE_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_PLACE_FIELDS, process.env.DEFAULT_VALUE_TWEETS_PLACE_FIELDS)
    }
    if (process.env.TWITTER_KEY_VALUE_POLL_FIELDS && process.env.DEFAULT_VALUE_TWEETS_POLL_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_POLL_FIELDS, process.env.DEFAULT_VALUE_TWEETS_POLL_FIELDS)
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
    return true
  }

  /**
   * getData
   *
   * @description execute action
   * @param request {IEventsGraphCollectionContextRequest}
   * @returns {Promise<IEventsGraphCollectionContextResponse>}
   */

  public async getData(request: IEventsGraphCollectionContextRequest) : Promise<IEventsGraphCollectionContextResponse> {

    // Make sure an ID was provided
    if (!request.params?.id) { 
      throw new Error(constants.TWITTER_TWEET_NO_ID_PROVIDED) 
    }

    // Use Twitter Service to get tweet by ID
    return TweetService.getTweet(request.params?.id, this._buildRequestParameters(request), request)
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

  /**
   * getDataStreamSample
   *
   * @param {IEventsGraphCollectionContextRequest} request
   * @returns {Promise<IEventsGraphCollectionContextResponse>}
   */
  
   public async getDataStreamSample(request: IEventsGraphCollectionContextRequest) : Promise<IEventsGraphCollectionContextResponse> {
    return new Promise( async (resolve, reject) => {
      reject('Context does not support stream sample')
    })
  }
}

// Export
export default new ContextTweetLookup()