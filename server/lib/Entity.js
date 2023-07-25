"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const Utils_1 = require("./Utils");
/**
 * Entity
 *
 * @class
 * @abstract
 * @implements {IGraphEntity}
 */
class Entity {
    /**
     * constructor
     *
     * @param type {string}
     */
    constructor(type, id, icon) {
        this._type = type;
        this._id = (id) ? id : uuid_1.v4();
        this._icon = icon;
    }
    /**
     * getType
     *
     * @returns {string}
     */
    getType() {
        return (this._type) ? this._type : '';
    }
    /**
     * getIcon
     *
     * @returns {string}
     */
    getIcon() {
        return (this._icon) ? this._icon : '';
    }
    /**
     * getID
     *
     * @returns {string}
     */
    getID() {
        return this._id;
    }
    /**
     * getRootNode
     *
     * @returns {string}
     */
    getRootNodeID() {
        return this.getID();
    }
    /**
     * getLinks
     *
     * @param sourceNodeID {string}
     * @param label {string | undefined}
     * @returns {IGraphLink}
     */
    getLink(targetNodeID, label, value) {
        // Use current sourceNodeID unless overrided by parameter
        label = label ? label : this.getLabel();
        // Return translated EventGraph Link Object
        return Utils_1.createLink(this.getID(), targetNodeID, label, value);
    }
    /**
     * getGraphData
     *
     * @param {string} targetNodeID
     * @returns {IGraphData}
     */
    getGraphData(targetNodeID) {
        let graphData = Utils_1.createGraphDataObject();
        graphData.nodes.push(this.getNode());
        if (targetNodeID) {
            graphData.links.push(this.getLink(targetNodeID));
        }
        return graphData;
    }
    /**
     * getEventData
     *
     * @returns {IEventData}
     */
    getEventData() {
        return Utils_1.createEventData();
    }
}
exports.default = Entity;
//# sourceMappingURL=Entity.js.map