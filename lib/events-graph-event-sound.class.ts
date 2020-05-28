import EventsGraphSound from './events-graph-sound.class';
import EventsGraphEvent from './events-graph-event.class';

const eventSoundUrl = './assets/audio/bee_buzz.ogg';

/**
 * EventsGraphEventSound
 */

class EventsGraphEventSound extends EventsGraphSound {

  protected _event: EventsGraphEvent;

  /**
   * constructor
   * 
   * @param {EventsGraphEvent} event
   * @param {THREE.AudioListener} listener 
   */

  constructor(event: EventsGraphEvent, listener: THREE.AudioListener) {
    super(eventSoundUrl, listener, event.link.sourceNode);
    this._event = event;
  }
}

export default EventsGraphEventSound; 