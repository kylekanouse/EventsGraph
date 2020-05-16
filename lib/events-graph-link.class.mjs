import Utils from './utils.mjs';
import EventsGraphNode from './events-graph-node.class.mjs';

/**
 * Events Graph Link
 */
class EventsGraphLink {

  /**
   * constructor
   * 
   * @param {Object} source
   * @param {Object} target
   * @param {string} val 
   * @param {string} label
   */

  constructor(source, target, val = null, label = null, sourceNode = null, targetNode = null) {

    if (typeof source === "object") {
      ({source, target, val, label, sourceNode, targetNode} = source);
    }
    //console.log("EventsGraphLink | source = ", source, " | target = ", target);
    this._source = source;
    this._target = target;
    this._sourceNode = sourceNode;
    this._targetNode = targetNode;
    this._val = val;
    this._label = label;
  }

  /**
   * GET id
   * 
   * @returns {String}
   */

  get id() {
    return this._buildID(this._source.id, this._target.id);
  }

  /**
   * GET source
   * 
   * @returns {Object||String}
   */

  get source() {
    return this._source;
  }

  /**
   * get sourceNode
   */

  get sourceNode() {
    return this._sourceNode;
  }

  /**
   * get target
   */

  get target() {
    return this._target;
  }

  /**
   * get targetNode
   */

  get targetNode() {
    return this._targetNode;
  }

  get val() {
    return this._val;
  }

  get label() {
    return this._label;
  }

  /**
   * set source
   * 
   * @param {EventsGraphNode} node
   */

  set source(id) {
    this._source = id;
  }

  /**
   * set sourceNode
   * 
   * @param {EventsGraphNode} node
   */
  set sourceNode(node) {
    this._sourceNode = node;
  }

  /**
   * set target
   * 
   * @param {Oject||String} id
   */

  set target(id) {
    this._target = id;
  }

  /**
   * set targetNode
   * 
   * @param {EventsGraphNode} node
   */

  set targetNode(node) {
    this._targetNode = node;
  }

  set val(val) {
    this._val = val;
  }

  set label(val) {
    this._label = val;
  }

  /**
   * _buildID
   * 
   * @param {*} sourceID
   * @param {*} targetID
   * 
   * @returns {String}
   */

  _buildID(sourceID, targetID) {
    return sourceID + Utils.IDSeperator() + targetID;
  }

  /**
   * _getNodeID
   * 
   * Helper inter nal method to deal with node being either a String or an Object
   * due to graph modifying node object after render
   * 
   * @param {*} node 
   */

  _getNodeID (node) {
    return (typeof node === "object") ? node.id : node;
  }

  /**
   * getIDFromLinkData
   * 
   * @param {Object} link 
   */

  getIDFromGraphLinkData(link) {
    return this._buildID( this._getNodeID(link.source) , this._getNodeID(link.target) );
  }

  /**
   * getData
   * 
   * @returns {Object}
   */

  getData() {
    return {
      source: this._source,
      target: this._target,
      val: this._val,
      label: this._label
    };
  }
}

/**
 * Export Class
 */

export default EventsGraphLink;