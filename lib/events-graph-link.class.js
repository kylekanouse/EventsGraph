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

  get id() {
    return this._buildID(this._source, this._target);
  }

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
   */

  _buildID(source, target) {
    // console.log("event-graph-link | _buildID() ====== source: ", source);
    // console.log("====== target: ", target);
    source = (typeof source === "object") ? source.id : source;
    target = (typeof target === "object") ? target.id : target;
    return source + Utils.IDSeperator() + target;
  }

  /**
   * getIDFromLinkData
   * 
   * @param {Object} link 
   */
  getIDFromLinkData(link) {
    return this._buildID(link.source, link.target);
  }

  /**
   * getData
   */

  getData() {
    return {
      source: (typeof this._source === "object") ? this._source.id : this._source,
      target: (typeof this._target === "object") ? this._target.id : this._target,
      val: this._val,
      label: this._label
    };
  }
}