"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * StreamRule
 *
 * @class
 */
class StreamRule {
    /**
     * constructor
     *
     * @param {IStreamRuleData} data
     */
    constructor(data) {
        this._value = data.value;
        this._tag = data.tag;
        this._id = data.id;
    }
    get id() {
        return this._id;
    }
    get value() {
        return this._value;
    }
    /**
     * value
     *
     * @param {string} value
     */
    set value(value) {
        this._value = value;
    }
    /**
     * tag
     *
     * @param {string} tag
     */
    set tag(tag) {
        this._tag = tag;
    }
    /**
     * getData
     *
     * @returns {IStreamRuleData}
     */
    getData() {
        return {
            value: this._value,
            tag: this._tag
        };
    }
}
exports.default = StreamRule;
//# sourceMappingURL=StreamRule.js.map