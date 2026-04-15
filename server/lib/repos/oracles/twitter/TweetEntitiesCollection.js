"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../constants");
const Utils_1 = require("../../../Utils");
const TweetEntityTypeCollection_1 = __importDefault(require("./TweetEntityTypeCollection"));
const EntityCollection_1 = __importDefault(require("../../../EntityCollection"));
/**
 * TweetEntities
 *
 * @class
 * @extends {Entity}
 */
class TweetEntitiesCollection extends EntityCollection_1.default {
    /**
     * constructor
     *
     * @constructor
     * @param {string} id
     * @param {boolean} includeCollectionNode
     */
    constructor(id, includeCollectionNode = true) {
        super(constants_1.constants.TWITTER_ENTITY_ID_PREFIX, id, includeCollectionNode);
        /**
         * collectionAssociationType
         *
         * @type {CollectionAssociation}
         */
        this.collectionAssociationType = "central";
        this._collection = new Map();
    }
    /**
     * _getEntityCollectionID
     *
     * @param {string} type
     * @returns
     */
    _getEntityCollectionID(type) {
        return this.getID() + constants_1.constants.SEP + type;
    }
    /**
     * getLabel
     *
     * @returns {string}
     */
    getLabel() {
        return constants_1.constants.TWITTER_TWEET_ENTITIES_LABEL_PREFIX;
    }
    /**
     * getNode
     *
     * @returns {IGraphNode}
     */
    getNode() {
        return Utils_1.createNode(this.getID(), '', 5, '', this.getIcon(), '', 0);
    }
    /**
     * getSubCollectionByIDs
     *
     * @param collectionID {string}
     * @param ids {string[]}
     * @returns {TweetEntitiesCollection}
     */
    getSubCollectionByIDs(collectionID, ids) {
        return new TweetEntitiesCollection(collectionID)
            .loadObjects(Array
            .from(this._collection.values())
            .filter((item) => ids.includes(item.getID())));
    }
    /**
     * loadData
     *
     * @param {ITweetEntitiesData} entitiesData
     * @returns {TweetEntitiesCollection}
     */
    loadData(entitiesData) {
        for (const [type, data] of Object.entries(entitiesData)) {
            this._collection.set(type, new TweetEntityTypeCollection_1.default(type, this._getEntityCollectionID(type)).loadData(data));
        }
        return this;
    }
    /**
     * loadObjects
     *
     * @param {EntityTypeCollection[]} entities
     * @returns {TweetEntitiesCollection}
     */
    loadObjects(objs) {
        objs.map((obj, index) => {
            this._collection.set(obj.getID(), obj);
        });
        return this;
    }
}
exports.default = TweetEntitiesCollection;
//# sourceMappingURL=TweetEntitiesCollection.js.map