import EventsGraphNode from './events-graph-node.class.mjs';
import EventsGraphLink from './events-graph-link.class.mjs';

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
    this._link = null;
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
   * link
   * 
   * @todo Allow user to have an Array of links
   * @returns {EventsGraphLinks}
   */

  get link() {
    return this._link;
  }

  /**
   * link
   * 
   * @param {EventsGraphLink} link
   */

  set link(link) {
    this._link = link;
  }

  /**
   * linkTo
   * 
   * @param {EventsGraphNode} node 
   */

  linkTo(node) {
    this.link = new EventsGraphLink( this._id, node.id );
  }
}

export default EventsGraphUser;