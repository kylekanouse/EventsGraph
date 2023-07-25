"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../constants");
const Utils_1 = require("../../../Utils");
const TweetEntity_1 = __importDefault(require("./TweetEntity"));
const TwitterUtils_1 = require("./TwitterUtils");
/**
 * TweetEntityHashtag
 *
 * @description main class to handle Twitter Hashtag Enetity objects
 * @class
 * @extends {Entity}
 */
class TweetEntityHashtag extends TweetEntity_1.default {
    /**
     * constructor
     *
     * @param data {ITweetEntityHashtagData}
     * @param id {string | undefined}
     */
    constructor(data, id) {
        // Call base class constructor with type ID
        super(data, constants_1.constants.TWITTER_ENTITIES_HASHTAGS_ID, id);
        // Extract values from data object
        this._hashtag = (typeof data === 'object' && data.tag) ? data.tag : '';
    }
    /**
     * getLabel
     *
     * @returns {string}
     */
    getLabel() {
        return (this._hashtag) ? `#${this._hashtag}` : '';
    }
    getUrl() {
        return TwitterUtils_1.buildHashtagUrl(this._hashtag);
    }
    /**
     * getNode
     *
     * @returns IGraphNode
     */
    getNode() {
        // Return translated EventGraph Node object
        return Utils_1.createNode(this.getID(), this.getLabel(), undefined, '', '', this.getType(), 1, this.getUrl());
    }
}
exports.default = TweetEntityHashtag;
//# sourceMappingURL=TweetEntityHashtag.js.map