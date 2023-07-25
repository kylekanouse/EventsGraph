import { constants } from "../../../../../constants"
import IEventsGraphCollectionContextRequest from "../../../../../domain/IEventsGraphCollectionContextRequest"
import IEventsGraphCollectionContextResponse from "../../../../../domain/IEventsGraphCollectionContextResponse"
import LooseObject from "../../../../../domain/ILooseObject"
import { Context } from "../../../Context"
import IStreamData from '../../../../../domain/IStreamData'
import IUpdateGraphDataCallback from '../../../../../domain/IUpdateGraphDataCallback'
// import StreamRuleCollection from "../StreamRuleCollection"
// import StreamRule from "../StreamRule"
// import { RulesService } from "../RulesService"
import IStreamRuleResponse from "../domain/IStreamRuleResponse"
import { TweetService } from "../TweetService"
import IFilteredStreamParams from "../domain/IFilteredStreamParams"
import IFilteredStreamRequest from "../domain/IFilteredStreamRequest"

/**
 * ERROR_NO_STREAM_REQUEST
 *
 * @constant
 * @type {string}
 */

const ERROR_NO_STREAM_REQUEST: string = 'Data for this context is only able to be accessed through a stream'

/**
 * ContextFilteredStream
 *
 * @description context for grabbing filtered stream tweets and updating rules
 * @class
 * @extends {Context}
 */

class ContextFilteredStream extends Context implements IStreamData {

  /**
   * _id
   * 
   * @description ID for context
   * @protected
   * @type {string}
   */

  protected _id: string = constants.TWITTER_FILTERED_STREAM_CONTEXT_ID


  // protected _rules: StreamRuleCollection = new StreamRuleCollection()

  /**
   * _buildRequestParameters
   *
   * @param request {IEventsGraphCollectionContextRequest}
   * @returns {LooseObject}
   */

  protected _buildRequestParameters( collectionRequest: IEventsGraphCollectionContextRequest ): LooseObject {

    console.log('ConextFilteredStream | _buildRequestParameters()')

    const sampleSize: number | undefined = collectionRequest.params?.sampleSize

    const request: IFilteredStreamRequest = this._parseContextRequest(collectionRequest)

    // Populate default field values
    const defaultParams: Map<string, string> = new Map()

    if (process.env.TWITTER_KEY_VALUE_EXPANSIONS && process.env.DEFAULT_VALUE_FILTERED_STREAM_EXPANSIONS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_EXPANSIONS, process.env.DEFAULT_VALUE_FILTERED_STREAM_EXPANSIONS)
    }
    if (process.env.TWITTER_KEY_VALUE_TWEET_FIELDS && process.env.DEFAULT_VALUE_FILTERED_STREAM_TWEETS_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_TWEET_FIELDS, process.env.DEFAULT_VALUE_FILTERED_STREAM_TWEETS_FIELDS)
    }
    if (process.env.TWITTER_KEY_VALUE_USER_FIELDS && process.env.DEFAULT_VALUE_FILTERED_STREAM_USER_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_USER_FIELDS, process.env.DEFAULT_VALUE_FILTERED_STREAM_USER_FIELDS)
    }
    if (process.env.TWITTER_KEY_VALUE_MEDIA_FIELDS && process.env.DEFAULT_VALUE_FILTERED_STREAM_MEDIA_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_MEDIA_FIELDS, process.env.DEFAULT_VALUE_FILTERED_STREAM_MEDIA_FIELDS)
    }
    if (process.env.TWITTER_KEY_VALUE_PLACE_FIELDS && process.env.DEFAULT_VALUE_FILTERED_STREAM_PLACE_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_PLACE_FIELDS, process.env.DEFAULT_VALUE_FILTERED_STREAM_PLACE_FIELDS)
    }
    if (process.env.TWITTER_KEY_VALUE_POLL_FIELDS && process.env.DEFAULT_VALUE_FILTERED_STREAM_POLL_FIELDS) {
      defaultParams.set(process.env.TWITTER_KEY_VALUE_POLL_FIELDS, process.env.DEFAULT_VALUE_FILTERED_STREAM_POLL_FIELDS)
    }

    const params = {...Object.fromEntries(defaultParams.entries()), ...request.params}


    // Merge default values with requested parameters
    return { request, params, sampleSize } as LooseObject
  }

  /**
   * _parseResponse
   *
   * @returns {IFilteredStreamParams}
   */

  protected _parseContextRequest(request: IEventsGraphCollectionContextRequest): any {

    const params: IFilteredStreamParams = request.params
    // console.log('ConextFilteredStream | params = ', params)
    // delete highjacked namespace
    delete request.params.rules
    delete request.params.sampleSize

    return { request, params }
  }

  /**
   * _getCurrentRules()
   *
   * @returns {Promise<IStreamRuleResponse>}
   */
  // private async _getCurrentRules(): Promise<IStreamRuleResponse> {
  //   return this._getRules()
  // }

  /**
   * _getRules
   *
   * @param ids {string | undefined}
   * @returns {Promise<IStreamRuleResponse>}
   */

  // private async _getRules(ids?: string): Promise<IStreamRuleResponse> {
  //   return RulesService.getRules(ids)
  // }

  /**
   * _addRules
   *
   * @param {StreamRule[]} rules
   * @returns {ContextFilteredStream}
   */

  // private async _addRules(rules: StreamRule[]): Promise<StreamRuleCollection> {

  //   // Add rules through service
  //   const { data }: IStreamRuleResponse = await RulesService.addRules( rules )

  //   // Store result data in collection
  //   this._rules.mergeData(data)
  //   console.log('ContextFilteredStream | after merge | this._rules = ', this._rules)
  //   // Return collection
  //   return this._rules
  // }


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
   * @description get data from context
   * @param request {IEventsGraphCollectionContextRequest}
   * @returns {Promise<IEventsGraphCollectionContextResponse>}
   */

  public async getData(request: IEventsGraphCollectionContextRequest): Promise<IEventsGraphCollectionContextResponse> {
    return new Promise( async (resolve, reject) => {
      reject(ERROR_NO_STREAM_REQUEST)
    })
  }

  /**
   * getDataStream
   *
   * @param {IEventsGraphCollectionContextRequest} request 
   * @param {IUpdateGraphDataCallback} cb
   * @todo REMOVE: reference to IUpdateGraphDataCallback as is graph domain and add twitter domain update callback interface
   */

  public getDataStream(r: IEventsGraphCollectionContextRequest, cb: IUpdateGraphDataCallback): void {
    console.log('getDataStream | r = ', r)
    const { request, params, sampleSize } = this._buildRequestParameters( r )
    const newRules      = params.rules

    if (false && newRules) {
      try {
        // Get existing rules
        // this._getCurrentRules()
        //   .then( (resp: IStreamRuleResponse) => {
        //     console.log('ContextFilteredStream | newRules = ', newRules)
        //     console.log('ContextFilteredStream | resp = ', resp)
        //     // Load up existing rules and return new ones to be added
        //     // return this._rules
        //     //   .loadData(resp.data)
        //     //   .mergeData(newRules)
        //     //   .getUnsavedValues()
        //   })

          // .then((addRules: StreamRule[]) => {
            
          //   // Add new rules to stream
          //   this._addRules(addRules).catch( (err) => {
          //     console.error(err)
          //   })
          // })
          // .catch( (err) => {
          //   console.error('ERROR: ', err)
          // })
      } catch (error) {
        console.error(error)
      }
    }

    try {

      TweetService.listenToStream( params, request, cb, sampleSize )

    } catch (error) {
      console.log('ERROR: Twitter client error msg = ', error)
      cb(error)
    }
  }
}

// Export
export default new ContextFilteredStream()