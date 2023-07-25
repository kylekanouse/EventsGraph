import TweetCollection from "./TweetCollection";
import User from "./User";

/**
 * UserAuthor
 *
 * @description wrapper object for dealing with a tweet user as a creator of tweets
 * @class
 * @extends {User}
 */

export default class UserAuthor extends User {

  protected _tweets: TweetCollection | undefined

  /**
   * setTweets
   *
   * @param tweets {TweetCollection}
   * @returns {UserAuthor}
   */

  public setTweets = (tweets: TweetCollection): UserAuthor => {
    this._tweets = tweets
    return this
  } 
}