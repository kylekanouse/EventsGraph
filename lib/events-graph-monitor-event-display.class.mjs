import EventsGraphEvent from './events-graph-event.class.mjs';

/**
 * CONSTS
 */
const doc = document,
      className = 'events-graph-monitor-window-display-event';

/**
 * EventsGraphMonitorEventDisplay
 * 
 * @class
 */

class EventsGraphMonitorEventDisplay {

  /**
   * constructor 
   * 
   * @param {EventsGraphEvent} event
   */

  constructor(event) {
    this._event = event;
  }

  /**
   * renderHtml
   * 
   * @returns {HTMLDivElement}
   */

  renderHtml() {
    let markup =  doc.createElement("div");

    markup.className = className;

    //markup.textContent

    return markup;
  }
}

/**
 * EXPORT
 * 
 * @exports {EventsGraphMonitorEventDisplay}
 */

export default EventsGraphMonitorEventDisplay;