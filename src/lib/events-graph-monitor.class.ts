import EventsGraphEvent from './events-graph-event.class';
import EventsGraphMonitorEventDisplay from './events-graph-monitor-event-display.class';


/**
 * MonitorWindow
 * 
 * @class
 * @description Used to add custom mouse over boolean
 */

declare class MonitorWindow extends HTMLDivElement {
  public mouseIsOver: boolean;
}

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

  protected _container: HTMLElement;
  protected _eventTypesEnabled: Array<string>; 
  protected _typeFilterEnabled: boolean;
  protected _window: MonitorWindow;

  /**
   * constructor
   * 
   * @param {HTMLElement} container
   */

  constructor(container: HTMLElement) {

    this._container = container;
    this._eventTypesEnabled = [];
    this._typeFilterEnabled = true;
    this._init();
  }

  /**
   * _init
   */

  _init() {

    this._window = <MonitorWindow> doc.createElement("div");

    //Style window
    this._window.className = monitorClassName;

    // Default mouse over state
    this._window.mouseIsOver = false;

    // Setup Mouse over
    this._window.onmouseover = () => {
      this._window.mouseIsOver = true;
    };
    this._window.onmouseout = () => {
      this._window.mouseIsOver = false;
    };

    // Append to container
    this._container.appendChild( this._window );
  }

  /**
   * get window
   * 
   * @returns {HTMLDivElement}
   */
  
  get window(): HTMLDivElement {
    return this._window;
  }

  /**
   * enableEventType
   *
   * @param {String} eventType
   * 
   * @returns {EventsGraphMonitor}
   */

  enableEventType(eventType: string): EventsGraphMonitor {
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

  logEvent(event: EventsGraphEvent): EventsGraphMonitor {
    // console.log('MONITOR | logEvent() 1 | event = ', event);
    if (this._typeFilterEnabled && this._eventTypesEnabled.indexOf(event.type) == -1) { return this; }

    // Wrap event in display object for presentation
    let ds = new EventsGraphMonitorEventDisplay(event);

    // Insert mesage to window display
    this._window.insertBefore( ds.renderHTML(), this._window.childNodes[0] );

    return this;
  }
}

/**
 * EXPORTS
 * 
 * @exports {EventsGraphMonitor}
 */

export default EventsGraphMonitor;