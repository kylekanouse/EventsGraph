"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Entity_1 = __importDefault(require("./Entity"));
const Utils_1 = require("./Utils");
/**
 * EntityCollection
 *
 * @abstract
 * @class
 */
class EntityCollection extends Entity_1.default {
    /**
     * constructor
     *
     * @constructor
     * @param {string} type
     * @param id {string}
     * @param {boolean} includeCollectionNode
     */
    constructor(type, id, includeCollectionNode = true, icon) {
        super(type, id, icon);
        /**
         * collection
         *
         * @description A collection of Entity objects
         * @type {Map<string, Entity>}
         */
        this._collection = new Map();
        /**
         * getCollectionItemByID
         *
         * @param id {string}
         * @returns {Entity | undefined}
         */
        this.getCollectionItemByID = (id) => {
            return this.getCollection().get(id);
        };
        this._includeCollectionNode = includeCollectionNode;
    }
    /**
     * getCollection
     *
     * @returns {Map<string, Tweet>}
     */
    getCollection() {
        return this._collection;
    }
    /**
     * getID()
     *
     * @returns {string}
     */
    getID() {
        return (this._includeCollectionNode) ? super.getID() : (this._collection.values().next().value) ? this._collection.values().next().value.getID() : '';
    }
    /**
     * getGraphData
     *
     * @param targetNodeID {string}
     * @returns {IGraphData}
     */
    getGraphData(targetNodeID) {
        // Create empty object to populate graph data
        let graphData = Utils_1.createGraphDataObject();
        // Add main base tweet node
        if (this._includeCollectionNode && this.collectionAssociationType !== "none") {
            // Add collection node
            graphData.nodes.push(this.getNode());
            // add target link
            if (targetNodeID) {
                graphData.links.push(this.getLink(targetNodeID));
            }
            // Make collection node the target node for rest of the collection items
            targetNodeID = this.getID();
        }
        // Merge in tweet graph data to collection graph data
        if (this._collection.size) {
            Array
                .from(this._collection.values())
                .map((entitiy) => {
                // Add entity data to graphdata
                graphData = Utils_1.mergeGraphData(graphData, entitiy.getGraphData(targetNodeID));
                // Get target node ID for next entity
                targetNodeID = Utils_1.getNextTargetNodeID(this, entitiy, this.collectionAssociationType);
            });
        }
        return graphData;
    }
}
exports.default = EntityCollection;
//# sourceMappingURL=EntityCollection.js.map