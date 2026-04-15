"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../constants");
const Utils_1 = require("../../../Utils");
const TweetEntity_1 = __importDefault(require("./TweetEntity"));
/**
 * TweetEntityURL
 *
 * @description main class to handle Twitter URL Enetity objects
 * @class
 * @extends {TweetEntity}
 */
class TweetEntityURL extends TweetEntity_1.default {
    /**
     * constructor
     *
     * @param data {ITweetEntityUrlData}
     * @param id {string | undefined}
     */
    constructor(data, id) {
        // Call base class constructor with type ID
        super(data, constants_1.constants.TWITTER_ENTITIES_URLS_ID, id);
        // Extract values from data object
        this._url = data.url;
        this._expandedURL = data.expanded_url;
        this._displayURL = data.display_url;
        this._images = (typeof data === 'object' && data.images) ? data.images : [];
    }
    /**
     * getImageIconURL
     *
     * @returns {string}
     */
    getImageIconURL() {
        return (this._images && this._images.length) ? this._images[1].url : '';
    }
    /**
     * getLabel
     *
     * @returns {string}
     */
    getLabel() {
        return (this._displayURL) ? this._displayURL : '';
    }
    getUrl() {
        return (this._expandedURL) ? this._expandedURL : '';
    }
    /**
     * getNode
     *
     */
    getNode() {
        // Return translated EventGraph Node object
        return Utils_1.createNode(this.getID(), this.getLabel(), undefined, undefined, this.getImageIconURL(), this.getType(), 2, this.getUrl());
    }
}
exports.default = TweetEntityURL;
//# sourceMappingURL=TweetEntityURL.js.map