"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterClient = void 0;
const twitter_v2_1 = __importDefault(require("twitter-v2"));
/**
 * TwitterClient
 *
 * @description Main object to interface with Twitter V2 API
 * @constant
 */
const TwitterClient = new twitter_v2_1.default({
    // consumer_key: process.env.TWITTER_CONSUMER_KEY,
    // consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    // access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    // access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    bearer_token: (process.env.TWITTER_BEARER_TOKEN) ? process.env.TWITTER_BEARER_TOKEN : '',
});
exports.TwitterClient = TwitterClient;
//# sourceMappingURL=TwitterAPI.js.map