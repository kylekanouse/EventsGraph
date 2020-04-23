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

  _buildID(source, target) {
    return source + "-" + target;
  }

  getIDFromLink(link) {
    console.log("=====> getIDFromLink() ", link);
    return this._buildID(link.source, link.target);
  }

  getData() {
    return {
      id: this.id,
      source: this._source,
      target: this._target,
      val: this._val,
      label: this._label
    };
  }
}