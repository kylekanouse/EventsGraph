"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Oracle_1 = __importDefault(require("./Oracle"));
const constants_1 = require("../../../constants");
const ContextTweetLookup_1 = __importDefault(require("./twitter/contexts/ContextTweetLookup"));
const ContextTweetsLookup_1 = __importDefault(require("./twitter/contexts/ContextTweetsLookup"));
const ContextSearchTweets_1 = __importDefault(require("./twitter/contexts/ContextSearchTweets"));
const ContextUserLookup_1 = __importDefault(require("./twitter/contexts/ContextUserLookup"));
const ContextFilteredStream_1 = __importDefault(require("./twitter/contexts/ContextFilteredStream"));
/**
 * TwitterOracle
 *
 * @description Main entry point to access Twitter data
 * @type class
 */
class Twitter extends Oracle_1.default {
    /**
     * Constructor
     *
     * @constructor
     */
    constructor() {
        super(constants_1.constants.TWITTER_COLLECTION_ID, [ContextTweetLookup_1.default, ContextTweetsLookup_1.default, ContextSearchTweets_1.default, ContextUserLookup_1.default, ContextFilteredStream_1.default]);
    }
}
// EXPORT
exports.default = new Twitter();
//# sourceMappingURL=Twitter.js.map