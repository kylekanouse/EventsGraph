import Utils from './utils.mjs';

/**
 * Events Graph Event Class
 */

class EventsGraphEvent {

  /**
   * constructor 
   * 
   * @param {EventsGraphLink} link 
   */

  constructor(link) {
    this._link = link;
    this._id = this._buildID();
  }

  /**
   * _buildID
   * 
   * @returns {String}
   */

  _buildID() {
    return this.IDPrefix + Utils.IDSeperator() + this.IDPostFix;
  }

  /**
   * get id
   * 
   * @returns {String}
   */

  get id() {
    return this._id;
  }

  /**
   * IDPrefix
   * 
   * @returns {String}
   */

  get IDPrefix () {
    return 'egevent';
  }

  /**
   * IDPostFix
   * 
   * @returns {Date.now}
   */

  get IDPostFix () {
    return Date.now();
  }

  /**
   * get link
   * 
   * @returns {EventsGraphLink}
   */

  get link() {
    return this._link;
  }

  /**
   * set link
   * 
   * @param {EventsGraphLink} link 
   */

  set link(link) {
    if (!(link instanceof EventsGraphLink)) { return; }
    this._link = link;
  }

  /**
   * getLinkData
   * 
   * @returns {Object}
   */

  getLinkData() {
    return (this._link) ? this._link.getData() : {};
  }
}

export default EventsGraphEvent;