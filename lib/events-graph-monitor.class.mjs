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
    this._init();
  }

  /**
   * _init
   */

  _init() {

    this._window = document.createElement("div");

    //Style window
    this._window.className = 'display-window events-graph-monitor-window';

    this._container.appendChild( this._window );
  }

  /**
   * get window
   */
  
  get window() {
    return this._window;
  }
}

export default EventsGraphMonitor;