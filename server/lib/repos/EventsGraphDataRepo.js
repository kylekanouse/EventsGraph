"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Twitter_1 = __importDefault(require("./oracles/Twitter"));
const BasicNetwork_1 = __importDefault(require("./oracles/BasicNetwork"));
const DummyData_1 = __importDefault(require("./oracles/DummyData"));
const Utils_1 = require("../Utils");
const ERROR_NO_COLLECTION_PREFIX = 'Unable to find collection';
const ERROR_NO_STREAM_COLLECTION = ERROR_NO_COLLECTION_PREFIX.concat('', 'that is streamable');
/**
 * GraphDataRepo
 *
 * @description
 *
 * Main repository for all GraphData. Data is pulled from different Oracles
 * from various sources and translated into GraphData of Nodes, Liks, and Events
 *
 * @type class
 */
class EventsGraphDataRepo {
    /**
     * Constructor
     *
     * @constructor
     */
    constructor() {
        this._repo = new Map([
            [Twitter_1.default.getID(), Twitter_1.default],
            [BasicNetwork_1.default.getID(), BasicNetwork_1.default],
            [DummyData_1.default.getID(), DummyData_1.default]
        ]);
    }
    /**
     * _getCollectionIDfromRequest
     *
     * @param request {IEventsGraphCollectionActionRequest}
     * @returns {string}
     */
    _getCollectionIDfromRequest(request) {
        return request.collection.toLowerCase();
    }
    /**
     * getCollectionIDs()
     *
     * @type {function}
     * @returns {string[]}
     */
    getCollectionIDs() {
        return [...this._repo.keys()];
    }
    /**
     * getCollectionContextIDs
     *
     * @param collectionID {string}
     * @returns {string[] | void[]}
     */
    getCollectionContextIDs(collectionID) {
        return this._repo.forEach((collection) => { if (collection.getID() === collectionID) {
            return collection.getContextIDs();
        } });
    }
    /**
     * findCollectionByID
     *
     * @param id {string}
     * @returns {IEventsGraphCollection | undefined}
     */
    findCollectionByID(id) {
        return this._repo.get(id);
    }
    /**
     * getData
     *
     * @param request {IEventsGraphCollectionContextRequest}
     * @async
     * @returns {Promise<IEventsGraphCollectionContextResponse>}
     */
    async getData(request) {
        // Return Promise
        return new Promise((resolve, reject) => {
            // Search for requested context
            const collection = this.findCollectionByID(this._getCollectionIDfromRequest(request));
            // If collection found make request
            if (collection !== undefined) {
                // Make request on collection
                collection.getData(request).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            }
            else {
                reject(ERROR_NO_COLLECTION_PREFIX.concat(' ', this._getCollectionIDfromRequest(request)));
            }
        });
    }
    /**
     * getDataStream
     *
     * @param {IEventsGraphCollectionContextRequest} request
     * @param {IUpdateGraphDataCallback} cb
     */
    getDataStream(request, cb) {
        // Search for requested context
        const collection = this.findCollectionByID(this._getCollectionIDfromRequest(request));
        // If found and streamable make request
        if (collection !== undefined && Utils_1.isStreamable(collection)) {
            // Make call to collection and pass callback
            collection.getDataStream(request, cb);
        }
        else {
            cb(new Error(ERROR_NO_STREAM_COLLECTION.concat(' ', this._getCollectionIDfromRequest(request))));
        }
    }
}
// EXPORT
exports.default = new EventsGraphDataRepo();
//# sourceMappingURL=EventsGraphDataRepo.js.map