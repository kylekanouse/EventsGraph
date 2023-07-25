"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicMetrics = void 0;
const constants_1 = require("../../../../constants");
const Entity_1 = __importDefault(require("../../../Entity"));
/**
 * PublicMetrics
 *
 * @abstract
 * @class
 * @extends {Entity}
 */
class PublicMetrics extends Entity_1.default {
    /**
     * constructor
     *
     * @param type {string}
     * @param id {string | undefined}
     * @param icon {string | undefined}
     */
    constructor(type, id, icon) {
        super(type, id, icon);
        /**
         * getID
         *
         * @returns {string}
         */
        this.getID = (postFix) => {
            return this._id + ((postFix) ? (constants_1.constants.SEP + postFix) : '');
        };
    }
}
exports.PublicMetrics = PublicMetrics;
//# sourceMappingURL=PublicMetrics.js.map