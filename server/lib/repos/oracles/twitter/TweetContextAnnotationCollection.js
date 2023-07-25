"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../constants");
const Entity_1 = __importDefault(require("../../../Entity"));
const Utils_1 = require("../../../Utils");
const TweetContextAnnotation_1 = __importDefault(require("./TweetContextAnnotation"));
/**
 * TweetContextAnnotationCollection
 *
 * @class
 * @extends {Entity}
 */
class TweetContextAnnotationCollection extends Entity_1.default {
    /**
     * constructor
     *
     * @param data {ITweetContextAnnotationData}
     * @param id {string}
     * @param sourceNodeID {string}
     */
    constructor(data, id) {
        // Call base class constructor with type ID
        super(constants_1.constants.TWITTER_TWEET_CONTEXT_ANNOTATION_ID, id);
        this._collection = new Map();
        this._icon = process.env.TWITTER_TWEET_CONTEXT_ANNOTATION_ICON_URL;
        /**
         * _getAnnotationIDs
         *
         * @param index {number}
         * @returns {string}
         */
        this._getAnnotationID = (index) => {
            return this.getID() + constants_1.constants.SEP + index.toString();
        };
        /**
         * getLabel
         *
         * @returns {string}
         */
        this.getLabel = () => {
            return constants_1.constants.TWITTER_TWEET_CONTEXT_ANNOTATIONS_LABEL;
        };
        /**
         * getNode
         *
         * @returns {IGraphNode}
         */
        this.getNode = () => {
            // Return translated EventGraph Node object
            return Utils_1.createNode(this.getID(), this.getLabel(), 5, this.getLabel(), this.getIcon(), this.getType(), 1);
        };
        /**
         * getGraphData
         *
         * @param {string} targetNodeID
         * @returns {IGraphData}
         */
        this.getGraphData = (targetNodeID) => {
            let graphData = Utils_1.createGraphDataObject();
            graphData.nodes.push(this.getNode());
            if (targetNodeID) {
                graphData.links.push(this.getLink(targetNodeID));
            }
            // Add collections data to graph data
            Array
                .from(this._collection.values())
                .map((item) => {
                graphData = Utils_1.mergeGraphData(graphData, item.getGraphData(this.getID()));
            });
            return graphData;
        };
        // Extract values from data object
        data.map((contaxtAnnotation, index) => {
            this._collection.set(this._getAnnotationID(index), new TweetContextAnnotation_1.default(contaxtAnnotation, this._getAnnotationID(index)));
        });
    }
}
exports.default = TweetContextAnnotationCollection;
//# sourceMappingURL=TweetContextAnnotationCollection.js.map