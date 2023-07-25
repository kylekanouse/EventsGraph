import Oracle from './Oracle'
import { constants } from '../../../constants'
import CTweetLookup from './twitter/contexts/ContextTweetLookup'
import CTweetsLookup from './twitter/contexts/ContextTweetsLookup'
import CSearchTweets from './twitter/contexts/ContextSearchTweets'
import CUserLookup from './twitter/contexts/ContextUserLookup'
import CFilteredStream from './twitter/contexts/ContextFilteredStream'

/**
 * TwitterOracle
 *
 * @description Main entry point to access Twitter data
 * @type class
 */

class Twitter extends Oracle {

  /**
   * Constructor
   *
   * @constructor
   */

  constructor() {
    super(constants.TWITTER_COLLECTION_ID, [CTweetLookup, CTweetsLookup, CSearchTweets, CUserLookup, CFilteredStream])
  }
}

// EXPORT
export default new Twitter()