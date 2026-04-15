"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../constants");
const Utils_1 = require("../../../Utils");
const Entity_1 = __importDefault(require("../../../Entity"));
const TweetEntitiesCollection_1 = __importDefault(require("./TweetEntitiesCollection"));
/**
 * UserEntities
 *
 * @class
 * @extends {Entity}
 */
class UserEntities extends Entity_1.default {
    /**
     * constructor
     *
     * @constructor
     * @param data {IUserEntitiesData}
     * @param id {string | undefined}
  
     */
    constructor(data, id) {
        super(constants_1.constants.TWITTER_ENTITY_ID_PREFIX, id);
        if (data.url) {
            this.loadData(data.url);
        }
        if (data.description) {
            this._description = new TweetEntitiesCollection_1.default(this._getEntitiesID()).loadData(data.description);
        }
    }
    /**
     * _getEntitiesID
     *
     * @private
     * @returns {string}
     */
    _getEntitiesID() {
        return this.getID() + constants_1.constants.SEP + constants_1.constants.TWITTER_TWEET_ENTITIES_LABEL_PREFIX;
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
     * getGraphData
     *
     * @param targetNodeID {string}
     * @returns {IGraphData}
     */
    getGraphData(targetNodeID) {
        let graphData = Utils_1.createGraphDataObject();
        // Add main base tweet entities group node
        graphData.nodes.push(this.getNode());
        // If root link exists then add to graph data
        if (targetNodeID) {
            graphData.links.push(this.getLink(targetNodeID));
        }
        // Url entities
        if (this._urls) {
            graphData = Utils_1.mergeGraphData(graphData, this._urls.getGraphData(this.getID()));
        }
        // Description entities
        if (this._description) {
            graphData = Utils_1.mergeGraphData(graphData, this._description.getGraphData(this.getID()));
        }
        return graphData;
    }
    /**
     * loadData
     *
     * @param entitiesData {ITweetEntitiesData}
     * @returns {UserEntities}
     * @todo fix lint issues
     */
    loadData(data) {
        // let index = 0
        // console.log('UserEntities | loadData() | entitiesData = ', data)
        // for (const type of Object.keys(data)) {
        //   for (let [entityType, entityData] of Object.entries(data)) {
        //     this[`_${entityType}`] = new EntityTypeCollection(entityType, this.getID() + constants.SEP + index).loadData( entityData ) 
        //     ++index
        //   }
        // }
        return this;
    }
}
exports.default = UserEntities;
//# sourceMappingURL=UserEntities.js.map