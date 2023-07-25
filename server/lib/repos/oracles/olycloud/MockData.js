"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockData = void 0;
const mock_events_data_json_1 = __importDefault(require("./data/mock.events.data.json"));
const mock_graph_data_json_1 = __importDefault(require("./data/mock.graph.data.json"));
// import graphJSON from './mock.graph.data.basic.json'
// Get graph data from JSON object
const graphData = mock_graph_data_json_1.default;
// Get events from JSON object
const { events } = mock_events_data_json_1.default;
// Setup whitelist of nodes to be used for mock user data
const userNodesWhiteList = ['basicnetwork.catalog', 'basicnetwork.distribution', 'basicnetwork.assets', 'basicnetwork.ingestion'];
/**
 * MockData
 *
 * @description main domain for handling dummy mock data for basicnetwork service
 * @namespace
 */
var MockData;
(function (MockData) {
    /**
     * getRandomEvent
     *
     * @returns {EventsGraphEvent}
     */
    function getRandomEventData() {
        // Use random index from mock graph data
        const randIndex = Math.floor(Math.random() * graphData.links.length);
        // Get a random link from array of all links to send event with
        const randLink = graphData.links[randIndex];
        // Use random index from mock graph data
        const randEventIndex = Math.floor(Math.random() * events.length);
        const randEvent = events[randEventIndex];
        randEvent.source = randLink.source;
        randEvent.target = randLink.target;
        // Fill in event data with mock data
        // if (randLink.type == 'user') {
        //   randEvent.data = _getRandomUserEventData()
        // } else {
        //   const data = _getEventDataByLink(randLink)
        //   if (data) {
        //     randEvent.data = data
        //   }
        // }
        // return event
        return randEvent;
    }
    MockData.getRandomEventData = getRandomEventData;
    /**
     * getDummyGraphData
     *
     * {IGraphData} @returns
     */
    function getDummyGraphData() {
        return graphData;
    }
    MockData.getDummyGraphData = getDummyGraphData;
})(MockData = exports.MockData || (exports.MockData = {}));
//# sourceMappingURL=MockData.js.map