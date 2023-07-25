"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../../constants");
const Context_1 = require("../../../Context");
const UserService_1 = require("../UserService");
/**
 * ContextUserLookup
 *
 * @class
 * @implements {IEventsGraphCollectionContext}
 */
class ContextUserLookup extends Context_1.Context {
    constructor() {
        /**
         * _id
         *
         * @description ID for context
         * @protected
         * @type {string}
         */
        super(...arguments);
        this._id = constants_1.constants.TWITTER_USER_LOOKUP_CONTEXT_ID;
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
        if (process.env.TWITTER_KEY_VALUE_TWEET_FIELDS && process.env.DEFAULT_VALUE_USER_TWEET_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_TWEET_FIELDS, process.env.DEFAULT_VALUE_USER_TWEET_FIELDS);
        }
        if (process.env.TWITTER_KEY_VALUE_EXPANSIONS && process.env.DEFAULT_VALUE_USER_EXPANSIONS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_EXPANSIONS, process.env.DEFAULT_VALUE_USER_EXPANSIONS);
        }
        if (process.env.TWITTER_KEY_VALUE_USER_FIELDS && process.env.DEFAULT_VALUE_USER_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_USER_FIELDS, process.env.DEFAULT_VALUE_USER_FIELDS);
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
        return true;
    }
    /**
     * callAction
     *
     * @description execute action
     * @param request {IEventsGraphCollectionContextRequest}
     * @returns {Promise<IEventsGraphCollectionContextResponse>}
     */
    async getData(request) {
        return UserService_1.UserService.getUsersBy(this._buildRequestParameters(request), request);
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
exports.default = new ContextUserLookup();
//# sourceMappingURL=ContextUserLookup.js.map