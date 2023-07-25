"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TweetService = void 0;
const constants_1 = require("../../../../constants");
const Utils_1 = require("../../../Utils");
const TweetCollection_1 = __importDefault(require("./TweetCollection"));
const TwitterAPI_1 = require("./TwitterAPI");
const TwitterUtils_1 = require("./TwitterUtils");
/**
 * TweetService
 *
 * @namespace
 * @todo Get rid of any graph domain concetps like IEventsGraphCollectionContextRequest
 */
var TweetService;
(function (TweetService) {
    /**
     * getTweet
     *
     * @description Main method for retrieving a single Tweet from Twitter
     * @param {any} params
     * @param {IEventsGraphCollectionContextRequest} request
     * @returns {Promise<IEventsGraphCollectionContextResponse>}
     */
    async function getTweet(id, params, request) {
        return new Promise(async (resolve, reject) => {
            try {
                // Make request through Twitter API client
                const respJSON = await TwitterAPI_1.TwitterClient.get(constants_1.constants.TWITTER_TWEET_PATH_ID + '/' + id, params);
                const data = respJSON.data;
                // Load JSON data along with reference collections into tweet collection object
                const tweetCollection = new TweetCollection_1.default(constants_1.constants.TWITTER_TWEET_COLLECTIN_ID, false);
                // Get includes ref collections
                const includesCollections = TwitterUtils_1.getCollectionsFromTweetInludes(respJSON.includes);
                if (data) {
                    tweetCollection.loadDataSingle(data, includesCollections === null || includesCollections === void 0 ? void 0 : includesCollections.refUserCollection, includesCollections === null || includesCollections === void 0 ? void 0 : includesCollections.refMediaCollection);
                }
                // Build context response object
                const resp = Utils_1.buildResponseFromEntity(tweetCollection, request);
                resolve(resp);
            }
            catch (error) {
                console.error('TweetService ERROR: error =', error);
                reject(error);
            }
        });
    }
    TweetService.getTweet = getTweet;
    /**
     * getTweets
     *
     * @description Main method for retrieving Tweets from twitter
     * @param {any} params
     * @param {IEventsGraphCollectionContextRequest} request
     * @returns {Promise<IEventsGraphCollectionContextResponse>}
     */
    async function getTweets(path, params, request) {
        return new Promise(async (resolve, reject) => {
            try {
                const collectionID = constants_1.constants.TWITTER_TWEET_COLLECTIN_ID + constants_1.constants.SEP + Date.now();
                // Make request through Twitter API client
                const respJSON = await TwitterAPI_1.TwitterClient.get(path, params);
                const data = respJSON.data;
                console.log('TweetService | respJSON.data = ', respJSON.data);
                // Load JSON data along with reference collections into tweet collection object
                const tweetCollection = new TweetCollection_1.default(collectionID);
                // Get includes ref collections
                const includesCollections = TwitterUtils_1.getCollectionsFromTweetInludes(respJSON.includes);
                if (data) {
                    tweetCollection.loadData(data, includesCollections === null || includesCollections === void 0 ? void 0 : includesCollections.refUserCollection, includesCollections === null || includesCollections === void 0 ? void 0 : includesCollections.refMediaCollection);
                }
                // Build context response object
                const resp = Utils_1.buildResponseFromEntity(tweetCollection, request);
                resolve(resp);
            }
            catch (error) {
                console.error('TweetService ERROR: error =', error);
                reject(error);
            }
        });
    }
    TweetService.getTweets = getTweets;
    /**
     * listenToStream
     *
     * @param {IUpdateGraphDataCallback} cb
     * @param {IEventsGraphCollectionContextRequest} request
     */
    function listenToStream(params, request, cb, sampleSize = undefined) {
        let count = 1;
        let tweetData = [];
        let includesData = [];
        try {
            TwitterUtils_1.listenForever(() => TwitterAPI_1.TwitterClient.stream(constants_1.constants.TWITTER_FILTERED_STREAM_PATH_ID, params), (respJSON, stream) => {
                console.log('STREAM | --------- respJSON = ', respJSON);
                if (respJSON.data) {
                    tweetData.push(respJSON.data);
                }
                if (respJSON.includes) {
                    includesData.push(respJSON.includes);
                }
                if (sampleSize == undefined || count >= sampleSize) {
                    const collectionID = constants_1.constants.TWITTER_TWEET_COLLECTIN_ID + constants_1.constants.SEP + Date.now();
                    const data = tweetData;
                    const tweetCollection = new TweetCollection_1.default(collectionID, false);
                    const includesCollections = TwitterUtils_1.getCollectionsFromTweetInludesArray(includesData);
                    // load data into collection if present
                    if (data) {
                        tweetCollection.loadData(data, includesCollections === null || includesCollections === void 0 ? void 0 : includesCollections.refUserCollection, includesCollections === null || includesCollections === void 0 ? void 0 : includesCollections.refMediaCollection);
                    }
                    // Package data in a response object
                    const resp = Utils_1.buildResponseFromEntity(tweetCollection, request);
                    // Close Stream
                    if (sampleSize) {
                        stream.close();
                    }
                    // Return data through callback
                    cb(null, resp);
                }
                else {
                    // Get progress amount
                    const progress = (count / sampleSize);
                    // Get progress update response
                    const resp = Utils_1.buildProgressResponse(progress, request);
                    // Increment the count
                    ++count;
                    // Send response
                    cb(null, resp);
                }
                // cb(null)
            });
        }
        catch (err) {
            cb(new Error(err));
        }
    }
    TweetService.listenToStream = listenToStream;
})(TweetService = exports.TweetService || (exports.TweetService = {}));
//# sourceMappingURL=TweetService.js.map