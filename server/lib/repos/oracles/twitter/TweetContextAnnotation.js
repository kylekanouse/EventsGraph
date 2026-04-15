"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../constants");
const Entity_1 = __importDefault(require("../../../Entity"));
const Utils_1 = require("../../../Utils");
const SEP = constants_1.constants.SEP;
/**
 * TweetContextAnnotation
 *
 * @class
 * @extends {Entity}
 */
class TweetContextAnnotation extends Entity_1.default {
    /**
     * constructor
     *
     * @param {ITweetEntityAnnotationData} data
     * @param {string} id
     */
    constructor(data, id) {
        // Call base class constructor with type ID
        super(constants_1.constants.TWITTER_TWEET_CONTEXT_ANNOTATION_ID, id);
        this._icon = process.env.TWITTER_TWEET_CONTEXT_ANNOTATION_ICON_URL;
        /**
         * getLabel
         *
         * @returns {string}
         */
        this.getLabel = () => {
            const description = (this._entity && this._entity.description) ? this._entity.description : undefined;
            let label = '';
            if (this._domain && this._domain.name) {
                label = label.concat(this._domain.name);
                if (this._entity && this._entity.name) {
                    label = label.concat(` : ${this._entity.name}`);
                }
                if (description) {
                    label = label.concat(` ${SEP} ${Utils_1.transform(description, 20)}`);
                }
            }
            else if (description) {
                label = label.concat(Utils_1.transform(description, 20));
            }
            return label;
        };
        /**
         * getNode
         *
         * @returns {IGraphNode}
         */
        this.getNode = () => {
            // Return translated EventGraph Node object
            return Utils_1.createNode(this.getID(), this.getLabel(), 5, this.getLabel(), '', this.getType(), 1);
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
            return graphData;
        };
        // Extract values from data object
        this._domain = (typeof data === 'object' && data.domain) ? data.domain : undefined;
        this._entity = (typeof data === 'object' && data.entity) ? data.entity : undefined;
    }
}
exports.default = TweetContextAnnotation;
//# sourceMappingURL=TweetContextAnnotation.js.map