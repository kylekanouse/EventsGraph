"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = __importDefault(require("../middlewares"));
const router = express_1.default.Router();
// middleware to use for all requests
router.use(Object.values(middlewares_1.default));
exports.default = router;
//# sourceMappingURL=router.js.map