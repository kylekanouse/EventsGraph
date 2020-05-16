import EventsGraphSound from './events-graph-sound.class.mjs';

const eventSoundUrl = './assets/audio/bee_buzz.ogg';

/**
 * EventsGraphEventSound
 */

class EventsGraphEventSound extends EventsGraphSound {

  /**
   * constructor
   * 
   * @param {EventsGraphEvent} event
   * @param {THREE.AudioListener} listener 
   */

  constructor(event, listener = false) {
    super(eventSoundUrl, listener, event.link.sourceNode);
    this._event = event;
  }
}

export default EventsGraphEventSound; 