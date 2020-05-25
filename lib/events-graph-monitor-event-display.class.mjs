import EventsGraphEvent from './events-graph-event.class.mjs';

/**
 * CONSTS
 */
const doc = document,
      className = 'events-graph-monitor-window-display-event',
      categoryClassName = className + '-category- ';

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
   * renderHTML
   * 
   * @returns {HTMLDivElement}
   */

  renderHTML() {
    let markup =  doc.createElement("div");

    markup.className = className;

    const displayCreated = new Date(this._event.created).toLocaleTimeString();

    markup.innerHTML = `<span class="timestamp">${displayCreated}</span> - ` +
                       `<div class="info"><span class="label">Action:</span> <strong>${this._event.action}</strong></div>` +
                       `<div class="info"><span class="label">Label:</span> <strong>${this._event.label}</strong></div>` +
                       `<div class="info"><span class="label">Category:</span> <strong>${this._event.category}</strong></div>` +
                       `<div class="info"><span class="label">Type:</span> <strong>${this._event.type}</strong></div>`; 

    return markup;
  }
}

/**
 * EXPORT
 * 
 * @exports {EventsGraphMonitorEventDisplay}
 */

export default EventsGraphMonitorEventDisplay;