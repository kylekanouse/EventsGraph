"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = __importDefault(require("../router"));
router_1.default.route('/graphdata')
    .get((req, res) => {
    console.log('ROUTE: GET | graphdata ', req.headers);
    res.json({ message: 'Hello from GET graphdata' });
});
exports.default = router_1.default;
//# sourceMappingURL=graphdata.js.map