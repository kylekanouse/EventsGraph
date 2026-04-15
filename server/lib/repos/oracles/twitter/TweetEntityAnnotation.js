"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../constants");
const Utils_1 = require("../../../Utils");
const TweetEntity_1 = __importDefault(require("./TweetEntity"));
const DEFAULT_TWEET_ENTITY_ANNOTATION_LABEL = 'Tweet Entity Annotation';
/**
 * TweetEntityAnnotation
 *
 * @description main class to handle Twitter Annotation Enetity objects
 * @class
 * @extends {TweetEntity}
 */
class TweetEntityAnnotation extends TweetEntity_1.default {
    /**
     * constructor
     *
     * @param data {ITweetEntityAnnotationData}
     * @param id {string}
  
     */
    constructor(data, id) {
        // Call base class constructor with type ID
        super(data, constants_1.constants.TWITTER_ENTITIES_ANNOTATIONS_ID, id);
        // Extract values from data object
        this._probability = (typeof data === 'object' && data.probability) ? data.probability : 2;
        this._annotationType = (typeof data === 'object' && data.type) ? data.type : undefined;
        this._normalizedText = (typeof data === 'object' && data.normalized_text) ? data.normalized_text : undefined;
    }
    /**
     * getLabel
     *
     * @returns {string}
     */
    getLabel() {
        return (this._annotationType) ? this._annotationType + ((this._normalizedText) ? ': ' + this._normalizedText : '') : DEFAULT_TWEET_ENTITY_ANNOTATION_LABEL;
    }
    /**
     * getNode
     *
     */
    getNode() {
        // Return translated EventGraph Node object
        return Utils_1.createNode(this.getID(), '', this._probability * 3, this.getLabel(), '', this.getType(), 1);
    }
}
exports.default = TweetEntityAnnotation;
//# sourceMappingURL=TweetEntityAnnotation.js.map