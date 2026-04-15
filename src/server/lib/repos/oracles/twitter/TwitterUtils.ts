import ITweetData from "./domain/ITweetData"
import IGraphNode from "../../../../domain/IGraphNode"
import { createGraphDataObject, createLink, createNode, mergeGraphData, normalize } from "../../../Utils"
import IGraphData from "../../../../domain/IGraphData"
import IGraphLink from "../../../../domain/IGraphLink"
import { constants } from "../../../../constants" 
import EntityTypeCollection from "./TweetEntityTypeCollection"
import User from "./User"
import IIncludesData from "./domain/IIncludesData"
import MediaCollection from "./MediaCollection"
import UserCollection from "./UserCollection"
import IIncludesCollections from "./domain/IIncludesCollections"
import TwitterStream from "twitter-v2/build/TwitterStream"
import exp from "constants"

// Setup constants
const SEP                                 = ( constants.SEP) ? constants.SEP : '-',
      TwitterLogo: string                 = (process.env.TWITTER_LOGO_URL) ? process.env.TWITTER_LOGO_URL : '',
      PUBLIC_METRICS_ID_PREFIX: string    = ( constants.TWITTER_PUBLIC_METRICS_ID_PREFIX) ? constants.TWITTER_PUBLIC_METRICS_ID_PREFIX : '',
      PUBLIC_METRICS_MULTIPLIER: number   = ( constants.TWITTER_PUBLIC_METRICS_VAL_MULTIPLIER) ? constants.TWITTER_PUBLIC_METRICS_VAL_MULTIPLIER : 10,
      PUBLIC_METRICS_ICON_URL: string     = (process.env.TWITTER_PUBLIC_METRICS_ICON_URL) ? process.env.TWITTER_PUBLIC_METRICS_ICON_URL : '',
      MAX_RETRIES_FOR_STREAM: number      = 3,
      TWEET_URL_PATTERN: string           = constants.TWITTER_TWEET_URL_PATTERN,
      HASHTAG_SEARCH_URL_PATTERN: string  = constants.TWITTER_HASHTAG_SEARCH_URL_PATTERN,
      CASHTAG_SEARCH_URL_PATTERN: string  = constants.TWITTER_CASHTAG_SEARCH_URL_PATTERN,
      TWITTER_BASE_URL: string            = constants.TWITTER_BASE_URL


/**
 * buildTweetUrl
 *
 * @param id 
 * @param authorID 
 * @returns 
 */

const buildTweetUrl = (id: string, authorID?: string): string => {

  return (authorID) ? TWITTER_BASE_URL + TWEET_URL_PATTERN.replace('{ID}', id).replace('{AUTHOR_ID}', authorID) : ''
}

export { buildTweetUrl }

/**
 * buildMentionUrl
 *
 * @param username
 * @returns
 */

const buildMentionUrl = (username: string): string => {
  return TWITTER_BASE_URL + username
}

export { buildMentionUrl }

/**
 * buildHashtagUrl
 *
 * @param hashtag
 * @returns
 */

const buildHashtagUrl = (hashtag: string): string => {
  return TWITTER_BASE_URL + HASHTAG_SEARCH_URL_PATTERN.replace('{HASHTAG}', hashtag)
}

export { buildHashtagUrl }

/**
 * buildCashtagUrl
 *
 * @param cashtag
 * @returns
 */

 const buildCashtagUrl = (cashtag: string): string => {
  return TWITTER_BASE_URL + CASHTAG_SEARCH_URL_PATTERN.replace('{HASHTAG}', cashtag)
}

export { buildCashtagUrl }

/**
 * createNodeFromTweet
 *
 * @param tweet {ITweetData}
 * @constant
 * @returns {IGraphNode}
 */

const createNodeFromTweet = (tweet: ITweetData): IGraphNode => {

  // Return new EventsGraph graph data node
  return createNode(tweet.id, tweet.text, 10, tweet.text, TwitterLogo,  tweet.source, 1, buildTweetUrl(tweet.id, tweet.author_id))
}

// Export
export { createNodeFromTweet }

/**
 * createGraphDataFromPublicMetrics
 *
 * @param sourceNodeID {string}
 * @param publicMetrics {any}
 * @returns {IGraphData}
 */

const createGraphDataFromPublicMetrics = (sourceNodeID: string, publicMetrics: any ): IGraphData => {

  const nodes       : IGraphNode[]    = []
  const links       : IGraphLink[]    = []

  if ( publicMetrics ) {

    for (const metric of Object.keys(publicMetrics)) {

      const nodeID              = sourceNodeID + SEP + PUBLIC_METRICS_ID_PREFIX + SEP + metric
      const normalizedVal       = normalize(publicMetrics[metric], 1000, 0)
      const val                 =  normalizedVal * PUBLIC_METRICS_MULTIPLIER

      nodes.push( createNode(
                              nodeID,
                              metric,
                              val,
                              metric,
                              '',
                              PUBLIC_METRICS_ID_PREFIX,
                              1
                            )
                )

      // Link tweet to Icon node
      links.push( createLink(sourceNodeID as string, nodeID, PUBLIC_METRICS_ID_PREFIX + SEP + metric + ' = ' + publicMetrics[metric]) )
    }
  }

  return createGraphDataObject(nodes, links)
}

// Export
export { createGraphDataFromPublicMetrics }

/**
 * createPublicMetricsNode
 *
 * @param tweet {ITweetData}
 * @returns {IGraphNode}
 */

const createPublicMetricsNode = (tweet: ITweetData): IGraphNode => {

  return createNode(
                    constants.TWITTER_PUBLIC_METRICS_ID_PREFIX + constants.SEP + tweet.id,
                    constants.TWITTER_PUBLIC_METRICS_LABEL,
                    undefined,
                    undefined,
                    PUBLIC_METRICS_ICON_URL,
                    constants.TWITTER_PUBLIC_METRICS_ID_PREFIX,
                    1
                   )
}

// Export
export { createPublicMetricsNode }

/**
 * createPublicMetricsLink
 *
 * @param tweet {ITweetData}
 * @returns {IGraphLink}
 */

const createPublicMetricsLink = (tweet: ITweetData): IGraphLink => {

  return createLink(
                    tweet.id as string,
                    constants.TWITTER_PUBLIC_METRICS_ID_PREFIX + constants.SEP + tweet.id,
                    constants.TWITTER_PUBLIC_METRICS_LABEL,
                    undefined
                  )
}

// Export
export { createPublicMetricsLink }

/**
 * createGraphDataFromEntitiesData
 *
 * @param entities {any}
 * @param sourceNodeID {string}
 * @constant
 * @returns {IGraphData}
 */

const createGraphDataFromEntitiesData = (entities: any, sourceNodeID?: string): IGraphData => {

  let graphData: IGraphData = createGraphDataObject()

  if ( entities ) {

    // Loop through all entities to collect nodes and links
    for (const type of Object.keys(entities)) {

      // Load collection to handle multiple entities of a given type
      const cGraphData: IGraphData                    = new EntityTypeCollection(type, sourceNodeID)
                                                              .loadData( entities[type] )
                                                              .getGraphData()

      // Append into main graphData object
      graphData = mergeGraphData(graphData, cGraphData)
    }
  }

  return graphData
}

// Export
export { createGraphDataFromEntitiesData }

/**
 * createGraphDataFromEntities
 *
 * @param entities {EntityTypeCollection[]}
 * @param sourceNodeID {string}
 * @returns {IGraphData}
 */

const createGraphDataFromEntities = (entities: EntityTypeCollection[], sourceNodeID?: string): IGraphData => {

  let nodes       : IGraphNode[]    = []
  let links       : IGraphLink[]    = []

  if ( entities ) {

    entities.map( (collection: EntityTypeCollection) => {

      // Get graph data from each collection
      const graphData = collection.getGraphData()

      // Append to node and link arrays
      nodes = nodes.concat(graphData.nodes)
      links = links.concat(graphData.links)
    })
  }

  // Return as Graph Data object
  return createGraphDataObject(nodes, links)
}

// Export
export { createGraphDataFromEntities }

/**
 * getUserIDsMap
 *
 * @param users {User[]}
 * @returns {Map<string, number>}
 */

const getUserIDsMap = (users: User[]): Map<string, number> => {  
  return users.reduce((map, user, index) => map.set(user.getID(), index), new Map())
}

// Export
export { getUserIDsMap }


let retryCount: number = 0

/**
 * listenForever
 *
 * @description funciton used to setup a long lasting connection to a twitter stream
 * @param streamFactory 
 * @param dataConsumer 
 */

const listenForever = async (streamFactory: Function, dataConsumer: Function) => {

  // console.log('[STREAM] ============ listenForever() ')
  try {
    const stream: TwitterStream = streamFactory()
    // console.log('[STREAM] ============ stream = ', stream)
    for await (const data of stream) {
      // console.log('[STREAM] ============ receiving data ', data)
      dataConsumer(data, stream)
    }
    // The stream has been closed by Twitter. It is usually safe to reconnect.
    // console.log('[STREAM] ============ Stream disconnected healthily. Reconnecting.')
    // listenForever(streamFactory, dataConsumer)
  } catch (error) {
    // An error occurred so we reconnect to the stream. Note that we should
    // probably have retry logic here to prevent reconnection after a number of
    // closely timed failures (may indicate a problem that is not downstream).
    console.warn('[STREAM] ============ Stream disconnected with error. Retrying.', error)
    if (retryCount<MAX_RETRIES_FOR_STREAM) {
      ++retryCount
      listenForever(streamFactory, dataConsumer)
    } else {
      throw new Error(error)
    }
  }
}

// Export
export { listenForever }

/**
 * getCollectionsFromTweetInludes
 *
 * @param {IIncludesData} includes 
 * @returns {IIncludesCollections}
 */

const getCollectionsFromTweetInludes = (includes?: IIncludesData): IIncludesCollections => {

  let refUserCollection: UserCollection | undefined
  let refMediaCollection: MediaCollection | undefined

  // Parse response JSON data for reference collections first before tweet
  if (includes) {
    refUserCollection              = (includes.users) ? new UserCollection( constants.TWITTER_USER_COLLECTIN_ID ).loadData( includes.users) : undefined
    refMediaCollection             = (includes.media) ? new MediaCollection( constants.TWITTER_MEDIA_COLLECTION_ID ).loadData( includes.media) : undefined
  }

  return {
    refUserCollection: refUserCollection,
    refMediaCollection: refMediaCollection
  } as IIncludesCollections
}

// Export
export { getCollectionsFromTweetInludes }

/**
 * getCollectionsFromTweetInludesArray
 *
 * @param includes 
 * @returns 
 */

const getCollectionsFromTweetInludesArray = (includes: IIncludesData[]): IIncludesCollections => {

  const pass: IIncludesData = includes.reduce((accumulator: IIncludesData, currentValue: IIncludesData): IIncludesData => {

    if (currentValue.tweets) {
      accumulator.tweets = (accumulator.tweets) ? [...accumulator.tweets, ...currentValue.tweets] : [...currentValue.tweets]
    }

    if (currentValue.users) {
      accumulator.users = (accumulator.users) ? [...accumulator.users, ...currentValue.users] : [...currentValue.users]
    }

    if (currentValue.places) {
      accumulator.places = (accumulator.places) ? [...accumulator.places, ...currentValue.places] : [...currentValue.places]
    }

    if (currentValue.media) {
      accumulator.media = (accumulator.media) ? [...accumulator.media, ...currentValue.media] : [...currentValue.media]
    }

    if (currentValue.polls) {
      accumulator.polls = (accumulator.polls) ? [...accumulator.polls, ...currentValue.polls] : [...currentValue.polls]
    }
    return accumulator
  })

  return getCollectionsFromTweetInludes(pass)
}

// Export
export { getCollectionsFromTweetInludesArray }
