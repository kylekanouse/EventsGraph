"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicNetworkService = void 0;
const Utils_1 = require("../../../Utils");
const MockData_1 = require("./MockData");
/**
 * eventIntervalTime
 *
 * @type {number}
 */
const eventIntervalTime = 1000;
/**
 * eventsInterval
 *
 * @type {ReturnType<typeof setInterval>}
 */
let eventsInterval;
/**
 * closeStrream
 *
 * @description closure function to clear interval sustaining events
 */
const closeStream = () => {
    clearInterval(eventsInterval);
};
/**
 * sendDummyEvent
 *
 * @param {IEventsGraphCollectionContextRequest} request
 * @param {IUpdateGraphDataCallback} cb
 */
const sendDummyEvent = (request, cb) => {
    // Send dummy event back through calllback
    cb(null, Utils_1.buildResponse(request, undefined, MockData_1.MockData.getRandomEventData()), closeStream);
};
/**
 * BasicNetworkService
 *
 * @namespace
 */
var BasicNetworkService;
(function (BasicNetworkService) {
    /**
     * getOperationsData
     *
     * @param {IEventsGraphCollectionContextRequest} request
     * @returns {Promise<IEventsGraphCollectionContextResponse>}
     */
    function getOperationsData(request) {
        return new Promise(async (resolve, reject) => {
            resolve(Utils_1.buildResponse(request, MockData_1.MockData.getDummyGraphData()));
        });
    }
    BasicNetworkService.getOperationsData = getOperationsData;
    /**
     * listenToStream
     *
     * @param {IUpdateGraphDataCallback} cb
     * @param {IEventsGraphCollectionContextRequest} request
     */
    function listenToStream(params, request, cb) {
        // Send initial graph data
        cb(null, Utils_1.buildResponse(request, MockData_1.MockData.getDummyGraphData()), closeStream);
        console.log('BasicNetwork | listenToStream | eventsInterval = ', eventsInterval);
        if (eventsInterval) {
            closeStream();
        }
        // Setup interval to mimic stream of event data
        eventsInterval = setInterval(() => {
            sendDummyEvent(request, cb);
        }, eventIntervalTime);
    }
    BasicNetworkService.listenToStream = listenToStream;
})(BasicNetworkService = exports.BasicNetworkService || (exports.BasicNetworkService = {}));
//# sourceMappingURL=BasicNetworkService.js.map