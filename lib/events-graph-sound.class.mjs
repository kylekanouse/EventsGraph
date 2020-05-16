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
    this._playOnLoad          = false;
    this._loadingRequests     = [];
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
   * _init
   */

  _init() {
    // this.sound.setVolume( this._volume );
    if (this._listener) {
      this.loadSound();
    }
    return this;
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

      // Attach sound to source object for locality
      this._source.object3D.attach(this._sound);

    } else {

      // If no source object then use general audio
      this._sound = new THREE.Audio( this._listener );
    }

    // Load sound form url
    this._loader.load( this._url, ( buffer ) => {

      // Setup sound values
      this._sound.setBuffer( buffer );
      this._sound.setLoop( false );
      this._sound.setVolume( this._volume );

      if (this._source) {
        // Only add distance reference value for Poisitional Audio sound
        this._sound.setRefDistance( this._defaultRefDistance );
      }

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