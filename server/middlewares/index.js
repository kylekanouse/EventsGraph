"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./logger"));
const checkMethod_1 = __importDefault(require("./checkMethod"));
// The order of middlewares matter
exports.default = {
    checkMethod: checkMethod_1.default,
    logger: logger_1.default,
};
//# sourceMappingURL=index.js.map