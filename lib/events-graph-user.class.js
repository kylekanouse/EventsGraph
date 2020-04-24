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
    this._label = (label) ? label : this.defaultLabel;
    this._group = group;
    this._val = val;
    this._desc = desc;
    this._icon = icon;
    this._egLink = null;

    this.egNode = new EventsGraphNode(this._id, this._label, this._group, this._val, this._desc, this._icon);
  }

  get defaultLabel() {
    return "User" + " " + this._id;
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

  /**
   * createLink
   * 
   * @param {String} sourceID
   * @param {String} targetID
   */

  createLink(sourceID, targetID) {
    console.log('event-graph-user | createLink() ', sourceID, targetID);
    this.egLink = new EventsGraphLink( sourceID, targetID );
  }
} 