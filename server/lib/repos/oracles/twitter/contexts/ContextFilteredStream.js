"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../../constants");
const Context_1 = require("../../../Context");
const TweetService_1 = require("../TweetService");
/**
 * ERROR_NO_STREAM_REQUEST
 *
 * @constant
 * @type {string}
 */
const ERROR_NO_STREAM_REQUEST = 'Data for this context is only able to be accessed through a stream';
/**
 * ContextFilteredStream
 *
 * @description context for grabbing filtered stream tweets and updating rules
 * @class
 * @extends {Context}
 */
class ContextFilteredStream extends Context_1.Context {
    constructor() {
        /**
         * _id
         *
         * @description ID for context
         * @protected
         * @type {string}
         */
        super(...arguments);
        this._id = constants_1.constants.TWITTER_FILTERED_STREAM_CONTEXT_ID;
    }
    // protected _rules: StreamRuleCollection = new StreamRuleCollection()
    /**
     * _buildRequestParameters
     *
     * @param request {IEventsGraphCollectionContextRequest}
     * @returns {LooseObject}
     */
    _buildRequestParameters(collectionRequest) {
        var _a;
        console.log('ConextFilteredStream | _buildRequestParameters()');
        const sampleSize = (_a = collectionRequest.params) === null || _a === void 0 ? void 0 : _a.sampleSize;
        const request = this._parseContextRequest(collectionRequest);
        // Populate default field values
        const defaultParams = new Map();
        if (process.env.TWITTER_KEY_VALUE_EXPANSIONS && process.env.DEFAULT_VALUE_FILTERED_STREAM_EXPANSIONS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_EXPANSIONS, process.env.DEFAULT_VALUE_FILTERED_STREAM_EXPANSIONS);
        }
        if (process.env.TWITTER_KEY_VALUE_TWEET_FIELDS && process.env.DEFAULT_VALUE_FILTERED_STREAM_TWEETS_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_TWEET_FIELDS, process.env.DEFAULT_VALUE_FILTERED_STREAM_TWEETS_FIELDS);
        }
        if (process.env.TWITTER_KEY_VALUE_USER_FIELDS && process.env.DEFAULT_VALUE_FILTERED_STREAM_USER_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_USER_FIELDS, process.env.DEFAULT_VALUE_FILTERED_STREAM_USER_FIELDS);
        }
        if (process.env.TWITTER_KEY_VALUE_MEDIA_FIELDS && process.env.DEFAULT_VALUE_FILTERED_STREAM_MEDIA_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_MEDIA_FIELDS, process.env.DEFAULT_VALUE_FILTERED_STREAM_MEDIA_FIELDS);
        }
        if (process.env.TWITTER_KEY_VALUE_PLACE_FIELDS && process.env.DEFAULT_VALUE_FILTERED_STREAM_PLACE_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_PLACE_FIELDS, process.env.DEFAULT_VALUE_FILTERED_STREAM_PLACE_FIELDS);
        }
        if (process.env.TWITTER_KEY_VALUE_POLL_FIELDS && process.env.DEFAULT_VALUE_FILTERED_STREAM_POLL_FIELDS) {
            defaultParams.set(process.env.TWITTER_KEY_VALUE_POLL_FIELDS, process.env.DEFAULT_VALUE_FILTERED_STREAM_POLL_FIELDS);
        }
        const params = { ...Object.fromEntries(defaultParams.entries()), ...request.params };
        // Merge default values with requested parameters
        return { request, params, sampleSize };
    }
    /**
     * _parseResponse
     *
     * @returns {IFilteredStreamParams}
     */
    _parseContextRequest(request) {
        const params = request.params;
        // console.log('ConextFilteredStream | params = ', params)
        // delete highjacked namespace
        delete request.params.rules;
        delete request.params.sampleSize;
        return { request, params };
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
    isStreamable() {
        return true;
    }
    /**
     * getData
     *
     * @description get data from context
     * @param request {IEventsGraphCollectionContextRequest}
     * @returns {Promise<IEventsGraphCollectionContextResponse>}
     */
    async getData(request) {
        return new Promise(async (resolve, reject) => {
            reject(ERROR_NO_STREAM_REQUEST);
        });
    }
    /**
     * getDataStream
     *
     * @param {IEventsGraphCollectionContextRequest} request
     * @param {IUpdateGraphDataCallback} cb
     * @todo REMOVE: reference to IUpdateGraphDataCallback as is graph domain and add twitter domain update callback interface
     */
    getDataStream(r, cb) {
        console.log('getDataStream | r = ', r);
        const { request, params, sampleSize } = this._buildRequestParameters(r);
        const newRules = params.rules;
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
            }
            catch (error) {
                console.error(error);
            }
        }
        try {
            TweetService_1.TweetService.listenToStream(params, request, cb, sampleSize);
        }
        catch (error) {
            console.log('ERROR: Twitter client error msg = ', error);
            cb(error);
        }
    }
}
// Export
exports.default = new ContextFilteredStream();
//# sourceMappingURL=ContextFilteredStream.js.map