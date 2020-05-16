import EventsGraphNode from './events-graph-node.class.mjs';

/**
 * EventsGraphSound
 */

const defaultVol = 1,
      defaultRefDistance = 300;

class EventsGraphSound {

  /**
   * constructor
   * 
   * @param {String} sound_url 
   * @param {THREE.AudioListener} listener 
   * @param {EventsGraphNode} source
   */

  constructor(sound_url, listener = false, source = null) {

    this._url                 = sound_url;
    this._listener            = listener;
    this._volume              = defaultVol;
    this._defaultRefDistance  = defaultRefDistance;
    this._source              = (source instanceof EventsGraphNode) ?  source : false;
    this._loader              = new THREE.AudioLoader();
  }

  /**
   * get listener
   * @returns {THREE.AudioListener}
   */

  get listener() {
    return this._listener;
  }

  /**
   * get volume
   * 
   * @returns {Integer}
   */

  get volume() {
    return this._volume;
  }

  /**
   * get url
   * 
   * @returns {String}
   */

  get url() {
    return this._url;
  }

  /**
   * set listener
   * 
   * @param {THREE.AudioListener} listener 
   */

  set listener( listener ) {
    this._listener = listener;
  }

  /**
   * set volume
   * 
   * @param {Integer}
   */

  set volume(volume) {
    this._volume = volume;
    this.sound.setVolume( this._volume );
  }

  /**
   * set url
   * 
   * @param {String}
   */

  set url(url) {
    this._url = url;
  }

  /**
   * loadSound
   * 
   * @param {Function}
   */

  loadSound(cb) {
    if (!this._listener) { return this; }

    // Create sound
    if (this._source) {

      // Create positional audio sound to associate sound with VR space
      this._sound = new THREE.PositionalAudio( this._listener );

      // Add distance reference value for Poisitional Audio sound
      this._sound.setRefDistance( this._defaultRefDistance );

      // Attach sound to source object for locality
      this._source.object3D.attach(this._sound);

    } else {

      // If no source object then use general audio
      this._sound = new THREE.Audio( this._listener );
    }

    // Configure default values
    this._sound.setLoop( false );
    this._sound.setVolume( this._volume );

    // Load sound form url
    this._loader.load( this._url, ( buffer ) => {

      // Set loaded buffered audio to sound object
      this._sound.setBuffer( buffer );

      // Return sound object in call back
      if (typeof cb === "function") {
        cb(this._sound);
      }
    });

    return this;
  }

  /**
   * play
   * 
   * @returns EventsGraphSound
   */

  play() {
    this.loadSound((sound) => {
      sound.play();
    });
    return this;
  }
}

export default EventsGraphSound;