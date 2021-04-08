import Utils from './utils';
import EventsGraphEventSound from './events-graph-event-sound.class';
import EventsGraphLink from './events-graph-link.class';
import EventsGraphSound from './events-graph-sound.class';

/**
 * CONSTS
 */

const eventIdPrefix = 'egevent';

/**
 * Events Graph Event Class
 */

class EventsGraphEvent {

  protected _link: EventsGraphLink;
  readonly _created: number;
  protected _id: string;
  protected _listener: THREE.AudioListener;
  protected _sound: EventsGraphSound;
  protected _category: string;
  protected _action: string;
  protected _label: string;
  protected _value: number;
  protected _type: string;

  /**
   * constructor 
   * 
   * @param {EventsGraphLink} link 
   * @param {THREE.AudioListener} listener 
   */

  constructor(link: EventsGraphLink, listener: THREE.AudioListener) {

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
   * @returns {string}
   */

  _buildID(): string {
    return this.IDPrefix + Utils.IDSeperator() + this.IDPostFix;
  }

  /**
   * get action
   * 
   * @returns {string}
   */

  get action(): string {
    return this._action;
  }

  /**
   * get category
   * 
   * @returns {string}
   */

  get category(): string {
    return this._category;
  }

  /**
   * get created
   * 
   * @returns {number}
   */

  get created(): number {
    return this._created;
  }
  

  /**
   * get data
   * 
   * @returns {any}
   */

  get data(): any {
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
   * @returns {string}
   */

  get id(): string {
    return this._id;
  }

  /**
   * IDPrefix
   * 
   * @returns {string}
   */

  get IDPrefix(): string {
    return eventIdPrefix;
  }

  /**
   * IDPostFix
   * 
   * @returns {Date.now}
   */

  get IDPostFix (): number {
    return this._created;
  }

  /**
   * label
   * 
   * @returns {string}
   */

  get label(): string {
    return this._label;
  }

  /**
   * get link
   * 
   * @returns {EventsGraphLink}
   */

  get link(): EventsGraphLink {
    return this._link;
  }

  /**
   * get type
   * 
   * @returns {string}
   */

  get type(): string {
    return this._type;
  }

  /**
   * get value
   * 
   * @returns {number}
   */

  get value(): number {
    return this._value;
  }

  /**
   * set link
   * 
   * @param {EventsGraphLink} link 
   */

  set link(link: EventsGraphLink) {
    this._link = link;
  }

  /**
   * set data
   * 
   * @param {AnalyserNode} data
   */

  set data(data: any) {
    this._category    = (data.hasOwnProperty('category')) ? data.category : null;
    this._action      = (data.hasOwnProperty('action')) ? data.action : null;
    this._label       = (data.hasOwnProperty('label')) ? data.label : null;
    this._value       = (data.hasOwnProperty('value')) ? data.value : null;
    this._type        = (data.hasOwnProperty('type')) ? data.type : null;
  }

  /**
   * getLinkData
   * 
   * @returns {any}
   */

  getLinkData(): any {
    return (this._link) ? this._link.getData() : {};
  }

  /**
   * playSound
   */

  playSound(): EventsGraphEvent {
    if (!this._sound) { return this; }
    this._sound.play();
    return this;
  }
}

export default EventsGraphEvent;