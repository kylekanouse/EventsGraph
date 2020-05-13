/**
 * EventsGraphSound
 */

 const defaultVol = 1;

class EventsGraphSound {

  /**
   * constructor
   * 
   * @param {String} sound_url 
   * @param {THREE.AudioListener} listener 
   */

  constructor(sound_url, listener = false) {

    this._url               = sound_url;
    this._listener          = listener;
    this._volume            = defaultVol;
    this._playOnLoad        = false;
    this._loadingRequests   = [];
    this._loader            = new THREE.AudioLoader();

    //this._init();
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

  loadSound(s, cb) {
    if (!this._listener) { return this; }

    // Create new sound
    //var sound     = new THREE.PositionalAudio( this._listener );
    //this._sound     = new THREE.PositionalAudio( this._listener );
    // this._sound     = (s instanceof THREE.PositionalAudio) ? s : new THREE.PositionalAudio( this._listener );
    this._sound     = (s instanceof THREE.Audio) ? s : new THREE.Audio( this._listener );

    // Load sound form url
    this._loader.load( this._url, ( buffer ) => {

      this._sound.setBuffer( buffer );
      this._sound.setLoop( false );
      // this._sound.setRefDistance( 20 );
      this._sound.setVolume( this._volume );

      console.log('SOUND | loadsound => play  | this._sound = ', this._sound);


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
    // if (this._isLoaded) {                   // Check if sound is loaded to play
    //   console.log('SOUND | =============> play');
    //   //this._sound.stop();
    //   this._sound.play();
    // } else if (this._isLoading) {           // If sound is loading then play on load
    //   this._playOnLoad = true;
    // } else {                                // load sound if not loaded and play
    //   this.loadSound((sound) => {
    //     sound.play();
    //   });
    // }
    // this.loadSound(listener, 
    //   (sound) => {
    //     //sound.play();
    //     //console.log('SOUND | loadsound => play ', sound);
    //   }
    // );
    //var sound = new THREE.Audio( this._listener );

    var sound = new THREE.Audio( this._listener );

    // // load a sound and set it as the Audio object's buffer
    // var audioLoader = new THREE.AudioLoader();
    // const url = './assets/audio/bee_buzz.ogg';
    // audioLoader.load( url, function( buffer ) {
    //   sound.setBuffer( buffer );
    //   sound.setLoop( false );
    //   sound.setVolume( 1 );
    //   console.log('EventsGraph | sendEvent() ==========> sound = ',sound);
    //   sound.play();
    // });

    this.loadSound(sound, (sound) => {
        sound.play();
        console.log('SOUND | loadsound => play ', sound);
    });
    return this;
  }
}

export default EventsGraphSound;