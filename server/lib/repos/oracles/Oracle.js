"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Oracle
 *
 * @type abstract
 * @description Used to contain all common Oracle funcitonality
 */
class Oracle {
    /**
     * constructor
     *
     * @param id {string}
     */
    constructor(id, contexts) {
        this._contexts = [];
        this._isStreamable = false;
        this._id = id;
        this._contexts = contexts;
    }
    _isStreamble() {
        return this._isStreamable;
    }
    /**
     * _getContextfromRequest
     *
     * @param request {IEventsGraphCollectionActionRequest}
     * @returns {string}
     */
    _getContextfromRequest(request) {
        return request.context.toLowerCase();
    }
    /**console.log('GraphDataRepo | getGraphData() | oracle found. ', oracle)
     * getID
     *
     * @returns {string}
     */
    getID() {
        return this._id;
    }
    /**
     * getActions
     *
     * @returns {IEventsGraphCollectionAction[]}
     */
    getContexts() {
        return this._contexts;
    }
    /**
     * getContextIDs
     *
     * @description list of Context IDs that can be requested from the oracle to return various graph data sets
     * @abstract
     * @returns {string[]}
     */
    getContextIDs() {
        return this._contexts.map(c => c.getID());
    }
    /**
     * findContextByID
     *
     * @param id {string}
     * @returns {IEventsGraphCollectionContext | undefined}
     */
    findContextByID(id) {
        return this._contexts.find(a => a.getID() === id);
    }
    /**
     * getData
     *
     * @param request {IEventsGraphCollectionContextRequest}
     * @returns Promise<IEventsGraphCollectionContextResponse>
     */
    async getData(request) {
        // Return Promise with result
        return new Promise((resolve, reject) => {
            // Search for requested context
            const context = this.findContextByID(this._getContextfromRequest(request));
            // If found make request
            if (context !== undefined) {
                context.getData(request).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            }
            else {
                reject(`Unable to find context "${this._getContextfromRequest(request)}"`);
            }
        });
    }
    /**
     * getDataStream
     *
     * @param {IEventsGraphCollectionContextRequest} request
     * @param {IUpdateGraphDataCallbac} cb
     */
    getDataStream(request, cb) {
        // Search for requested context
        const context = this.findContextByID(this._getContextfromRequest(request));
        // If found and streamable make request
        if (context !== undefined && context.isStreamable()) {
            context.getDataStream(request, cb);
        }
        else {
            cb(new Error(`Unable to find context stream "${this._getContextfromRequest(request)}"`));
        }
    }
}
exports.default = Oracle;
//# sourceMappingURL=Oracle.js.map