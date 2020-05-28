import EventsGraphLink from './events-graph-link.class';
import EventsGraphNode from './events-graph-node.class';

const userTypeID = 'user',
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


  protected _icon: string;
  protected _id: string;
  protected _label: string;
  protected _link: EventsGraphLink;
  protected _node: EventsGraphNode;
  protected _type: string;

  constructor(id: string|any, label = null, group = null, val = null, desc = null, icon = null) {

    if (typeof id === "object") {
      ({id, label, group, val, desc, icon} = id);
    }

    // Call parent constructor
    super(id, label, group, val, desc, icon);

    // Setup default values
    this._label = (label) ? label : this.defaultLabel;
    this._icon = (icon) ? icon : this.defaultIcon;
    this._type = userTypeID;
  }

  /**
   * defaultLabel
   * 
   * @returns {string}
   */

  get defaultLabel(): string {
    return  defaultLabelPrefix + " " + this._id;
  }

  /**
   * defaultIcon
   * 
   * @returns {string}
   */

  get defaultIcon(): string {
    return defaultIconUrl;
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
   * link
   * 
   * @todo Allow user to have an Array of links
   * @returns {EventsGraphLink}
   */

  get link(): EventsGraphLink {
    return this._link;
  }

  /**
   * get node
   * 
   * @returns {EventsGraphNode}
   */

  get node(): EventsGraphNode {
    return this._node;
  }

  /**
   * link
   * 
   * @param {EventsGraphLink} link
   * 
   */

  set link(link: EventsGraphLink) {
      this._link = link;
  }

  /**
   * linkTo
   * 
   * @param {EventsGraphNode} node 
   */

  linkTo(node: EventsGraphNode) {
    this.link = new EventsGraphLink( this._id, node.id );
  }
}

export default EventsGraphUser;