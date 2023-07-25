"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../../../Utils");
const Tweet_1 = __importDefault(require("./Tweet"));
const constants_1 = require("../../../../constants");
const EntityCollection_1 = __importDefault(require("../../../EntityCollection"));
const COLLECTION_TYPE_ID = constants_1.constants.TWITTER_TWEET_COLLECTIN_ID;
/**
 * TweetCollection
 *
 * @description used as an entity container for dealing with a collection of Tweets
 * @class
 * @implements {IEntityCollection}
 */
class TweetCollection extends EntityCollection_1.default {
    /**
     * constructor
     *
     * @constructor
     * @param id {string}
     * @param {boolean} includeCollectionNode
     */
    constructor(id, includeCollectionNode = true) {
        super(COLLECTION_TYPE_ID, id, includeCollectionNode);
        /**
         * collectionAssociationType
         *
         * @type {CollectionAssociation}
         */
        this.collectionAssociationType = "central";
        /**
         * collection
         *
         * @description A collection of Tweet objects
         * @type {Map<string, Tweet>}
         */
        this._collection = new Map();
        /**
         * icon
         *
         * @type {string | undefined}
         */
        this._icon = process.env.TWITTER_TWEET_COLLECTION_ICON_URL;
        /**
         * loadDataSingle
         *
         * @param data
         * @param refUsers
         * @param refMedia
         * @returns
         */
        this.loadDataSingle = (data, refUsers, refMedia) => {
            return this.loadData(Array.of(data), refUsers, refMedia);
        };
    }
    /**
     * _loadCollectionItem
     *
     * @param data {ITweetData}
     * @param index {number}
     * @param sourceNodeID {string}
     * @param refUsers {UserCollection}
     * @returns {Tweet}
     */
    _loadCollectionItem(itemData, index, refUsers, refMediaCollection) {
        // Create Tweet object from data
        const tweet = new Tweet_1.default(itemData);
        // Setup Author User
        const authorID = tweet.getAuthorID();
        // Check if author is in reference users
        if (authorID && refUsers) {
            const authorUser = refUsers.getCollectionItemByID(authorID);
            if (authorUser) {
                tweet.setAuthor(authorUser);
            }
        }
        // Get media attachments
        const mediaAttachmentIDs = tweet.getMediaAttchmentIDs();
        if (mediaAttachmentIDs.length && refMediaCollection) {
            const collectionID = tweet.getID() + constants_1.constants.SEP + constants_1.constants.TWITTER_MEDIA_ENTITY_ID_PREFIX;
            tweet.setMediaCollection(refMediaCollection.getSubCollectionByIDs(collectionID, mediaAttachmentIDs));
        }
        // Add to collection
        this._collection.set(tweet.getID(), tweet);
        return tweet;
    }
    /**
     * getSubCollectionByIDs
     *
     * @param subCollectionID {string}
     * @param ids {string[]}
     * @returns {TweetCollection}
     */
    getSubCollectionByIDs(subCollectionID, ids) {
        return new TweetCollection(subCollectionID)
            .loadObjects(Array
            .from(this._collection.values())
            .filter((item) => ids.includes(item.getID())));
    }
    /**
     * getLabel
     *
     * @returns {string}
     */
    getLabel() {
        return constants_1.constants.TWITTER_TWEET_COLLECTIN_LABEL_PREFIX + ': ' + this.getID();
    }
    /**
     * getNode
     *
     * @returns {IGraphNode}
     */
    getNode() {
        return Utils_1.createNode(this.getID(), '', this._collection.size, '', this.getIcon(), '', 0);
    }
    /**
     * loadData
     *
     * @param data {ITweetData[]}
     * @param refUsers {UserCollection}
     * @returns {TweetCollection | ITweetData}
     */
    loadData(data, refUsers, refMedia) {
        // Loop through data to wrap in Tweet objects
        data.map((tweetData, index) => {
            // Load collection item data
            const tweet = this._loadCollectionItem(tweetData, index, refUsers, refMedia);
        });
        return this;
    }
    /**
     * loadObjects
     *
     * @param obj {Tweet[]}
     * @returns {TweetCollection}
     */
    loadObjects(objs) {
        objs.map((obj, index) => {
            this._collection.set(obj.getID(), obj);
        });
        return this;
    }
}
exports.default = TweetCollection;
//# sourceMappingURL=TweetCollection.js.map