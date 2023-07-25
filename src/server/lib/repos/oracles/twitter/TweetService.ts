import TwitterStream from "twitter-v2/build/TwitterStream"
import { constants } from "../../../../constants"
import IEventsGraphCollectionContextRequest from "../../../../domain/IEventsGraphCollectionContextRequest"
import IEventsGraphCollectionContextResponse from "../../../../domain/IEventsGraphCollectionContextResponse"
import IUpdateGraphDataCallback from "../../../../domain/IUpdateGraphDataCallback"
import { buildProgressResponse, buildResponseFromEntity } from "../../../Utils"
import IIncludesCollections from "./domain/IIncludesCollections"
import IIncludesData from "./domain/IIncludesData"
import ITweetData from "./domain/ITweetData"
import ITweetResponse from "./domain/ITweetResponse"
import ITweetsResponse from "./domain/ITweetsResponse"
import TweetCollection from "./TweetCollection"
import { TwitterClient } from "./TwitterAPI"
import { getCollectionsFromTweetInludes, getCollectionsFromTweetInludesArray, listenForever } from "./TwitterUtils"

/**
 * TweetService
 *
 * @namespace
 * @todo Get rid of any graph domain concetps like IEventsGraphCollectionContextRequest
 */

export namespace TweetService {

  /**
   * getTweet
   *
   * @description Main method for retrieving a single Tweet from Twitter
   * @param {any} params
   * @param {IEventsGraphCollectionContextRequest} request
   * @returns {Promise<IEventsGraphCollectionContextResponse>}
   */

  export async function getTweet(id: string, params: any, request: IEventsGraphCollectionContextRequest): Promise<IEventsGraphCollectionContextResponse> {

    return new Promise( async (resolve, reject) => {

      try {

        // Make request through Twitter API client
        const respJSON                : ITweetResponse                      = await TwitterClient.get( constants.TWITTER_TWEET_PATH_ID + '/' + id,  params )
        const data                    : ITweetData | undefined              = respJSON.data

        // Load JSON data along with reference collections into tweet collection object
        const tweetCollection: TweetCollection = new TweetCollection( constants.TWITTER_TWEET_COLLECTIN_ID, false )

        // Get includes ref collections
        const includesCollections: IIncludesCollections = getCollectionsFromTweetInludes(respJSON.includes)

        if (data) {
          tweetCollection.loadDataSingle( data, includesCollections?.refUserCollection, includesCollections?.refMediaCollection)
        }

        // Build context response object
        const resp: IEventsGraphCollectionContextResponse = buildResponseFromEntity(tweetCollection, request)

        resolve(resp)

      } catch (error) {
        console.error('TweetService ERROR: error =', error)
        reject(error)
      }
    })  
  }

  /**
   * getTweets
   *
   * @description Main method for retrieving Tweets from twitter
   * @param {any} params 
   * @param {IEventsGraphCollectionContextRequest} request 
   * @returns {Promise<IEventsGraphCollectionContextResponse>}
   */

  export async function getTweets(path: string, params: any, request: IEventsGraphCollectionContextRequest): Promise<IEventsGraphCollectionContextResponse> {

    return new Promise( async (resolve, reject) => {

      try {

        const collectionID: string = constants.TWITTER_TWEET_COLLECTIN_ID + constants.SEP + Date.now()

        // Make request through Twitter API client
        const respJSON                : ITweetsResponse                       = await TwitterClient.get( path,  params )
        const data                    : ITweetData[] | undefined              = respJSON.data
        console.log('TweetService | respJSON.data = ', respJSON.data)
        // Load JSON data along with reference collections into tweet collection object
        const tweetCollection: TweetCollection = new TweetCollection( collectionID )

        // Get includes ref collections
        const includesCollections: IIncludesCollections = getCollectionsFromTweetInludes(respJSON.includes)

        if (data) {
          tweetCollection.loadData( data, includesCollections?.refUserCollection, includesCollections?.refMediaCollection)
        }

        // Build context response object
        const resp: IEventsGraphCollectionContextResponse = buildResponseFromEntity(tweetCollection, request)

        resolve(resp)

      } catch (error) {
        console.error('TweetService ERROR: error =', error)
        reject(error)
      }
    })
  }

  /**
   * listenToStream
   *
   * @param {IUpdateGraphDataCallback} cb
   * @param {IEventsGraphCollectionContextRequest} request
   */

  export function listenToStream(params: any, request: IEventsGraphCollectionContextRequest, cb: IUpdateGraphDataCallback, sampleSize: number | undefined = undefined) : void {

    let count               : number = 1
    let tweetData           : ITweetData[] = []
    let includesData        : IIncludesData[] = []

    try {

      listenForever( 
        () => TwitterClient.stream( constants.TWITTER_FILTERED_STREAM_PATH_ID, params ),
        (respJSON: ITweetResponse, stream: TwitterStream) => {

          console.log('STREAM | --------- respJSON = ', respJSON)

          if (respJSON.data) {
            tweetData.push(respJSON.data)
          }

          if (respJSON.includes) {
            includesData.push(respJSON.includes)
          }

          if (sampleSize == undefined || count>=sampleSize) {

            const collectionID: string = constants.TWITTER_TWEET_COLLECTIN_ID + constants.SEP + Date.now()
  
            const data                    : ITweetData[] | undefined          = tweetData
            const tweetCollection         : TweetCollection                   = new TweetCollection( collectionID, false )
            const includesCollections     : IIncludesCollections | undefined  = getCollectionsFromTweetInludesArray(includesData)
  
            // load data into collection if present
            if (data) {
              tweetCollection.loadData( data, includesCollections?.refUserCollection, includesCollections?.refMediaCollection)
            }
  
            // Package data in a response object
            const resp: IEventsGraphCollectionContextResponse = buildResponseFromEntity(tweetCollection, request)

            // Close Stream
            if (sampleSize) {
              stream.close()
            }
  
            // Return data through callback
            cb(null, resp)

          } else {

            // Get progress amount
            const progress: number = (count/sampleSize)

            // Get progress update response
            const resp: IEventsGraphCollectionContextResponse = buildProgressResponse(progress, request)

            // Increment the count
            ++count

            // Send response
            cb(null, resp)
          }
          // cb(null)
        }
      )
    } catch (err) {
      cb(new Error(err))
    }
  }
}
