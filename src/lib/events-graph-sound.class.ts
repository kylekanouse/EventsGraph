import EventsGraphNode from './events-graph-node.class';

/**
 * EventsGraphSound
 */

const defaultVol: number = 1,
      defaultRefDistance: number = 300;

class EventsGraphSound {

  private _defaultRefDistance: number;
  private _listener: THREE.AudioListener;
  private _loader: THREE.AudioLoader;
  private _source:any;
  private _sound: THREE.PositionalAudio;
  private _url: string;
  private _volume: number;

  /**
   * constructor
   * 
   * @param {string} sound_url 
   * @param {THREE.AudioListener} listener 
   * @param {EventsGraphNode} source
   */

  constructor(sound_url: string, listener: THREE.AudioListener, source: any) {

    this._url                 = sound_url;
    this._listener            = listener;
    this._volume              = defaultVol;
    this._defaultRefDistance  = defaultRefDistance;
    this._source              = source;
    this._loader              = new THREE.AudioLoader();
  }

  /**
   * get listener
   * @returns {THREE.AudioListener}
   */

  get listener(): THREE.AudioListener {
    return this._listener;
  }

  /**
   * get volume
   * 
   * @returns {number}
   */

  get volume(): number {
    return this._volume;
  }

  /**
   * get url
   * 
   * @returns {string}
   */

  get url(): string {
    return this._url;
  }

  /**
   * set listener
   * 
   * @param {THREE.AudioListener} listener 
   */

  set listener( listener: THREE.AudioListener ) {
    this._listener = listener;
  }

  /**
   * set volume
   * 
   * @param {number}
   */

  set volume(volume: number) {
    this._volume = volume;
    this._sound.setVolume( this._volume );
  }

  /**
   * set url
   * 
   * @param {string}
   */

  set url(url: string) {
    this._url = url;
  }

  /**
   * loadSound
   * 
   * @param {Function}
   * 
   * @returns {EventsGraphSound}
   */

  loadSound(cb?: (sound: THREE.PositionalAudio) => void): EventsGraphSound {
    if (!this._listener) { return this; }

    // Create positional audio sound to associate sound with VR space
    this._sound = new THREE.PositionalAudio( this._listener );

    // Add distance reference value for Poisitional Audio sound
    this._sound.setRefDistance( this._defaultRefDistance );

    // Attach sound to source object for locality
    this._source.object3D.attach(this._sound);


    // Configure default values
    this._sound.setLoop( false );
    this._sound.setVolume( this._volume );

    // Load sound form url
    this._loader.load( this._url, 
      ( buffer: THREE.AudioBuffer ) => {   // onLoad

        // Set loaded buffered audio to sound object
        this._sound.setBuffer( buffer );

        // Return sound object in call back
        if (typeof cb === "function") {
          cb(this._sound);
        }
      },
      () => {},       //onProgress
      () => {         //onError
        console.log('ERROR SOUND: unable to load sound. ', this);
      }
    );

    return this;
  }

  /**
   * play
   * 
   * @returns {EventsGraphSound}
   */

  play(): EventsGraphSound {
    this.loadSound((sound) => {
      sound.play();
    });
    return this;
  }
}

export default EventsGraphSound;