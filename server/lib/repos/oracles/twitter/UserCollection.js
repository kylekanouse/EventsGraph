"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../constants");
const Utils_1 = require("../../../Utils");
const User_1 = __importDefault(require("./User"));
const EntityCollection_1 = __importDefault(require("../../../EntityCollection"));
/**
 * UserCollection
 *
 * @class
 * @extends {Entity}
 */
class UserCollection extends EntityCollection_1.default {
    /**
    * constructor
    *
    * @constructor
    * @param id {string}
    * @param {boolean} includeCollectionNode
    */
    constructor(id, includeCollectionNode = true) {
        super(constants_1.constants.TWITTER_USER_COLLECTIN_ID, id, includeCollectionNode);
        /**
         * collectionAssociationType
         *
         * @type {CollectionAssociation}
         */
        this.collectionAssociationType = "central";
        /**
         * users
         *
         * @type {User[]}
         */
        this._collection = new Map();
        /**
         * icon
         *
         * @type {string}
         */
        this._icon = process.env.TWITTER_USER_COLLECTION_ICON_URL;
    }
    /**
     * getSubCollectionByIDs
     *
     * @param {string} subCollectionID
     * @param {string[]} ids
     * @returns {UserCollection}
     */
    getSubCollectionByIDs(subCollectionID, ids) {
        return new UserCollection(subCollectionID)
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
        return constants_1.constants.TWITTER_USER_COLLECTIN_LABEL_PREFIX + ': ' + this.getID();
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
     * @param data {IUserData[]}
     * @returns {UserCollection}
     */
    loadData(data) {
        // Loop through data to wrap in Entity objects
        data.map((userData) => {
            // Create User object from data
            const user = new User_1.default(userData);
            this._collection.set(user.getID(), user);
        });
        return this;
    }
    /**
     * loadObjects
     *
     * @param obj {User[]}
     * @returns {UserCollection}
     */
    loadObjects(objs) {
        objs.map((obj) => {
            this._collection.set(obj.getID(), obj);
        });
        return this;
    }
}
exports.default = UserCollection;
//# sourceMappingURL=UserCollection.js.map