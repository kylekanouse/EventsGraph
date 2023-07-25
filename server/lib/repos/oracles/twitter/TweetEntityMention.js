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
 * TweetEntityMention
 *
 * @description main class to handle Twitter Mention Enetity objects
 * @class
 * @extends {Entity}
 */
class TweetEntityMention extends TweetEntity_1.default {
    /**
     * constructor
     *
     * @param data {ITweetEntityMentionData}
     * @param id {string | undefined}
     */
    constructor(data, id) {
        // Call base class constructor with type ID
        super(data, constants_1.constants.TWITTER_ENTITIES_MENTIONS_ID, id);
        // Extract values from data object
        this._username = (typeof data === 'object' && data.username) ? data.username : '';
    }
    /**
     * getLabel
     *
     * @returns {string}
     */
    getLabel() {
        return (this._username) ? `@${this._username}` : '';
    }
    getUrl() {
        return (this._username) ? TwitterUtils_1.buildMentionUrl(this._username) : '';
    }
    /**
     * getNode
     *
     */
    getNode() {
        // Return translated EventGraph Node object
        return Utils_1.createNode(this.getID(), this.getLabel(), undefined, '', '', this.getType(), 1, this.getUrl());
    }
}
exports.default = TweetEntityMention;
//# sourceMappingURL=TweetEntityMention.js.map