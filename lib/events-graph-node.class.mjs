/**
 * EventsGraphNode
 */

class EventsGraphNode {

  /**
   * constructor
   * 
   * @param {*} id
   * @param {THREE.object3D} object3D
   * @param {String} label
   * @param {*} group
   * @param {*} val
   * @param {*} desc
   * @param {*} icon
   */

  constructor(id, object3D = null, label = null, group = null, val = null, desc = null, icon = null, color = null, type = null) {
    
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
   * @returns {String}
   */

  get defaultLabel() {
    return "Node" + " " + this._id;
  }

  /**
   * GET id
   * 
   * @returns {String}
   */

  get id() {
    return this._id;
  }

  get icon() {
    return this._icon;
  }

  /**
   * get object3D
   */

  get object3D() {
    return this._object3D;
  }

  /**
   * type
   */

  get type() {
    return this._type;
  }

  /**
   * getData
   * 
   * returns EventsGraph data as graph data
   * 
   * @returns {Object}
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