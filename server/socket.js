"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EventsGraphService_1 = __importDefault(require("./lib/EventsGraphService"));
const Throttler_1 = require("./lib/Throttler");
let socket;
let limiter;
let currentCloseStream = () => { };
/**
 * Throttler
 */
const throttledSend = Throttler_1.throttle((data) => sendGraphDataStreamResponse(data), 10000, { start: true });
/**
 * sendGraphEven
 *
 * @author Kyle Kanouse
 * @description Main function to send event data
 * @param socket sendGraphEvent
 * @constant
 * @returns
 */
const sendGraphEvent = () => (event) => {
    if (socket) {
        socket.emit("graphEvent", event);
    }
};
/**
 * sendGraphDataResponse
 *
 * @param {IEventsGraphCollectionContextResponse | undefined} data
 */
const sendGraphDataStreamResponse = (data) => {
    if (socket && data) {
        socket.emit("graphStream", data);
    }
};
/**
 * graphStreamUpdate
 *
 * @param {Error} error
 * @param {IEventsGraphCollectionContextResponse} data
 */
const graphStreamUpdate = (error, data, closeStream) => {
    if (closeStream) {
        currentCloseStream = closeStream;
    }
    if (data) {
        sendGraphDataStreamResponse(data);
    }
};
const throttledGraphStreamUpdate = (error, data) => {
    if (data) {
        throttledSend(data);
    }
};
/**
 * getRequestFromJSON
 *
 * @param {any} json
 * @returns {IEventsGraphCollectionContextRequest}
 */
const getRequestFromJSON = (json) => {
    return JSON.parse(json);
};
// EXPORT
exports.default = (io) => {
    const events = new Set();
    let contextRequest;
    // Establish Socket connection
    io.on("connection", (s) => {
        // console.log('SOCKET | connection()')
        socket = s;
        // listen for get Graph node data
        socket.on("getGraphData", (request) => {
            // console.log('SOCKET | ------------ getGraphData() | request = ', request)
            // Parse request string into request object
            try {
                contextRequest = getRequestFromJSON(request);
            }
            catch (err) {
                console.log('ERROR: SOCKET parsing JSON request string');
                return;
            }
            // Get data from EventsGraph service
            EventsGraphService_1.default.getData(contextRequest).then((res) => {
                socket === null || socket === void 0 ? void 0 : socket.emit("graphData", res);
            }).catch((res) => {
                console.log('EventsGraphService ERROR: ', res);
            });
        });
        /**
         * getGraphStream
         */
        socket.on("getGraphDataStream", (request) => {
            console.log('SOCKET | ------------ getGraphDataStream() | request = ', request);
            try {
                contextRequest = getRequestFromJSON(request);
            }
            catch (err) {
                console.log('ERROR: SOCKET parsing JSON request string');
                return;
            }
            // Get Stream data from service
            EventsGraphService_1.default.getDataStream(contextRequest, graphStreamUpdate);
        });
        /**
         * closeStream
         */
        socket.on("closeStream", () => {
            currentCloseStream();
        });
        socket.on("disconnect", (reson) => {
            console.log('--------- SOCKET: DISCONNECT | reson = ', reson);
            currentCloseStream();
        });
    });
};
//# sourceMappingURL=socket.js.map