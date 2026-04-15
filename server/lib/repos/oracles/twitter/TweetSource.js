"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../constants");
const Entity_1 = __importDefault(require("../../../Entity"));
const Utils_1 = require("../../../Utils");
/**
 * @todo ADD: environment external parameter defaults to AppContants and populate if not present instead of leaving "undefined"
 */
// Pull in envrionment and App constants
const TWITTER_AD_SOURCE_ICON = process.env.TWITTER_TWEET_AD_SOURCE_ICON_URL;
const TWITTER_SOURCE_IPHONE_ICON = process.env.TWITTER_TWEET_SOURCE_IPHONE_ICON_URL;
const TWITTER_SOURCE_WEB_APP_ICON = process.env.TWITTER_TWEET_SOURCE_WEB_APP_ICON_URL;
const TWITTER_SOURCE_ANDROID_ICON = process.env.TWITTER_TWEET_SOURCE_ANDROID_APP_ICON_URL;
const TWITTER_SOURCE_MEDIA_STUDIO_ICON = process.env.TWITTER_TWEET_SOURCE_MEDIA_STUDIO_ICON_URL;
const TWITTER_SOURCE_SPRINKLR_ICON = process.env.TWITTER_TWEET_SOURCE_SPRINKLR_ICON_URL;
const AD_SOURCE_VALUES = (constants_1.constants.TWITTER_TWEET_SOURCE_AD_VALUES) ? constants_1.constants.TWITTER_TWEET_SOURCE_AD_VALUES : [];
const ANDROID_SOURCE_VALUES = (constants_1.constants.TWITTER_TWEET_SOURCE_TWITTER_ANDROID_VALUES) ? constants_1.constants.TWITTER_TWEET_SOURCE_TWITTER_ANDROID_VALUES : [];
const IPHONE_SOURCE_VALUES = (constants_1.constants.TWITTER_TWEET_SOURCE_IPHONE_VALUES) ? constants_1.constants.TWITTER_TWEET_SOURCE_IPHONE_VALUES : [];
const MEDIA_STUDIO_SOURCE_VALUES = (constants_1.constants.TWITTER_TWEET_SOURCE_TWITTER_MEDIA_STUDIO_VALUES) ? constants_1.constants.TWITTER_TWEET_SOURCE_TWITTER_MEDIA_STUDIO_VALUES : [];
const SPRINKLR_SOURCE_VALUES = (constants_1.constants.TWITTER_TWEET_SOURCE_SPRINKLR_VALUES) ? constants_1.constants.TWITTER_TWEET_SOURCE_SPRINKLR_VALUES : [];
const WEB_APP_SOURCE_VALUES = (constants_1.constants.TWITTER_TWEET_SOURCE_WEB_APP_VALUES) ? constants_1.constants.TWITTER_TWEET_SOURCE_WEB_APP_VALUES : [];
/**
 * TweetSource
 *
 * @class
 * @extends {Entity}
 */
class TweetSource extends Entity_1.default {
    /**
     * constructor
     *
     * @constructor
     * @param id {string}
     */
    constructor(data, id) {
        super(constants_1.constants.TWITTER_TWEET_SOURCE_CONTEXT_ID, id);
        /**
         * _setIcon
         *
         * @param value {string}
         */
        this._setIcon = (value) => {
            if (TWITTER_AD_SOURCE_ICON && this._isAdValue(value)) {
                this._icon = TWITTER_AD_SOURCE_ICON;
            }
            else if (TWITTER_SOURCE_IPHONE_ICON && this._isIPhone(value)) {
                this._icon = TWITTER_SOURCE_IPHONE_ICON;
            }
            else if (TWITTER_SOURCE_WEB_APP_ICON && this._isWebApp(value)) {
                this._icon = TWITTER_SOURCE_WEB_APP_ICON;
            }
            else if (TWITTER_SOURCE_ANDROID_ICON && this._isAndroidApp(value)) {
                this._icon = TWITTER_SOURCE_ANDROID_ICON;
            }
            else if (TWITTER_SOURCE_MEDIA_STUDIO_ICON && this._isMediaStudio(value)) {
                this._icon = TWITTER_SOURCE_MEDIA_STUDIO_ICON;
            }
            else if (TWITTER_SOURCE_SPRINKLR_ICON && this._isSprinklr(value)) {
                this._icon = TWITTER_SOURCE_SPRINKLR_ICON;
            }
        };
        /**
         * _isAdValue
         *
         * @param value {string}
         * @returns {boolean}
         */
        this._isAdValue = (value) => {
            return AD_SOURCE_VALUES.includes(value);
        };
        this._isAndroidApp = (value) => {
            return ANDROID_SOURCE_VALUES.includes(value);
        };
        this._isIPhone = (value) => {
            return IPHONE_SOURCE_VALUES.includes(value);
        };
        this._isMediaStudio = (value) => {
            return MEDIA_STUDIO_SOURCE_VALUES.includes(value);
        };
        this._isSprinklr = (value) => {
            return SPRINKLR_SOURCE_VALUES.includes(value);
        };
        this._isWebApp = (value) => {
            return WEB_APP_SOURCE_VALUES.includes(value);
        };
        /**
         * getLabel
         *
         * @returns {string}
         */
        this.getLabel = () => {
            return constants_1.constants.TWITTER_TWEET_SOURCE_LABEL_PREFIX + ": " + this._data;
        };
        /**
         * getNode
         *
         * @returns {IGraphNode}
         */
        this.getNode = () => {
            return Utils_1.createNode(this.getID(), this.getLabel(), 2, '', this.getIcon(), '', 0);
        };
        /**
         * getGraphData
         *
         * @param targetNodeID {string}
         * @returns {IGraphData}
         */
        this.getGraphData = (targetNodeID) => {
            const nodes = [];
            const links = [];
            const node = this.getNode();
            if (node) {
                nodes.push(node);
            }
            if (targetNodeID) {
                links.push(this.getLink(targetNodeID));
            }
            return Utils_1.createGraphDataObject(nodes, links);
        };
        this._data = data;
        this._setIcon(this._data);
    }
}
exports.default = TweetSource;
//# sourceMappingURL=TweetSource.js.map