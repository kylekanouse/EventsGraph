"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../constants");
const Utils_1 = require("../../../Utils");
const PublicMetrics_1 = require("./PublicMetrics");
const SEP = Utils_1.getSeperator();
const PUBLIC_METRICS_ID_PREFIX = constants_1.constants.TWITTER_PUBLIC_METRICS_ID_PREFIX;
const PUBLIC_METRICS_MULTIPLIER = constants_1.constants.TWITTER_PUBLIC_METRICS_VAL_MULTIPLIER;
/**
 * MediaPublicMetrics
 *
 * @class
 * @extends {PublicMetrics}
 */
class MediaPublicMetrics extends PublicMetrics_1.PublicMetrics {
    /**
     * constructor
     *
     * @constructor
     * @param data {IMediaPublicMetricsData}
     * @param id {string}
     * @param sourceNodeID {string}
     */
    constructor(data, id) {
        super(PUBLIC_METRICS_ID_PREFIX, id);
        this._includeCollectionNode = true;
        this._collection = new Map();
        this._icon = process.env.TWITTER_PUBLIC_METRICS_ICON_URL;
        /**
         * _getGraphDataFromMetrics
         *
         * @private
         * @param {string} targetNodeID
         * @returns {IGraphData}
         */
        this._getGraphDataFromMetrics = (targetNodeID) => {
            const nodes = [];
            const links = [];
            if (this._collection.size) {
                for (const [metricName, metricValue] of this._collection.entries()) {
                    const nodeID = targetNodeID + SEP + PUBLIC_METRICS_ID_PREFIX + SEP + metricName;
                    const normalizedVal = Utils_1.normalize(metricValue, 1000, 0);
                    const val = normalizedVal * PUBLIC_METRICS_MULTIPLIER;
                    const label = Utils_1.formatLabel(metricName + ' = ' + metricValue);
                    nodes.push(Utils_1.createNode(nodeID, label, val, metricName, '', PUBLIC_METRICS_ID_PREFIX, 1));
                    // Link tweet to Icon node
                    links.push(Utils_1.createLink(nodeID, targetNodeID, label));
                }
            }
            return Utils_1.createGraphDataObject(nodes, links);
        };
        /**
         * getLabel
         *
         * @returns {string}
         */
        this.getLabel = () => {
            return constants_1.constants.TWITTER_PUBLIC_METRICS_LABEL;
        };
        /**
         * getNode
         *
         * @returns {IGraphNode}
         */
        this.getNode = () => {
            return Utils_1.createNode(this.getID(), '', 5, '', this.getIcon(), '', 0);
        };
        /**
         * getGraphData
         *
         * @param targetNodeID {string}
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
            if (this._collection.size) {
                graphData = Utils_1.mergeGraphData(graphData, this._getGraphDataFromMetrics(this.getID()));
            }
            return graphData;
        };
        for (const [key, value] of Object.entries(data)) {
            this._collection.set(key, value);
        }
    }
}
exports.default = MediaPublicMetrics;
//# sourceMappingURL=MediaPublicMetrics.js.map