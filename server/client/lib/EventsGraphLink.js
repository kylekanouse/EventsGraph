"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../server/constants");
const EventsGraphEntity_1 = __importDefault(require("./EventsGraphEntity"));
/**
 * EventsGraphLink
 *
 * @extends {EventsGraphEntity}
 */
class EventsGraphLink extends EventsGraphEntity_1.default {
    /**
     * constructordata.source
     *
     * @param {IGraphLink} data
     */
    constructor(obj, scene) {
        var _a, _b;
        // Get source and target from object
        const sourceID = (typeof obj.source === 'string') ? obj.source : (_a = obj.source) === null || _a === void 0 ? void 0 : _a.id;
        const targetID = (typeof obj.target === 'string') ? obj.target : (_b = obj.target) === null || _b === void 0 ? void 0 : _b.id;
        // Compose id from source and target ids
        const id = sourceID + constants_1.constants.SEP + targetID;
        // Setup abstrct constructor
        super(obj.__lineObj, scene, id);
        // Assign parameters
        this._sourceID = sourceID;
        this._targetID = targetID;
        this._graphObj = obj;
    }
    /**
     * ############################################### GETTER / SETTER
     */
    get source() {
        return this._graphObj.source;
    }
    get sourceID() {
        return this._sourceID;
    }
    get target() {
        return this._graphObj.target;
    }
    get targetID() {
        return this._targetID;
    }
    get label() {
        return this._graphObj.label;
    }
    get val() {
        return this._graphObj.val;
    }
    /**
     * ############################################### PUBLIC
     */
    /**
     * getData
     *
     * @returns {GraphLinkObject}
     */
    getData() {
        return this._graphObj;
    }
    /**
     * onHover
     *
     * @returns {EventsGraphLink}
     */
    onHover() {
        super.onHover();
        return this;
    }
    /**
     * onOut
     *
     * @returns {EventsGraphLink}
     */
    onOut() {
        super.onOut();
        return this;
    }
    /**
     * onClick
     *
     * @public
     * @param {MouseEvent} event
     * @returns {EventsGraphLink}
     */
    onClick(event) {
        return this;
    }
    /**
     * onDblClick
     *
     * @public
     * @param {MouseEvent} event
     * @returns {EventsGraphLink}
     */
    onDblClick(event) {
        super.onDblClick(event);
        return this;
    }
    /**
     * setActive
     *
     * @param {boolean} isActive
     * @returns {EventsGraphLink}
     */
    setActive(isActive) {
        super.setActive(isActive);
        return this;
    }
}
exports.default = EventsGraphLink;
//# sourceMappingURL=EventsGraphLink.js.map