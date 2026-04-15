"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Oracle_1 = __importDefault(require("./Oracle"));
const constants_1 = require("../../../constants");
const BasicNetworkServicesOperations_1 = __importDefault(require("./basicnetwork/contexts/BasicNetworkServicesOperations"));
/**
 * TwitterOracle
 *
 * @description Main entry point to access Twitter data
 * @type class
 */
class BasicNetwork extends Oracle_1.default {
    /**
     * Constructor
     *
     * @constructor
     */
    constructor() {
        super(constants_1.constants.BASICNETWORK_COLLECTION_ID, [BasicNetworkServicesOperations_1.default]);
    }
}
// EXPORT
exports.default = new BasicNetwork();
//# sourceMappingURL=BasicNetwork.js.map