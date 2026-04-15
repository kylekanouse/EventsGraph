"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
/**
 * Context
 *
 * @abstract
 * @class
 * @implements {IEventsGraphCollectionContext}
 */
class Context {
    /**
     * getID
     *
     * @returns string
     */
    getID() {
        return this._id;
    }
}
exports.Context = Context;
//# sourceMappingURL=Context.js.map