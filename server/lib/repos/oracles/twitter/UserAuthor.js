"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("./User"));
/**
 * UserAuthor
 *
 * @description wrapper object for dealing with a tweet user as a creator of tweets
 * @class
 * @extends {User}
 */
class UserAuthor extends User_1.default {
    constructor() {
        super(...arguments);
        /**
         * setTweets
         *
         * @param tweets {TweetCollection}
         * @returns {UserAuthor}
         */
        this.setTweets = (tweets) => {
            this._tweets = tweets;
            return this;
        };
    }
}
exports.default = UserAuthor;
//# sourceMappingURL=UserAuthor.js.map