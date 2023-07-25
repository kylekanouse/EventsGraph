"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../constants");
const Entity_1 = __importDefault(require("../../../Entity"));
const Utils_1 = require("../../../Utils");
const MediaPublicMetrics_1 = __importDefault(require("./MediaPublicMetrics"));
/**
 * Media
 *
 * @class
 * @implements {Entity}
 */
class Media extends Entity_1.default {
    /**
     * constructor
     *
     * @param data {IMediaData}
     * @param id {string | undefined}
     */
    constructor(data) {
        // Call parent constructor
        super(data.type, data.media_key);
        this._icon = '';
        // Extract values from JSON data object
        this._durationMS = data.duration_ms;
        this._height = data.height;
        this._url = data.url;
        this._previewImageUrl = data.preview_image_url;
        this._width = data.width;
        this._media_key = data.media_key;
        if (data.public_metrics) {
            this._publicMetrics = new MediaPublicMetrics_1.default(data.public_metrics, this._getMediaPublicMetricsID());
        }
        if (this._url) {
            this._icon = this._url;
        }
        else if (this._previewImageUrl) {
            this._icon = this._previewImageUrl;
        }
    }
    /**
     * _getMediaPublicMetricsID
     *
     * @returns {string}
     */
    _getMediaPublicMetricsID() {
        return this.getID() + constants_1.constants.SEP + constants_1.constants.TWITTER_PUBLIC_METRICS_POSTFIX_ID;
    }
    /**
     * getLabel
     *
     * @returns {string}
     */
    getLabel() {
        return Utils_1.formatLabel((this._url) ? this._url : (this._previewImageUrl) ? this._previewImageUrl : '');
    }
    /**
    * getNode
    *
    * @returns {IGraphNode}
    */
    getNode() {
        return Utils_1.createNode(this.getID(), '', 1, '', this.getIcon(), this.getType());
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
        // Check for target node and add link
        if (targetNodeID) {
            graphData.links.push(this.getLink(targetNodeID));
        }
        // Get public metrics
        if (this._publicMetrics) {
            graphData = Utils_1.mergeGraphData(graphData, this._publicMetrics.getGraphData(this.getID()));
        }
        return graphData;
    }
}
exports.default = Media;
//# sourceMappingURL=Media.js.map