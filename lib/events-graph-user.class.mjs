import EventsGraphNode from './events-graph-node.class.mjs';
import EventsGraphLink from './events-graph-link.class.mjs';

const userTpeID = 'user',
      defaultIconUrl = './assets/images/user.icon.jpg',
      defaultLabelPrefix = "User";

/**
 * Events Graph User Class
 * 
 * @extends EventsGraphNode
 
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

    if (typeof id === "object") {
      ({id, label, group, val, desc, icon} = id);
    }

    // Call parent constructor
    super(id, label, group, val, desc, icon);

    // Setup default values
    this._label = (label) ? label : this.defaultLabel;
    this._icon = (icon) ? icon : this.defaultIcon;
    this._type = userTpeID;
    this._link = null;
  }

  /**
   * defaultLabel
   * 
   * @returns {String}
   */

  get defaultLabel() {
    return  defaultLabelPrefix + " " + this._id;
  }

  /**
   * defaultIcon
   * 
   * @returns {String}
   */

  get defaultIcon() {
    return defaultIconUrl;
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
   * get node
   * 
   * @returns {EventsGraphNode}
   */

  get node() {
    return this._node;
  }

  /**
   * link
   * 
   * @param {EventsGraphLink} link
   * @returns {EventsGraphUser}
   */

  set link(link) {
    if (!(link instanceof EventsGraphLink)) { return this; }
    this._link = link;
    return this;
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