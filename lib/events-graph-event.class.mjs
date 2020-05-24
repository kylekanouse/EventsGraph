import Utils from './utils.mjs';
import EventsGraphEventSound from './events-graph-event-sound.class.mjs';

/**
 * CONSTS
 */

const eventIdPrefix = 'egevent';

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

    this._link        = link;
    this._created     = Date.now();
    this._id          = this._buildID();
    this._listener    = listener;
    this._sound       = new EventsGraphEventSound(this, this._listener);
    this._category    = null;
    this._action      = null;
    this._label       = null;
    this._value       = null;
    this._type        = null;
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
   * get action
   * 
   * @returns {String}
   */

  get action() {
    return this._action;
  }

  /**
   * get category
   * 
   * @returns {String}
   */

  get category() {
    return this._category;
  }

  /**
   * get created
   * 
   * @returns {Number}
   */

  get created() {
    return this._created;
  }
  

  /**
   * get data
   * 
   * @returns {Object}
   */

  get data() {
    return {
      "category": this._category,
      "action": this._action,
      "label": this._label,
      "value": this._value,
      "type": this._type 
    };
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
    return eventIdPrefix;
  }

  /**
   * IDPostFix
   * 
   * @returns {Date.now}
   */

  get IDPostFix () {
    return this._created;
  }

  /**
   * label
   * 
   * @returns {String}
   */

  get label() {
    return this._label;
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
   * get value
   * 
   * @returns {Number}
   */

  get value() {
    return this._value;
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
    this._category    = (data.hasOwnProperty('category')) ? data.category : null;
    this._action      = (data.hasOwnProperty('action')) ? data.action : null;
    this._label       = (data.hasOwnProperty('label')) ? data.label : null;
    this._value       = (data.hasOwnProperty('value')) ? data.value : null;
    this._type        = (data.hasOwnProperty('type')) ? data.type : null;
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