/**
 * Events Graph User Class
 * 
 * @extends EventsGraphNode
 * 
 * Wrapper object over EventGraphNode to represent 
 * a user specific node on the graph
 */
class EventsGraphUser extends EventsGraphNode {

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

    // Call parent constructor
    super(id, label, group, val, desc, icon);

    // Setup default values
    this._label = (label) ? label : this.defaultLabel;
    this._icon = (icon) ? icon : this.defaultIcon;
    this._egLink = null;
  }

  get defaultLabel() {
    return "User" + " " + this._id;
  }

  get defaultIcon() {
    return './assets/images/user.icon.jpg';
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
   * egLink
   * 
   * @todo Allow user to have an Array of links
   * @returns {EventsGraphLinks}
   */

  get egLink() {
    return this._egLink;
  }

  /**
   * egLink
   * 
   * @param {EventsGraphLink} egLink
   */

  set egLink(egLink) {
    this._egLink = egLink;
  }

  /**
   * linkTo
   * 
   * @param {EventsGraphNode} egNode 
   */

  linkTo(egNode) {
    this.egLink = new EventsGraphLink( this._id, egNode.id );
  }
} 