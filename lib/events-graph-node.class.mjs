/**
 * EventsGraphNode
 */

class EventsGraphNode {

  /**
   * constructor
   * 
   * @param {*} id 
   * @param {String} label 
   * @param {*} group 
   * @param {*} val 
   * @param {*} desc 
   * @param {*} icon 
   */

  constructor(id, label = null, group = null, val = null, desc = null, icon = null) {
    
    // Decompose id passed object
    if (typeof id === "object") {
      ({id, label, group, val, desc, icon} = id);
    }

    this._id = id;
    this._label = (label) ? label : this.defaultLabel;
    this._group = group;
    this._val = val;
    this._desc = desc;
    this._icon = icon;
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
      icon: this._icon
    };
  }
}

/**
 * Export Class
 */

export default EventsGraphNode;