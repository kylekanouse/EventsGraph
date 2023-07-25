"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load dotenv first thing
require('dotenv').config({ path: process.cwd() + '/src/server/.env' });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const http_1 = __importDefault(require("http"));
const route_1 = __importDefault(require("./route"));
const socket_1 = __importDefault(require("./socket"));
// call express
const app = express_1.default(); // define our app using express
// configure app to use bodyParser for
// Getting data from body of requests
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
const port = Number(process.env.PORT) || 8050; // set our port
// Connect Server with express app
const server = new http_1.default.Server(app);
// Setup websocket
const io = require("socket.io")(server, {
    cors: {
        origin: process.env.CLIENT_BASE_URL,
    }
});
// Setup socket
socket_1.default(io);
// Send index.html on root request
app.use(express_1.default.static('dist'));
app.get('/', (req, res) => {
    console.log('sending index.html');
    res.sendFile('/dist/index.html');
});
// REGISTER ROUTES
// all of the routes will be prefixed with /api
const routes = Object.values(route_1.default);
app.use('/api', routes);
app.get('*', function (req, res) {
    console.log('UNKOWN ROUTE: req.path = ', req.path);
});
// START THE SERVER
// =============================================================================
server.listen(port);
console.log(`App listening on ${port}`);
//# sourceMappingURL=index.js.map