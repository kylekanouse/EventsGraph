"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphRequestSingleNode = exports.graphRequestTypeData = exports.graphBasicData = void 0;
const mock_graph_data_basic_json_1 = __importDefault(require("./data/mock.graph.data.basic.json"));
const mock_graph_data_request_types_json_1 = __importDefault(require("./data/mock.graph.data.request-types.json"));
const mock_graph_data_single_node_json_1 = __importDefault(require("./data/mock.graph.data.single-node.json"));
/**
 * Basic Data
 */
exports.graphBasicData = mock_graph_data_basic_json_1.default;
/**
 * Request Type
 */
exports.graphRequestTypeData = mock_graph_data_request_types_json_1.default;
/**
 * Single Node
 */
exports.graphRequestSingleNode = mock_graph_data_single_node_json_1.default;
//# sourceMappingURL=MockData.js.map