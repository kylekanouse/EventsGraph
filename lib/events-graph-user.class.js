/**
 * Events Graph User Class
 */

class EventsGraphUser {

  /**
   * 
   * @param {*} id 
   * @param {*} label 
   * @param {*} group 
   * @param {*} val 
   * @param {*} desc 
   * @param {*} icon 
   */

  constructor(id, label = null, group = null, val = null, desc = null, icon = null) {
    this._id = id;
    this._label = label;
    this._group = group;
    this._val = val;
    this._desc = desc;
    this._icon = icon;
    this._egLink = null;

    this.egNode = new EventsGraphNode(id, label, group, val, desc, icon);
  }

  get id() {
    return this._id;
  }

  get egLink() {
    return this._egLink;
  }

  get egNode() {
    return this._egNode;
  }

  set egLink(egLink) {
    this._egLink = egLink;
  }

  /**
   * set egNode
   * 
   * {EventGraphNode}
   */
  set  egNode(egNode) {
    this._egNode = egNode;
  }
} 