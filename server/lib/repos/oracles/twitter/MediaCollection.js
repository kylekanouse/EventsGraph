"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../../../Utils");
const constants_1 = require("../../../../constants");
const Media_1 = __importDefault(require("./Media"));
const EntityCollection_1 = __importDefault(require("../../../EntityCollection"));
const COLLECTION_TYPE_ID = constants_1.constants.TWITTER_MEDIA_ENTITY_ID_PREFIX;
/**
 * MediaCollection
 *
 * @description used as an entity container for dealing with a collection of Tweets
 * @class
 * @extends {Entity}
 * @implements {IEntityCollection}
 */
class MediaCollection extends EntityCollection_1.default {
    /**
     * constructor
     *
     * @constructor
     * @param id {string}
     * @param sourceNodeID {string}
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
         * _collection
         *
         * @type {Map<string, Media>}
         */
        this._collection = new Map();
        /**
         * icon
         *
         * @type {string | undefined}
         */
        this._icon = process.env.TWITTER_TWEET_MEDIA_ICON_URL;
    }
    /**
     * _loadCollectionItem
     *
     * @param data {IMediaData}
     * @param index {number}
     * @param sourceNodeID {string}
     * @param refUsers {UserCollection}
     * @returns {Tweet}
     */
    _loadCollectionItem(itemData) {
        // Create Tweet object from data
        const media = new Media_1.default(itemData);
        // Add to collection
        this._collection.set(media.getID(), media);
        return media;
    }
    /**
     * getSubCollectionByIDs
     *
     * @param collectionID
     * @param ids
     * @returns
     */
    getSubCollectionByIDs(collectionID, ids) {
        return new MediaCollection(collectionID)
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
        return constants_1.constants.TWITTER_MEDIA_ENTITY_LABEL_PREFIX;
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
     * @param data {IMediaData[]}
     * @returns {TweetCollection}
     */
    loadData(data) {
        // Loop through data to wrap in Tweet objects
        data.map((mediaData, index) => {
            // Load collection item data
            this._loadCollectionItem(mediaData);
        });
        return this;
    }
    /**
     * loadObjects
     *
     * @param obj {Media[]}
     * @returns {MediaCollection}
     */
    loadObjects(objs) {
        objs.map((obj, index) => {
            this._collection.set(obj.getID(), obj);
        });
        return this;
    }
}
exports.default = MediaCollection;
//# sourceMappingURL=MediaCollection.js.map