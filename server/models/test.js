"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbConfigs_1 = __importDefault(require("../dbConfigs"));
const mongoose_1 = require("mongoose");
const { mongo: { model } } = dbConfigs_1.default;
const TestSchema = new mongoose_1.Schema({ text: { type: String, required: true } });
exports.default = model('Test', TestSchema);
//# sourceMappingURL=test.js.map