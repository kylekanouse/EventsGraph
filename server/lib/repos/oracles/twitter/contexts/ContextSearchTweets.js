"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../../constants");
const Context_1 = require("../../../Context");
const TweetService_1 = require("../TweetService");
/**
 * ContextSearchTweets
 *
 * @class
 * @extends {Context}
 */
class ContextSearchTweets extends Context_1.Context {
    constructor() {
        /**
         * _id
         *
         * @description ID for context
         * @protected
         * @type {string}
         */
        super(...arguments);
        this._id = constants_1.constants.TWITTER_TWEET_SEARCH_CONTEXT_ID;
    }
    /**
     * _buildRequestParameters
     *
     * @param request {IEventsGraphCollectionContextRequest}
     * @returns {LooseObject}
     */
    _buildRequestParameters(request) {
        var _a;
        let date = new Date();
        const timeOffset = Number(process.env.DEFAULT_VALUE_TWEET_SEARCH_END_TIME_OFFSET_VALUE), defaultParams = new Map();
        // Setup offset time into distance to search tweets
        date.setDate(date.getDate() - timeOffset);
        if (process.env.TWITTER_KEY_VALUE_TWEET_FIELDS && process.env.DEFAULT_VALUE_TWEET_SEARCH_TWEET_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_TWEET_FIELDS, process.env.DEFAULT_VALUE_TWEET_SEARCH_TWEET_FIELDS);
        }
        if (process.env.TWITTER_KEY_VALUE_EXPANSIONS && process.env.DEFAULT_VALUE_TWEET_SEARCH_EXPANSIONS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_EXPANSIONS, process.env.DEFAULT_VALUE_TWEET_SEARCH_EXPANSIONS);
        }
        if (process.env.TWITTER_KEY_VALUE_USER_FIELDS && process.env.DEFAULT_VALUE_TWEET_SEARCH_USER_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_USER_FIELDS, process.env.DEFAULT_VALUE_TWEET_SEARCH_USER_FIELDS);
        }
        if (process.env.TWITTER_KEY_VALUE_MEDIA_FIELDS && process.env.DEFAULT_VALUE_TWEET_SEARCH_MEDIA_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_MEDIA_FIELDS, process.env.DEFAULT_VALUE_TWEET_SEARCH_MEDIA_FIELDS);
        }
        if (process.env.TWITTER_KEY_VALUE_END_TIME_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_END_TIME_FIELDS, date.toISOString());
        }
        if (process.env.TWITTER_KEY_VALUE_PLACE_FIELDS && process.env.DEFAULT_VALUE_TWEET_SEARCH_PLACE_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_PLACE_FIELDS, process.env.DEFAULT_VALUE_TWEET_SEARCH_PLACE_FIELDS);
        }
        if (process.env.TWITTER_KEY_VALUE_POLL_FIELDS && process.env.DEFAULT_VALUE_TWEET_SEARCH_POLL_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_POLL_FIELDS, process.env.DEFAULT_VALUE_TWEET_SEARCH_POLL_FIELDS);
        }
        if (!((_a = request.params) === null || _a === void 0 ? void 0 : _a.max_results)
            && process.env.TWITTER_KEY_VALUE_MAX_RESULTS_FIELDS
            && process.env.DEFAULT_VALUE_TWEET_SEARCH_MAX_RESULTS_VALUE) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_MAX_RESULTS_FIELDS, process.env.DEFAULT_VALUE_TWEET_SEARCH_MAX_RESULTS_VALUE);
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
     * callAction
     *
     * @description execute action
     * @param request {IEventsGraphCollectionContextRequest}
     * @returns {Promise<IEventsGraphCollectionContextResponse>}
     */
    async getData(request) {
        return TweetService_1.TweetService.getTweets(constants_1.constants.TWITTER_TWEET_SEARCH_RECENT_PATH_ID, this._buildRequestParameters(request), request);
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
    async getDataStreamSample(request) {
        return new Promise(async (resolve, reject) => {
            reject('Context does not support stream sample');
        });
    }
}
exports.default = new ContextSearchTweets();
//# sourceMappingURL=ContextSearchTweets.js.map