"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EventsGraphDataRepo_1 = __importDefault(require("./repos/EventsGraphDataRepo"));
/**
 * EventsGraphService
 *
 * @author Kyle Kanouse
 * @description Main class for provideing the EventsGraph Data service to various applications
 * @implements {IEventsGraphDataService}
 */
class EventsGraphService {
    /**
     * getEventsGraphData
     *
     * @description method to retreive eventsgraph data from service
     * @param request {IEventsGraphCollectionContextRequest}
     * @returns {Promise<IEventsGraphCollectionContextResponse}
     */
    getData(request) {
        // Return Promise with result
        return new Promise((resolve, reject) => {
            // Get data from repo
            EventsGraphDataRepo_1.default.getData(request).then((res) => {
                resolve(res);
            }).catch((err) => {
                reject(err);
            });
        });
    }
    /**
     * getDataStream
     *
     * @param {IEventsGraphCollectionContextRequest} request
     * @param {IUpdateGraphDataCallback} cb
     */
    getDataStream(request, cb) {
        EventsGraphDataRepo_1.default.getDataStream(request, cb);
    }
    /**
     * getCollectionsOptionsData
     *
     * @description method to retrieve options data used to configure requests to the service
     * @returns {IEventsGraphCollectionsOptionsData}
     */
    getCollectionsOptionsData() {
        return {};
    }
}
// Export
exports.default = new EventsGraphService();
//# sourceMappingURL=EventsGraphService.js.map