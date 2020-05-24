import EventsGraphEvent from './events-graph-event.class.mjs';
import EventsGraphMonitorEventDisplay from './events-graph-monitor-event-display.class.mjs';

/**
 * CONSTS
 */

const doc               = document,
      monitorClassName  = 'display-window events-graph-monitor-window';

/**
 * EventsGraphMonitor
 * 
 * @class
 */

class EventsGraphMonitor {

  /**
   * constructor
   * 
   * @param {HTMLDivElement} container
   */

  constructor(container) {

    this._container = container;
    this._eventTypesEnabled = [];
    this._typeFilterEnabled = true;
    this._init();
  }

  /**
   * _init
   */

  _init() {

    this._window = doc.createElement("div");

    //Style window
    this._window.className = monitorClassName;

    this._container.appendChild( this._window );
  }

  _updateWindow() {

  }

  /**
   * get window
   * 
   * @returns {HTMLDivElement}
   */
  
  get window() {
    return this._window;
  }

  /**
   * enableEventType
   *
   * @param {String} eventType
   * 
   * @returns {EventsGraphMonitor}
   */

  enableEventType(eventType) {
    if (eventType == '*') { 
      this._typeFilterEnabled = false;
      return this;
    }
    this._eventTypesEnabled.push(eventType);
    return this;
  }


  /**
   * logEvent
   * 
   * @param {EventsGraphEvent}
   * 
   * @returns {EventsGraphMonitor}
   */

  logEvent(event) {
    // console.log('MONITOR | logEvent() 1 | event = ', event);
    if (this._typeFilterEnabled && this._eventTypesEnabled.indexOf(event.type) == -1) { return this; }
    let ds = new EventsGraphMonitorEventDisplay(event);
    // console.log('MONITOR | logEvent() 2 | ds = ', ds);
    return this;
  }
}

/**
 * EXPORTS
 * 
 * @exports {EventsGraphMonitor}
 */

export default EventsGraphMonitor;