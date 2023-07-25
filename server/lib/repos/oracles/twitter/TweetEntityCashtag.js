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
 * TweetEntityCashtag
 *
 * @description main class to handle Twitter Cashtag Entity objects
 * @class
 * @extends {Entity}
 */
class TweetEntityCashtag extends TweetEntity_1.default {
    /**
     * constructor
     *
     * @param data {ITweetEntityCashtagData}
     * @param sourceNodeID {string | undefined}
     */
    constructor(data, id) {
        // Call base class constructor with type ID
        super(data, constants_1.constants.TWITTER_ENTITIES_HASHTAGS_ID, id);
        // Extract values from data object
        this._cashtag = (typeof data === 'object' && data.tag) ? data.tag : '';
    }
    /**
     * getLabel
     *
     * @returns {string}
     */
    getLabel() {
        return (this._cashtag) ? Utils_1.formatLabel(`$${this._cashtag}`) : '';
    }
    /**
     * getUrl
     * @returns {string}
     */
    getUrl() {
        return TwitterUtils_1.buildCashtagUrl(this._cashtag);
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
exports.default = TweetEntityCashtag;
//# sourceMappingURL=TweetEntityCashtag.js.map