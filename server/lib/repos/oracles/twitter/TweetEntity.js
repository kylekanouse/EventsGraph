"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Entity_1 = __importDefault(require("../../../Entity"));
/**
 * TweetEntity
 *
 * @interface
 * @extends {Entity}
 */
class TweetEntity extends Entity_1.default {
    /**
     * constructor
     *
     * @param {ITweetEntityData} data
     * @param {string | undefined} type
     * @param {string | undefined} id
     * @param {string | undefined} icon
     */
    constructor(data, type, id, icon) {
        super(type, id, icon);
        this._start = (typeof data === 'object' && data.start) ? data.start : undefined;
        this._end = (typeof data === 'object' && data.end) ? data.end : undefined;
    }
}
exports.default = TweetEntity;
//# sourceMappingURL=TweetEntity.js.map