"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../constants");
const Utils_1 = require("../../../Utils");
const TweetEntityHashtag_1 = __importDefault(require("./TweetEntityHashtag"));
const TweetEntityMention_1 = __importDefault(require("./TweetEntityMention"));
const TweetEntityAnnotation_1 = __importDefault(require("./TweetEntityAnnotation"));
const TweetEntityURL_1 = __importDefault(require("./TweetEntityURL"));
const TweetEntityCashtag_1 = __importDefault(require("./TweetEntityCashtag"));
const EntityCollection_1 = __importDefault(require("../../../EntityCollection"));
const SEP = Utils_1.getSeperator();
const ENTITY_NODE_GROUP_VALUE = constants_1.constants.TWITTER_ENTITY_NODE_GROUP_VALUE;
const ENTITY_ID_PREFIX = constants_1.constants.TWITTER_ENTITY_ID_PREFIX;
const PUBLIC_METRICS_ICON_URL = process.env.TWITTER_PUBLIC_METRICS_ICON_URL;
const ANNOTATIONS_ICON_URL = process.env.TWITTER_ANNOTATIONS_ICON_URL;
const URL_ICON_URL = process.env.TWITTER_URLS_ICON_URL;
const HASHTAG_ICON_URL = process.env.TWITTER_HASHTAGS_ICON_URL;
const MENTIONS_ICON_URL = process.env.TWITTER_MENTIONS_ICON_URL;
const CASHTAGS_ICON_URL = process.env.TWITTER_ENTITY_CASHTAG_ICON_URL;
/**
 * TweetEntityTypeCollection
 *
 * @description Main class for handling Tweet entities
 * @class
 */
class TweetEntityTypeCollection extends EntityCollection_1.default {
    /**
     * constructor
     *
     * @param type {string}
     */
    constructor(type, id, includeCollectionNode = true, icon) {
        super(type, id, includeCollectionNode, icon ? icon : PUBLIC_METRICS_ICON_URL);
        /**
         * collectionAssociationType
         *
         * @type {CollectionAssociation}
         */
        this.collectionAssociationType = "central";
        /**
         * _collection
         *
         * @type {Map<string, TweetEntity>}
         */
        this._collection = new Map();
    }
    /**
     * getSubCollectionByIDs
     *
     * @param collectionID
     * @param ids
     * @returns
     */
    getSubCollectionByIDs(collectionID, ids) {
        return new TweetEntityTypeCollection(collectionID, this.getID())
            .loadObjects(Array
            .from(this._collection.values())
            .filter((data, index) => { ids.includes(this.getEntityID(index)); }));
    }
    /**
     * getID
     *
     * @returns {string}
     */
    // public getID(): string {
    //   return this._id + SEP + this.getType()
    // }
    /**
     *
     * @param index
     * @returns
     */
    getEntityID(index) {
        return this.getID() + SEP + index.toString();
    }
    /**
     * getGroupValue
     *
     * @returns {number}
     */
    getGroupValue() {
        return (ENTITY_NODE_GROUP_VALUE) ? ENTITY_NODE_GROUP_VALUE : 0;
    }
    /**
     * getLabel
     *
     * @returns {string}
     */
    getLabel() {
        return this.getType();
    }
    /**
     * getNode
     *
     * @returns {IGraphNode}
     */
    getNode() {
        return Utils_1.createNode(this.getID(), this.getLabel(), 10, '', this.getIcon(), '', this.getGroupValue());
    }
    /**
     * loadData
     *
     * @param data {ITweetEntityData[]}
     * @returns {TweetEntityTypeCollection}
     */
    loadData(data) {
        // Loop through all entities and load data into objects
        data.map((entityData, index) => {
            // Get index
            const itemID = this.getEntityID(index);
            let entity;
            // Switch based on Tweet Entity Type
            switch (this.getType()) {
                case constants_1.constants.TWITTER_ENTITIES_HASHTAGS_ID: // Hashtags
                    this._icon = HASHTAG_ICON_URL;
                    entity = new TweetEntityHashtag_1.default(entityData, itemID);
                    break;
                case constants_1.constants.TWITTER_ENTITIES_MENTIONS_ID: // Mentions
                    this._icon = MENTIONS_ICON_URL;
                    entity = new TweetEntityMention_1.default(entityData, itemID);
                    break;
                case constants_1.constants.TWITTER_ENTITIES_ANNOTATIONS_ID: // Annotations
                    this._icon = ANNOTATIONS_ICON_URL;
                    entity = new TweetEntityAnnotation_1.default(entityData, itemID);
                    break;
                case constants_1.constants.TWITTER_ENTITIES_URLS_ID: // URLS
                    this._icon = URL_ICON_URL;
                    entity = new TweetEntityURL_1.default(entityData, itemID);
                    break;
                case constants_1.constants.TWITTER_ENTITIES_CASHTAG_ID: // Cashtags
                    this._icon = CASHTAGS_ICON_URL;
                    entity = new TweetEntityCashtag_1.default(entityData, itemID);
                default:
            }
            // Add tweet entity to map
            if (entity) {
                this._collection.set(itemID, entity);
            }
        });
        return this;
    }
    /**
     * loadObjects
     *
     * @param entities {TweetEntity[]}
     */
    loadObjects(objs) {
        objs.map((obj, index) => {
            this._collection.set(this.getEntityID(index), obj);
        });
        return this;
    }
}
exports.default = TweetEntityTypeCollection;
//# sourceMappingURL=TweetEntityTypeCollection.js.map