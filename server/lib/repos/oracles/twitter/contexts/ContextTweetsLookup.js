"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../../constants");
const Context_1 = require("../../../Context");
const TweetService_1 = require("../TweetService");
/**
 * ContextTweetLookup
 *
 * @description main context for dealing with a single or multiple tweet
 * @class
 */
class ContextTweetsLookup extends Context_1.Context {
    constructor() {
        /**
         * _id
         *
         * @description ID for context
         * @protected
         * @type {string}
         */
        super(...arguments);
        this._id = constants_1.constants.TWITTER_TWEETS_LOOKUP_CONTEXT_ID;
    }
    /**
     * _buildRequestParameters
     *
     * @param request {IEventsGraphCollectionContextRequest}
     * @returns {LooseObject}
     */
    _buildRequestParameters(request) {
        // Populate default field values
        const defaultParams = new Map();
        if (process.env.TWITTER_KEY_VALUE_TWEET_FIELDS && process.env.DEFAULT_VALUE_TWEETS_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_TWEET_FIELDS, process.env.DEFAULT_VALUE_TWEETS_FIELDS);
        }
        if (process.env.TWITTER_KEY_VALUE_EXPANSIONS && process.env.DEFAULT_VALUE_TWEETS_EXPANSIONS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_EXPANSIONS, process.env.DEFAULT_VALUE_TWEETS_EXPANSIONS);
        }
        if (process.env.TWITTER_KEY_VALUE_USER_FIELDS && process.env.DEFAULT_VALUE_TWEETS_USER_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_USER_FIELDS, process.env.DEFAULT_VALUE_TWEETS_USER_FIELDS);
        }
        if (process.env.TWITTER_KEY_VALUE_MEDIA_FIELDS && process.env.DEFAULT_VALUE_TWEETS_MEDIA_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_MEDIA_FIELDS, process.env.DEFAULT_VALUE_TWEETS_MEDIA_FIELDS);
        }
        if (process.env.TWITTER_KEY_VALUE_PLACE_FIELDS && process.env.DEFAULT_VALUE_TWEETS_PLACE_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_PLACE_FIELDS, process.env.DEFAULT_VALUE_TWEETS_PLACE_FIELDS);
        }
        if (process.env.TWITTER_KEY_VALUE_POLL_FIELDS && process.env.DEFAULT_VALUE_TWEETS_POLL_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_POLL_FIELDS, process.env.DEFAULT_VALUE_TWEETS_POLL_FIELDS);
        }
        // Merge default values with requested parameters
        return { ...Object.fromEntries(defaultParams.entries()), ...request.params };
    }
    /**
     * isStreamable
     *
     * @returns {boolean}
     */
    isStreamable() {
        return false;
    }
    /**
     * getData
     *
     * @description execute action
     * @param request {IEventsGraphCollectionContextRequest}
     * @returns {Promise<IEventsGraphCollectionContextResponse>}
     */
    async getData(request) {
        return TweetService_1.TweetService.getTweets(constants_1.constants.TWITTER_TWEET_PATH_ID, this._buildRequestParameters(request), request);
    }
    /**
     * getDataStream
     *
     * @param {IEventsGraphCollectionContextRequest} request
     * @param {IUpdateGraphDataCallback} cb
     */
    getDataStream(request, cb) {
        cb(new Error('Stream not available'));
    }
    /**
     * getDataStreamSample
     *
     * @param {IEventsGraphCollectionContextRequest} request
     * @returns {Promise<IEventsGraphCollectionContextResponse>}
     */
    async getDataStreamSample(request) {
        return new Promise(async (resolve, reject) => {
            reject('Context does not support stream sample');
        });
    }
}
// Export
exports.default = new ContextTweetsLookup();
//# sourceMappingURL=ContextTweetsLookup.js.map