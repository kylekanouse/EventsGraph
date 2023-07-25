"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("../route/path"));
// Check to see if the requested route has the requested method as well
exports.default = (req, res, next) => {
    const route = path_1.default(req.url);
    if (route.methods.includes(req.method)) {
        next();
    }
    else {
        const error = {
            status: 405,
            message: "Method not allowed, YET!"
        };
        res.setHeader("allow", route.methods);
        res.status(405).json(error);
    }
};
//# sourceMappingURL=checkMethod.js.map