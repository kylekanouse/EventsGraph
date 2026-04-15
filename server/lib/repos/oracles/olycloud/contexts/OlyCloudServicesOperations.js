"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../../constants");
const Context_1 = require("../../../Context");
const BasicNetworkService_1 = require("../BasicNetworkService");
/**
 * ContextTweetLookup
 *
 * @description main context for dealing with a single or multiple tweet
 * @class
 */
class ContextBasicNetworkServicesOperations extends Context_1.Context {
    constructor() {
        /**
         * _id
         *
         * @description ID for context
         * @protected
         * @type {string}
         */
        super(...arguments);
        this._id = constants_1.constants.BASICNETWORK_OPERATIONS_CONTEXT_ID;
    }
    /**
     * isStreamable
     *
     * @returns {boolean}
     */
    isStreamable() {
        return true;
    }
    /**
     * getData
     *
     * @description execute action
     * @param request {IEventsGraphCollectionContextRequest}
     * @returns {Promise<IEventsGraphCollectionContextResponse>}
     */
    async getData(request) {
        return BasicNetworkService_1.BasicNetworkService.getOperationsData(request);
    }
    /**
     * getDataStream
     *
     * @param {IEventsGraphCollectionContextRequest} request
     * @param {IUpdateGraphDataCallback} cb
     */
    getDataStream(request, cb) {
        BasicNetworkService_1.BasicNetworkService.listenToStream(null, request, cb);
    }
}
// Export
exports.default = new ContextBasicNetworkServicesOperations();
//# sourceMappingURL=BasicNetworkServicesOperations.js.map