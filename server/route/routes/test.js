"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const router_1 = __importDefault(require("../router"));
const models_1 = require("../../models");
router_1.default.route('/test')
    .get((req, res) => {
    const { username } = os_1.userInfo();
    if (!username) {
        const error = {
            status: 500,
            message: "Something bad happend!"
        };
        res.status(error.status).json(error);
    }
    res.json({ username });
})
    .post(async (req, res) => {
    const { text } = req.body;
    const Text = new models_1.Test({ text });
    try {
        const savedText = await Text.save();
        res.status(201).json(savedText);
    }
    catch (e) {
        const error = {
            status: 500,
            message: "An error happened!"
        };
        console.error(e);
        res.status(error.status).json({ message: "An error happened" });
    }
})
    .put((req, res) => {
    const { id, text } = req.body;
    models_1.Test.updateOne({ _id: id }, { text }, {}, (err, test) => {
        if (err) {
            const error = {
                status: 500,
                message: "It can't be updated at this moment!"
            };
            console.error(err);
            res.status(error.status).json(error);
        }
        else
            res.status(200).json({ _id: id, text, ...test });
    });
})
    .delete((req, res) => {
    const { id } = req.body;
    models_1.Test.deleteOne({ _id: id }, {}, (err) => {
        if (err) {
            const error = {
                status: 500,
                message: "Resource can't be deleted!"
            };
            console.error(err);
            res.status(error.status).json(error);
        }
        else
            res.status(200).json({ _id: id, text: "deleted successfully" });
    });
});
exports.default = router_1.default;
//# sourceMappingURL=test.js.map