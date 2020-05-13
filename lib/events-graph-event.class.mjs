import Utils from './utils.mjs';
import EventsGraphEventSound from './events-graph-event-sound.class.mjs';

/**
 * Events Graph Event Class
 */

class EventsGraphEvent {

  /**
   * constructor 
   * 
   * @param {EventsGraphLink} link 
   * @param {THREE.AudioListener} listener 
   */

  constructor(link, listener) {
    this._link = link;
    this._id = this._buildID();
    this._listener = listener;
    this._sound = new EventsGraphEventSound(this, this._listener);
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
   * set data
   * 
   * @param {Object} data
   */

  set data(data) {
    //console.log('EVENT | data = ', data);
  }

  /**
   * getLinkData
   * 
   * @returns {Object}
   */

  getLinkData() {
    return (this._link) ? this._link.getData() : {};
  }

  /**
   * playSound
   */

  playSound() {
    if (!this._sound) { return this; }
    this._sound.play();
    return this;
  }
}

export default EventsGraphEvent;