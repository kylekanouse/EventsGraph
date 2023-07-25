"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const configs_1 = require("./configs");
class Database {
    constructor(config, mongo) {
        this._config = config;
        this._mongo = mongo;
    }
    dbConnection() {
        const { mongodb: { url, port, collection, password, username } } = this._config;
        const mongoURL = (username && password)
            ? `mongodb://${username}:${password}${url}:${port}/${collection}`
            : `mongodb://${url}:${port}/${collection}`;
        this._mongo
            .connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = this._mongo.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', () => {
            console.log("connected");
        });
        return mongoose_1.default;
    }
    get mongo() {
        return this._mongo;
    }
    get config() {
        return this._config;
    }
}
exports.default = Object.freeze(new Database(configs_1.configs, mongoose_1.default));
//# sourceMappingURL=dbConfigs.js.map