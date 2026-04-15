"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function path(url) {
    const allRoutes = {
        "/graphdata": {
            methods: ["GET"]
        },
        "/extra": {
            methods: ["POST", "GET", "PUT"]
        }
    };
    return allRoutes[url];
}
exports.default = path;
//# sourceMappingURL=path.js.map