"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../constants");
const Utils_1 = require("../../../Utils");
const Entity_1 = __importDefault(require("../../../Entity"));
const TweetEntitiesCollection_1 = __importDefault(require("./TweetEntitiesCollection"));
const TweetPublicMetrics_1 = __importDefault(require("./TweetPublicMetrics"));
const TweetContextAnnotationCollection_1 = __importDefault(require("./TweetContextAnnotationCollection"));
const TweetSource_1 = __importDefault(require("./TweetSource"));
const TwitterUtils_1 = require("./TwitterUtils");
const TWITTER_LOGO = process.env.TWITTER_LOGO_URL;
/**
 * Tweet
 *
 * @class
 * @extends {Entity}
 */
class Tweet extends Entity_1.default {
    /**
     * constructor
     *
     * @param data {ITweetData | undefined}
     */
    constructor(data) {
        // Call parent constructor
        super(constants_1.constants.TWITTER_TWEET_TYPE_ID, data === null || data === void 0 ? void 0 : data.id);
        this._icon = TWITTER_LOGO;
        this._group = 1;
        /**
         * loadData
         *
         * @param data {ITweetData}
         * @returns {Tweet}
         */
        this.loadData = (data) => {
            // Store data
            this._data = data;
            this._id = this._data.id;
            // Load Entities
            if (this._data.entities) {
                this._tweetEntities = new TweetEntitiesCollection_1.default(this._getEntitiesID()).loadData(this._data.entities);
            }
            // Load Public metrics
            if (this._data.public_metrics) {
                this._publicMetrics = new TweetPublicMetrics_1.default(this._getPublicMetricsID()).loadData(this._data.public_metrics);
            }
            // Load Context Annotations
            if (this._data.context_annotations) {
                this._contextAnnotations = new TweetContextAnnotationCollection_1.default(this._data.context_annotations, this._getContextAnnotationsID());
            }
            // Load source
            if (this._data.source) {
                this._source = new TweetSource_1.default(this._data.source, this._getTweetSourceID());
            }
            return this;
        };
        /**
         * setAuthor
         *
         * @param author {UserAuthor}
         * @returns {Tweet}
         */
        this.setAuthor = (author) => {
            this._author = author;
            return this;
        };
        /**
         * grtAuthor
         *
         * @returns {UserAuthor | undefined}
         */
        this.getAuthor = () => {
            return this._author;
        };
        /**
         * getAuthorID
         *
         * @returns {string | undefined}
         */
        this.getAuthorID = () => {
            return (this._data) ? this._data.author_id : undefined;
        };
        /**
         * setMediaCollection
         *
         * @param mediaCollection {MediaColleciton}
         * @returns {Tweet}
         */
        this.setMediaCollection = (mediaCollection) => {
            this._mediaCollection = mediaCollection;
            return this;
        };
        /**
         * getMediaCollection
         *
         * @returns {MediaCollection}
         */
        this.getMediaCollection = () => {
            return this._mediaCollection;
        };
        /**
         * getMediaAttchmentIDs
         *
         * @returns {string[]}
         */
        this.getMediaAttchmentIDs = () => {
            return (this._data && this._data.attachments && this._data.attachments.media_keys) ? this._data.attachments.media_keys : [];
        };
        // load tweet data
        if (data) {
            this.loadData(data);
        }
    }
    /**
     * _getEntitiesID
     *
     * @private
     * @returns {string}
     */
    _getEntitiesID() {
        return this.getID() + constants_1.constants.SEP + constants_1.constants.TWITTER_ENTITIES_ID_PREFIX;
    }
    _getPublicMetricsID() {
        return this.getID() + constants_1.constants.SEP + constants_1.constants.TWITTER_PUBLIC_METRICS_ID_PREFIX;
    }
    _getContextAnnotationsID() {
        return this.getID() + constants_1.constants.SEP + constants_1.constants.TWITTER_TWEET_CONTEXT_ANNOTATION_ID;
    }
    _getTweetTextID() {
        return this.getID() + constants_1.constants.SEP + 'text';
    }
    _getTweetSourceID() {
        return this.getID() + constants_1.constants.SEP + 'source';
    }
    _createTweetTextNode() {
        return Utils_1.createNode(this._getTweetTextID(), this.getLabel(), 2, this.getText(), '', this.getType(), this.getGroup(), this.url);
    }
    _createTweetTextLink() {
        return Utils_1.createLink(this.getID(), this._getTweetTextID(), this.getText());
    }
    _getTweetUrl() {
        const authorID = this.getAuthorID();
        let url = '';
        if (authorID) {
            url = TwitterUtils_1.buildTweetUrl(this._id, authorID);
        }
        return url;
    }
    /**
     * url
     */
    get url() {
        return this._getTweetUrl();
    }
    /**
     * getLabel
     *
     * @returns {string}
     */
    getLabel() {
        return '';
    }
    getText() {
        return (this._data && this._data.text) ? this._data.text : '';
    }
    getGroup() {
        return (this._group) ? this._group : 0;
    }
    /**
     * getType
     *
     * @returns {string}
     */
    getType() {
        return constants_1.constants.TWITTER_TWEET_TYPE_ID;
    }
    /**
     * getNode
     *
     * @returns {IGraphNode}
     */
    getNode() {
        return Utils_1.createNode(this.getID(), '', 10, this.getText(), this.getIcon(), this.getType(), this.getGroup(), this.url);
    }
    /**
     * getGraphData
     *
     * @param targetNodeID {string}
     * @returns {IGraphData}
     */
    getGraphData(targetNodeID) {
        // Create empty object to populate graph data
        let graphData = Utils_1.createGraphDataObject();
        // Add main base tweet node
        graphData.nodes.push(this.getNode());
        // Check if root link is present and if so add graph data
        if (targetNodeID) {
            graphData.links.push(this.getLink(targetNodeID));
        }
        else {
            // Create tweet text node
            graphData.nodes.push(this._createTweetTextNode());
            graphData.links.push(this._createTweetTextLink());
        }
        // Get entities
        if (this._tweetEntities) {
            graphData = Utils_1.mergeGraphData(graphData, this._tweetEntities.getGraphData(this.getID()));
        }
        // Get Public Metrics
        if (this._publicMetrics) {
            graphData = Utils_1.mergeGraphData(graphData, this._publicMetrics.getGraphData(this.getID()));
        }
        // Get Context Annotations
        if (this._contextAnnotations) {
            graphData = Utils_1.mergeGraphData(graphData, this._contextAnnotations.getGraphData(this.getID()));
        }
        // Get Author User
        if (this._author) {
            graphData = Utils_1.mergeGraphData(graphData, this._author.getGraphData(this.getID()));
        }
        // Get source
        if (this._source) {
            graphData = Utils_1.mergeGraphData(graphData, this._source.getGraphData(this.getID()));
        }
        // Media Attachments
        if (this._mediaCollection) {
            graphData = Utils_1.mergeGraphData(graphData, this._mediaCollection.getGraphData(this.getID()));
        }
        return graphData;
    }
}
exports.default = Tweet;
//# sourceMappingURL=Tweet.js.map