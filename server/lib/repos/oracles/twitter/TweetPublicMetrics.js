"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../constants");
const Entity_1 = __importDefault(require("../../../Entity"));
const Utils_1 = require("../../../Utils");
const SEP = Utils_1.getSeperator();
const PUBLIC_METRICS_ID_PREFIX = (constants_1.constants.TWITTER_PUBLIC_METRICS_ID_PREFIX) ? constants_1.constants.TWITTER_PUBLIC_METRICS_ID_PREFIX : '';
const PUBLIC_METRICS_MULTIPLIER = (constants_1.constants.TWITTER_PUBLIC_METRICS_VAL_MULTIPLIER) ? constants_1.constants.TWITTER_PUBLIC_METRICS_VAL_MULTIPLIER : 1;
/**
 * @todo look into using JSON mapping technique https://cloudmark.github.io/Json-Mapping/ for mapping JSON to Objects
 */
class TweetPublicMetrics extends Entity_1.default {
    /**
     * constructor
     *
     * @constructor
     * @param id {string}
     */
    constructor(id) {
        super(PUBLIC_METRICS_ID_PREFIX, id);
        this._includeCollectionNode = true;
        this._data = new Map();
        this._icon = process.env.TWITTER_PUBLIC_METRICS_ICON_URL;
        /**
         * _getGraphDataFromMetrics
         *
         * @private
         * @returns {IGraphData}
         */
        this._getGraphDataFromMetrics = (targetNodeID) => {
            const nodes = [];
            const links = [];
            if (this._data.size) {
                for (let [metricType, metricValue] of this._data.entries()) {
                    const nodeID = targetNodeID + SEP + PUBLIC_METRICS_ID_PREFIX + SEP + metricType;
                    const normalizedVal = Utils_1.normalize(metricValue, 1000, 0);
                    const nodeVal = Math.max(normalizedVal * PUBLIC_METRICS_MULTIPLIER, 5);
                    const label = Utils_1.formatLabel(metricType + ' = ' + metricValue);
                    nodes.push(Utils_1.createNode(nodeID, label, nodeVal, '', '', PUBLIC_METRICS_ID_PREFIX, 1));
                    // Link tweet to Icon node
                    links.push(Utils_1.createLink(nodeID, this.getID(), label));
                }
            }
            return Utils_1.createGraphDataObject(nodes, links);
        };
        /**
         * getGraphData
         *
         * @param stargetNodeID {string}
         * @returns {IGraphData}
         */
        this.getGraphData = (targetNodeID) => {
            let graphData = Utils_1.createGraphDataObject();
            // Check if should add group root node
            if (this._includeCollectionNode) {
                // Add main base tweet entities group node
                graphData.nodes.push(this.getNode());
                // If root link exists then add to graph data
                if (targetNodeID) {
                    graphData.links.push(this.getLink(targetNodeID));
                }
            }
            if (this._data.size) {
                graphData = Utils_1.mergeGraphData(graphData, this._getGraphDataFromMetrics(this.getID()));
            }
            return graphData;
        };
    }
    /**
     * getLabel
     *
     * @returns {string}
     */
    getLabel() {
        return constants_1.constants.TWITTER_PUBLIC_METRICS_LABEL;
    }
    /**
     * getMetricByType
     *
     * @param type {string}
     * @returns {number | undefined}
     */
    getMetricValueByType(type) {
        return this._data.get(type);
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
     * loadData
     *
     * @param {ITweetPublicMetricsData} data
     * @returns {TweetPublicMetrics}
     */
    loadData(data) {
        // parse object data into map
        Object.entries(data).map(([metricType, metricValue]) => {
            this._data.set(metricType, metricValue);
        });
        return this;
    }
}
exports.default = TweetPublicMetrics;
//# sourceMappingURL=TweetPublicMetrics.js.map