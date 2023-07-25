"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollectionsFromTweetInludesArray = exports.getCollectionsFromTweetInludes = exports.listenForever = exports.getUserIDsMap = exports.createGraphDataFromEntities = exports.createGraphDataFromEntitiesData = exports.createPublicMetricsLink = exports.createPublicMetricsNode = exports.createGraphDataFromPublicMetrics = exports.createNodeFromTweet = exports.buildCashtagUrl = exports.buildHashtagUrl = exports.buildMentionUrl = exports.buildTweetUrl = void 0;
const Utils_1 = require("../../../Utils");
const constants_1 = require("../../../../constants");
const TweetEntityTypeCollection_1 = __importDefault(require("./TweetEntityTypeCollection"));
const MediaCollection_1 = __importDefault(require("./MediaCollection"));
const UserCollection_1 = __importDefault(require("./UserCollection"));
// Setup constants
const SEP = (constants_1.constants.SEP) ? constants_1.constants.SEP : '-', TwitterLogo = (process.env.TWITTER_LOGO_URL) ? process.env.TWITTER_LOGO_URL : '', PUBLIC_METRICS_ID_PREFIX = (constants_1.constants.TWITTER_PUBLIC_METRICS_ID_PREFIX) ? constants_1.constants.TWITTER_PUBLIC_METRICS_ID_PREFIX : '', PUBLIC_METRICS_MULTIPLIER = (constants_1.constants.TWITTER_PUBLIC_METRICS_VAL_MULTIPLIER) ? constants_1.constants.TWITTER_PUBLIC_METRICS_VAL_MULTIPLIER : 10, PUBLIC_METRICS_ICON_URL = (process.env.TWITTER_PUBLIC_METRICS_ICON_URL) ? process.env.TWITTER_PUBLIC_METRICS_ICON_URL : '', MAX_RETRIES_FOR_STREAM = 3, TWEET_URL_PATTERN = constants_1.constants.TWITTER_TWEET_URL_PATTERN, HASHTAG_SEARCH_URL_PATTERN = constants_1.constants.TWITTER_HASHTAG_SEARCH_URL_PATTERN, CASHTAG_SEARCH_URL_PATTERN = constants_1.constants.TWITTER_CASHTAG_SEARCH_URL_PATTERN, TWITTER_BASE_URL = constants_1.constants.TWITTER_BASE_URL;
/**
 * buildTweetUrl
 *
 * @param id
 * @param authorID
 * @returns
 */
const buildTweetUrl = (id, authorID) => {
    return (authorID) ? TWITTER_BASE_URL + TWEET_URL_PATTERN.replace('{ID}', id).replace('{AUTHOR_ID}', authorID) : '';
};
exports.buildTweetUrl = buildTweetUrl;
/**
 * buildMentionUrl
 *
 * @param username
 * @returns
 */
const buildMentionUrl = (username) => {
    return TWITTER_BASE_URL + username;
};
exports.buildMentionUrl = buildMentionUrl;
/**
 * buildHashtagUrl
 *
 * @param hashtag
 * @returns
 */
const buildHashtagUrl = (hashtag) => {
    return TWITTER_BASE_URL + HASHTAG_SEARCH_URL_PATTERN.replace('{HASHTAG}', hashtag);
};
exports.buildHashtagUrl = buildHashtagUrl;
/**
 * buildCashtagUrl
 *
 * @param cashtag
 * @returns
 */
const buildCashtagUrl = (cashtag) => {
    return TWITTER_BASE_URL + CASHTAG_SEARCH_URL_PATTERN.replace('{HASHTAG}', cashtag);
};
exports.buildCashtagUrl = buildCashtagUrl;
/**
 * createNodeFromTweet
 *
 * @param tweet {ITweetData}
 * @constant
 * @returns {IGraphNode}
 */
const createNodeFromTweet = (tweet) => {
    // Return new EventsGraph graph data node
    return Utils_1.createNode(tweet.id, tweet.text, 10, tweet.text, TwitterLogo, tweet.source, 1, buildTweetUrl(tweet.id, tweet.author_id));
};
exports.createNodeFromTweet = createNodeFromTweet;
/**
 * createGraphDataFromPublicMetrics
 *
 * @param sourceNodeID {string}
 * @param publicMetrics {any}
 * @returns {IGraphData}
 */
const createGraphDataFromPublicMetrics = (sourceNodeID, publicMetrics) => {
    const nodes = [];
    const links = [];
    if (publicMetrics) {
        for (const metric of Object.keys(publicMetrics)) {
            const nodeID = sourceNodeID + SEP + PUBLIC_METRICS_ID_PREFIX + SEP + metric;
            const normalizedVal = Utils_1.normalize(publicMetrics[metric], 1000, 0);
            const val = normalizedVal * PUBLIC_METRICS_MULTIPLIER;
            nodes.push(Utils_1.createNode(nodeID, metric, val, metric, '', PUBLIC_METRICS_ID_PREFIX, 1));
            // Link tweet to Icon node
            links.push(Utils_1.createLink(sourceNodeID, nodeID, PUBLIC_METRICS_ID_PREFIX + SEP + metric + ' = ' + publicMetrics[metric]));
        }
    }
    return Utils_1.createGraphDataObject(nodes, links);
};
exports.createGraphDataFromPublicMetrics = createGraphDataFromPublicMetrics;
/**
 * createPublicMetricsNode
 *
 * @param tweet {ITweetData}
 * @returns {IGraphNode}
 */
const createPublicMetricsNode = (tweet) => {
    return Utils_1.createNode(constants_1.constants.TWITTER_PUBLIC_METRICS_ID_PREFIX + constants_1.constants.SEP + tweet.id, constants_1.constants.TWITTER_PUBLIC_METRICS_LABEL, undefined, undefined, PUBLIC_METRICS_ICON_URL, constants_1.constants.TWITTER_PUBLIC_METRICS_ID_PREFIX, 1);
};
exports.createPublicMetricsNode = createPublicMetricsNode;
/**
 * createPublicMetricsLink
 *
 * @param tweet {ITweetData}
 * @returns {IGraphLink}
 */
const createPublicMetricsLink = (tweet) => {
    return Utils_1.createLink(tweet.id, constants_1.constants.TWITTER_PUBLIC_METRICS_ID_PREFIX + constants_1.constants.SEP + tweet.id, constants_1.constants.TWITTER_PUBLIC_METRICS_LABEL, undefined);
};
exports.createPublicMetricsLink = createPublicMetricsLink;
/**
 * createGraphDataFromEntitiesData
 *
 * @param entities {any}
 * @param sourceNodeID {string}
 * @constant
 * @returns {IGraphData}
 */
const createGraphDataFromEntitiesData = (entities, sourceNodeID) => {
    let graphData = Utils_1.createGraphDataObject();
    if (entities) {
        // Loop through all entities to collect nodes and links
        for (const type of Object.keys(entities)) {
            // Load collection to handle multiple entities of a given type
            const cGraphData = new TweetEntityTypeCollection_1.default(type, sourceNodeID)
                .loadData(entities[type])
                .getGraphData();
            // Append into main graphData object
            graphData = Utils_1.mergeGraphData(graphData, cGraphData);
        }
    }
    return graphData;
};
exports.createGraphDataFromEntitiesData = createGraphDataFromEntitiesData;
/**
 * createGraphDataFromEntities
 *
 * @param entities {EntityTypeCollection[]}
 * @param sourceNodeID {string}
 * @returns {IGraphData}
 */
const createGraphDataFromEntities = (entities, sourceNodeID) => {
    let nodes = [];
    let links = [];
    if (entities) {
        entities.map((collection) => {
            // Get graph data from each collection
            const graphData = collection.getGraphData();
            // Append to node and link arrays
            nodes = nodes.concat(graphData.nodes);
            links = links.concat(graphData.links);
        });
    }
    // Return as Graph Data object
    return Utils_1.createGraphDataObject(nodes, links);
};
exports.createGraphDataFromEntities = createGraphDataFromEntities;
/**
 * getUserIDsMap
 *
 * @param users {User[]}
 * @returns {Map<string, number>}
 */
const getUserIDsMap = (users) => {
    return users.reduce((map, user, index) => map.set(user.getID(), index), new Map());
};
exports.getUserIDsMap = getUserIDsMap;
let retryCount = 0;
/**
 * listenForever
 *
 * @description funciton used to setup a long lasting connection to a twitter stream
 * @param streamFactory
 * @param dataConsumer
 */
const listenForever = async (streamFactory, dataConsumer) => {
    // console.log('[STREAM] ============ listenForever() ')
    try {
        const stream = streamFactory();
        // console.log('[STREAM] ============ stream = ', stream)
        for await (const data of stream) {
            // console.log('[STREAM] ============ receiving data ', data)
            dataConsumer(data, stream);
        }
        // The stream has been closed by Twitter. It is usually safe to reconnect.
        // console.log('[STREAM] ============ Stream disconnected healthily. Reconnecting.')
        // listenForever(streamFactory, dataConsumer)
    }
    catch (error) {
        // An error occurred so we reconnect to the stream. Note that we should
        // probably have retry logic here to prevent reconnection after a number of
        // closely timed failures (may indicate a problem that is not downstream).
        console.warn('[STREAM] ============ Stream disconnected with error. Retrying.', error);
        if (retryCount < MAX_RETRIES_FOR_STREAM) {
            ++retryCount;
            listenForever(streamFactory, dataConsumer);
        }
        else {
            throw new Error(error);
        }
    }
};
exports.listenForever = listenForever;
/**
 * getCollectionsFromTweetInludes
 *
 * @param {IIncludesData} includes
 * @returns {IIncludesCollections}
 */
const getCollectionsFromTweetInludes = (includes) => {
    let refUserCollection;
    let refMediaCollection;
    // Parse response JSON data for reference collections first before tweet
    if (includes) {
        refUserCollection = (includes.users) ? new UserCollection_1.default(constants_1.constants.TWITTER_USER_COLLECTIN_ID).loadData(includes.users) : undefined;
        refMediaCollection = (includes.media) ? new MediaCollection_1.default(constants_1.constants.TWITTER_MEDIA_COLLECTION_ID).loadData(includes.media) : undefined;
    }
    return {
        refUserCollection: refUserCollection,
        refMediaCollection: refMediaCollection
    };
};
exports.getCollectionsFromTweetInludes = getCollectionsFromTweetInludes;
/**
 * getCollectionsFromTweetInludesArray
 *
 * @param includes
 * @returns
 */
const getCollectionsFromTweetInludesArray = (includes) => {
    const pass = includes.reduce((accumulator, currentValue) => {
        if (currentValue.tweets) {
            accumulator.tweets = (accumulator.tweets) ? [...accumulator.tweets, ...currentValue.tweets] : [...currentValue.tweets];
        }
        if (currentValue.users) {
            accumulator.users = (accumulator.users) ? [...accumulator.users, ...currentValue.users] : [...currentValue.users];
        }
        if (currentValue.places) {
            accumulator.places = (accumulator.places) ? [...accumulator.places, ...currentValue.places] : [...currentValue.places];
        }
        if (currentValue.media) {
            accumulator.media = (accumulator.media) ? [...accumulator.media, ...currentValue.media] : [...currentValue.media];
        }
        if (currentValue.polls) {
            accumulator.polls = (accumulator.polls) ? [...accumulator.polls, ...currentValue.polls] : [...currentValue.polls];
        }
        return accumulator;
    });
    return getCollectionsFromTweetInludes(pass);
};
exports.getCollectionsFromTweetInludesArray = getCollectionsFromTweetInludesArray;
//# sourceMappingURL=TwitterUtils.js.map