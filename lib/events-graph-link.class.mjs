import Utils from './utils.mjs';

/**
 * Events Graph Link
 */
class EventsGraphLink {

  /**
   * constructor
   * 
   * @param {string} source 
   * @param {string} target
   * @param {string} val 
   * @param {string} label
   */

  constructor(source, target, val = null, label = null) {

    this._source = source;
    this._target = target;
    this._val = val;
    this._label = label;
  }

  /**
   * GET id
   * 
   * @returns {String}
   */

  get id() {
    return this._buildID(this._source, this._target);
  }

  /**
   * GET source
   * 
   * @returns {Object||String}
   */

  get source() {
    return this._source;
  }

  get target() {
    return this._target;
  }

  get val() {
    return this._val;
  }

  get label() {
    return this._label;
  }

  set source(value) {
    this._source = value;
  }

  set target(value) {
    this._target = value;
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
   * @param {*} source 
   * @param {*} target
   * 
   * @returns {String}
   */

  _buildID(source, target) {
    source = this._getNodeID(source);
    target = this._getNodeID(target);
    return source + Utils.IDSeperator() + target;
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

  getIDFromLinkData(link) {
    return this._buildID( this._getNodeID(link.source) , this._getNodeID(link.target));
  }

  /**
   * getData
   * 
   * @returns {Object}
   */

  getData() {
    return {
      source: this._getNodeID( this._source ),
      target: this._getNodeID( this._target ),
      val: this._val,
      label: this._label
    };
  }
}

/**
 * Export Class
 */

export default EventsGraphLink;