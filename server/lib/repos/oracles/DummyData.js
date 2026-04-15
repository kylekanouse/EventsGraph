"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Oracle_1 = __importDefault(require("./Oracle"));
const constants_1 = require("../../../constants");
const DummyDataBasic_1 = __importDefault(require("./dummydata/contexts/DummyDataBasic"));
/**
 * DummyData
 *
 * @description Dummy data Service
 * @type class
 */
class DummyData extends Oracle_1.default {
    /**
     * Constructor
     *
     * @constructor
     */
    constructor() {
        super(constants_1.constants.DUMMY_DATA_COLLECTION_ID, [DummyDataBasic_1.default]);
    }
}
// EXPORT
exports.default = new DummyData();
//# sourceMappingURL=DummyData.js.map