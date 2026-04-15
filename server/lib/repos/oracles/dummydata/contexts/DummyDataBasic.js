"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../../constants");
const Context_1 = require("../../../Context");
const MockData = __importStar(require("../MockData"));
const Utils_1 = require("../../../../Utils");
/**
 * DummyDataBasic
 *
 * @description basic dummy data context
 * @class
 */
class DummyDataBasic extends Context_1.Context {
    constructor() {
        /**
         * _id
         *
         * @description ID for context
         * @protected
         * @type {string}
         */
        super(...arguments);
        this._id = constants_1.constants.DUMMY_DATA_BASIC_CONTEXT_ID;
    }
    /**
     * isStreamable
     *
     * @returns {boolean}
     */
    isStreamable() {
        return false;
    }
    /**
     * getData
     *
     * @description execute action
     * @param request {IEventsGraphCollectionContextRequest}
     * @returns {Promise<IEventsGraphCollectionContextResponse>}
     */
    async getData(request) {
        const params = request.params;
        console.log('DummyDataBasic | getData() | params = ', params);
        let data;
        switch (params.type) {
            case 'request':
                data = MockData.graphRequestTypeData;
                break;
            case 'singleNode':
                data = MockData.graphRequestSingleNode;
                break;
            case 'basic':
            default:
                data = MockData.graphBasicData;
                break;
        }
        return new Promise(async (resolve, reject) => {
            resolve(Utils_1.buildResponse(request, data));
        });
    }
    /**
     * getDataStream
     *
     * @param {IEventsGraphCollectionContextRequest} request
     * @param {IUpdateGraphDataCallback} cb
     */
    getDataStream(request, cb) {
        // BasicNetworkService.listenToStream(null, request, cb)
        cb(new Error('No stream available'));
    }
}
// Export
exports.default = new DummyDataBasic();
//# sourceMappingURL=DummyDataBasic.js.map