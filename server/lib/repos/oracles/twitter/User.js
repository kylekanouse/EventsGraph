"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../constants");
const Utils_1 = require("../../../Utils");
const UserPublicMetrics_1 = __importDefault(require("./UserPublicMetrics"));
const Entity_1 = __importDefault(require("../../../Entity"));
const UserEntities_1 = __importDefault(require("./UserEntities"));
/**
 * TwitterUser
 *
 * @class
 * @implements {IGraphEntity}
 */
class User extends Entity_1.default {
    /**
     * constructor
     *
     * @param data {IUserData}
  
     */
    constructor(data) {
        // Call parent constructor
        super(constants_1.constants.TWITTER_USER_ID_PREFIX, data.id);
        // Extract values from JSON data object
        this._name = data.name;
        this._username = data.username;
        this._description = data.description;
        this._created_at = data.created_at;
        this._pinned_tweet_id = data.pinned_tweet_id;
        this._profile_image_url = data.profile_image_url;
        this._protected = data.protected;
        this._url = data.url;
        this._verified = data.verified;
        this._publicMetrics = (typeof data === 'object' && data.public_metrics) ? new UserPublicMetrics_1.default(data.public_metrics, this.getPublicMetricsID()) : undefined;
        this._entities = (typeof data === 'object' && data.entities) ? new UserEntities_1.default(data.entities, this.getEntitiesID()) : undefined;
    }
    /**
     * getLabel
     *
     * @returns {string}
     */
    getLabel() {
        return (this.getUsername() !== undefined) ? Utils_1.formatLabel(`@${this.getUsername()}`) : '';
    }
    /**
     * getIcon
     *
     * @returns {string}
     */
    getIcon() {
        return (this._profile_image_url) ? this._profile_image_url : '';
    }
    /**
     * getUsername
     *
     * @returns {string}
     */
    getUsername() {
        return (this._username) ? this._username : '';
    }
    /**
     * getPublicMetrics
     *
     * @returns {UserPublicMetrics}
     */
    getPublicMetrics() {
        return this._publicMetrics;
    }
    getPublicMetricsID() {
        return this.getID() + constants_1.constants.SEP + constants_1.constants.TWITTER_PUBLIC_METRICS_ID_PREFIX;
    }
    getEntitiesID() {
        return this.getID() + constants_1.constants.SEP + constants_1.constants.TWITTER_ENTITIES_ID_PREFIX;
    }
    /**
    * getNode
    *
    * @returns {IGraphNode}
    */
    getNode() {
        return Utils_1.createNode(this.getID(), this.getLabel(), 1, '', this.getIcon(), this.getType());
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
        // Add main base node
        graphData.nodes.push(this.getNode());
        // Check if root link is present and if so add graph data
        if (targetNodeID) {
            graphData.links.push(this.getLink(targetNodeID));
        }
        // Get public metrics
        if (this._publicMetrics) {
            graphData = Utils_1.mergeGraphData(graphData, this._publicMetrics.getGraphData(this.getID()));
        }
        // Get entities data
        if (this._entities) {
            graphData = Utils_1.mergeGraphData(graphData, this._entities.getGraphData(this.getID()));
        }
        return graphData;
    }
}
exports.default = User;
//# sourceMappingURL=User.js.map