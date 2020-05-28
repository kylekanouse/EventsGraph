/**
 * CONSTS
 */

import { Object3D } from "three";

const nodeLabelPrefix = 'Node';

/**
 * EventsGraphNode
 */

class EventsGraphNode {

  protected _id: string;
  protected _label: string;
  protected _color: string;
  protected _group: string;
  protected _val: number;
  protected _desc: string;
  protected _icon: string;
  protected _object3D: THREE.Object3D;
  protected _type: string;

  /**
   * constructor
   * 
   * @param {*} id
   * @param {THREE.Object3D} object3D
   * @param {string} label
   * @param {*} group
   * @param {*} val
   * @param {*} desc
   * @param {*} icon
   */

  constructor(id: string|any, object3D?: THREE.Object3D, label?: string, group?: string, val?: number, desc?: string, icon?: string, color?: string, type?: string) {
    
    // Decompose id passed object
    if (typeof id === "object") {
      ({id, label, group, val, desc, icon, object3D, color, type} = id);
    }

    this._id = id;
    this._label = (label) ? label : this.defaultLabel;
    this._color = color;
    this._group = group;
    this._val = val;
    this._desc = desc;
    this._icon = icon;
    this._object3D = object3D;
    this._type = type;
  }

  /**
   * defaultLabel
   * 
   * @returns {string}
   */

  get defaultLabel(): string {
    return nodeLabelPrefix + " " + this._id;
  }

  /**
   * GET id
   * 
   * @returns {string}
   */

  get id(): string {
    return this._id;
  }

  /**
   * get icon
   * 
   * @returns {string}
   */

  get icon(): string {
    return this._icon;
  }

  /**
   * get object3D
   */

  get object3D(): THREE.Object3D {
    return this._object3D;
  }

  /**
   * type
   */

  get type(): string {
    return this._type;
  }

  /**
   * getData
   * 
   * returns EventsGraph data as graph data
   * 
   * @returns {object}
   */

  getData() {
    return {
      id: this._id,
      label: this._label,
      group: this._group,
      val: this._val,
      desc: this._desc,
      icon: this._icon,
      color: this._color,
      type: this._type
    };
  }
}

/**
 * Export Class
 */

export default EventsGraphNode;