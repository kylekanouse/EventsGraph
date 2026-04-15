"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
/**
 * EventsGraphEntity
 *
 * @abstract
 * @class
 */
class EventsGraphEntity {
    /**
     * constructor
     *
     * @param {Object3D} object3D
     * @param {Scene} scene
     * @param {id | undefined} id
     */
    constructor(object3D, scene, id) {
        this._isActive = false;
        this._isOver = false;
        this._isFocused = false;
        this._id = (id) ? id : uuid_1.v4();
        this._object3D = object3D;
        this._scene = scene;
    }
    /**
     * ############################################### GETTER / SETTER
     */
    /**
     * ---------- GETTER
     */
    get id() {
        return this._id;
    }
    get isOver() {
        return this._isOver;
    }
    get isFocused() {
        return this._isFocused;
    }
    get object3D() {
        return this._object3D;
    }
    get scene() {
        return this._scene;
    }
    /**
     * ---------- SETTER
     */
    set id(id) {
        this._id = id;
    }
    /**
     * onBlurred
     *
     * @public
     * @returns {EventsGraphEntity<DataObj>}
     */
    onBlurred() {
        this._isFocused = false;
        return this;
    }
    /**
     * onDblClick
     *
     * @public
     * @param {MouseEvent} event
     * @returns {EventsGraphEntity<DataObj>}
     */
    onDblClick(event) {
        this.setActive(!this._isActive);
        return this;
    }
    /**
     * onFocused
     *
     * @public
     * @returns {EventsGraphEntity<DataObj>}
     */
    onFocused() {
        this._isFocused = true;
        return this;
    }
    /**
     * onHover
     *
     * @public
     * @returns {EventsGraphEntity<DataObj>}
     */
    onHover() {
        this._isOver = true;
        return this;
    }
    /**
     * onOut
     *
     * @public
     * @returns {EventsGraphEntity<DataObj>}
     */
    onOut() {
        this._isOver = false;
        return this;
    }
    /**
     * setActive
     *
     * @public
     * @param {boolean} isActive
     * @returns {EventsGraphEntity<DataObj>}
     */
    setActive(isActive) {
        this._isActive = isActive;
        return this;
    }
}
exports.default = EventsGraphEntity;
//# sourceMappingURL=EventsGraphEntity.js.map