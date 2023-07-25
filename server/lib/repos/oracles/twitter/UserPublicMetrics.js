"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../constants");
const Entity_1 = __importDefault(require("../../../Entity"));
const Utils_1 = require("../../../Utils");
// Get environment vars
const USER_PUBLIC_METRICS_ICON_URL = (process.env.TWITTER_USER_PUBLIC_METRICS_ICON_URL) ? process.env.TWITTER_USER_PUBLIC_METRICS_ICON_URL : '';
const TWITTER_METRICS_NORMALIZE_MULTIPLIER = (process.env.TWITTER_METRICS_NORMALIZE_MULTIPLIER) ? parseInt(process.env.TWITTER_METRICS_NORMALIZE_MULTIPLIER) : 100;
/**
 * UserPublicMetrics
 *
 * @class
 * @extends {PublicMetrics}
 */
class UserPublicMetrics extends Entity_1.default {
    /**
     * constructor
     *
     * @param data {IUserPublicMetricsData}
     * @param id {string | undefined}
     */
    constructor(data, id) {
        // Call base class constructor with type ID
        super(constants_1.constants.TWITTER_PUBLIC_METRICS_ID_PREFIX, id);
        this._value = 0;
        this._icon = USER_PUBLIC_METRICS_ICON_URL;
        // console.log('UserPublicMEtrics | constructor | id = ', id, ' | sourceNodeID = ', sourceNodeID)
        this._metrics = data;
        this._setValue();
    }
    /**
     * _setValue
     *
     * @private
     * @returns {void}
     */
    _setValue() {
        let count = 0;
        for (let metricValue of Object.values(this._metrics)) {
            if (metricValue) {
                ++count;
            }
        }
        this._value = count;
    }
    _getMetricID(type) {
        return this.getID() + constants_1.constants.SEP + type;
    }
    /**
     * getMetric
     *
     * @param metricName {string}
     * @returns {number}
     */
    /**
     * getLabel
     *
     * @returns {string}
     */
    getLabel() {
        return constants_1.constants.TWITTER_USER_PUBLIC_METRICS_LABEL;
    }
    /**
     * getRootNode
     *
     * @returns {IGraphNode}
     */
    getNode() {
        return Utils_1.createNode(this.getID(), this.getLabel(), this.getValue(), '', this.getIcon(), this.getType(), 1);
    }
    /**
     * getGraphData
     *
     * @returns {IGraphData}
     */
    getGraphData(targetNodeID) {
        // Graph data elements
        const nodes = [];
        const links = [];
        // Add Root User Public Metrc node and link
        nodes.push(this.getNode());
        if (targetNodeID) {
            links.push(this.getLink(targetNodeID));
        }
        // Loop through metrics
        for (let [metricType, metricValue] of Object.entries(this._metrics)) {
            // Normalize metrics value
            const value = (metricValue) ? Math.min(30, (1 / Utils_1.normalize(metricValue, 0, TWITTER_METRICS_NORMALIZE_MULTIPLIER) * 1000000) - 1000000) : 0;
            const displayValue = Utils_1.formatNumber(metricValue);
            const label = Utils_1.formatLabel(`${metricType} = ${displayValue}`);
            // Add Metric Node to array
            nodes.push(Utils_1.createNode(this._getMetricID(metricType), label, value));
            // Add Link from Root to child Metric
            links.push(Utils_1.createLink(this.getID(), this._getMetricID(metricType), label));
        }
        return Utils_1.createGraphDataObject(nodes, links);
    }
    /**
     * getValue
     *
     * @returns {number}
     */
    getValue() {
        return this._value;
    }
}
exports.default = UserPublicMetrics;
//# sourceMappingURL=UserPublicMetrics.js.map