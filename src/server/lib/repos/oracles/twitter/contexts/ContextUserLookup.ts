import { constants } from "../../../../../constants"
import IEventsGraphCollectionContextRequest from "../../../../../domain/IEventsGraphCollectionContextRequest"
import IEventsGraphCollectionContextResponse from "../../../../../domain/IEventsGraphCollectionContextResponse"
import LooseObject from "../../../../../domain/ILooseObject"
import { Context } from "../../../Context"
import IUpdateGraphDataCallback from "../../../../../domain/IUpdateGraphDataCallback"
import { UserService } from "../UserService"

/**
 * ContextUserLookup
 *
 * @class
 * @implements {IEventsGraphCollectionContext}
 */

class ContextUserLookup extends Context {

/**
 * _id
 * 
 * @description ID for context
 * @protected
 * @type {string}
 */

  protected _id: string = constants.TWITTER_USER_LOOKUP_CONTEXT_ID

  /**
   * _buildRequestParameters
   *
   * @param request {IEventsGraphCollectionContextRequest}
   * @returns {LooseObject}
   */

  protected _buildRequestParameters( request: IEventsGraphCollectionContextRequest ): LooseObject {

    // Populate default field values
    const defaultParams: Map<string, string> = new Map()

    if (process.env.TWITTER_KEY_VALUE_TWEET_FIELDS && process.env.DEFAULT_VALUE_USER_TWEET_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_TWEET_FIELDS, process.env.DEFAULT_VALUE_USER_TWEET_FIELDS)
    }
    if (process.env.TWITTER_KEY_VALUE_EXPANSIONS && process.env.DEFAULT_VALUE_USER_EXPANSIONS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_EXPANSIONS, process.env.DEFAULT_VALUE_USER_EXPANSIONS)
    }
    if (process.env.TWITTER_KEY_VALUE_USER_FIELDS && process.env.DEFAULT_VALUE_USER_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_USER_FIELDS, process.env.DEFAULT_VALUE_USER_FIELDS)
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
   * callAction
   *
   * @description execute action
   * @param request {IEventsGraphCollectionContextRequest}
   * @returns {Promise<IEventsGraphCollectionContextResponse>}
   */

  public async getData(request: IEventsGraphCollectionContextRequest) : Promise<IEventsGraphCollectionContextResponse> {
    return UserService.getUsersBy( this._buildRequestParameters( request ), request )
  }

  /**
   * getDataStream
   *
   * @param {IEventsGraphCollectionContextRequest} request 
   * @param {IUpdateGraphDataCallback} cb 
   */

   public getDataStream(request: IEventsGraphCollectionContextRequest, cb: IUpdateGraphDataCallback): void {
    cb( new Error('Stream not available') )
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
export default new ContextUserLookup()