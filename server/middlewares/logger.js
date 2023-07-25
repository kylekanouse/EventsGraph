"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (req, res, next) => {
    console.clear();
    const date = new Date();
    console.table([{
            date: `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`,
            method: req.method,
            url: `${req.baseUrl}${req.url}`,
            body: req.body
        }]);
    next();
};
//# sourceMappingURL=logger.js.map