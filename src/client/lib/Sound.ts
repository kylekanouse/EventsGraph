  /// <reference path='../types/index.d.ts' />
import { AudioListener, PositionalAudio, AudioLoader, Object3D } from 'three'
import GraphEntity from './GraphEntity'

/**
 * constants
 */

const defaultVol            : number = 1,
      defaultRefDistance    : number = 300,
      loadedSounds: Map <string, PositionalAudio> = new Map()

/**
 * EventsGraphSound
 *
 * @description Class used to handle sound related to eventsgraph
 * @class
 */
  
export default class EventsGraphSound {

  private _defaultRefDistance: number

  private _listener: AudioListener

  private _loader: AudioLoader

  private _source: Object3D | undefined

  private _sound: PositionalAudio | undefined

  private _url: string

  private _volume: number

  /**
   * constructor
   * 
   * @param {string} sound_url 
   * @param {AudioListener} listener 
   * @param {EventsGraphNode} source
   */

  constructor(sound_url: string, listener: AudioListener, source?: Object3D) {

    this._url                 = sound_url
    this._listener            = listener
    this._volume              = defaultVol
    this._defaultRefDistance  = defaultRefDistance
    this._source              = source
    this._loader              = new AudioLoader()
  }

  /**
   * set volume
   * 
   * @param {number}
   */

  set volume(volume: number) {
    this._volume = volume
    if (this._sound) {
      this._sound.setVolume( this._volume )
    }
  }

  /**
   * loadSound
   * 
   * @param {Function}
   * 
   * @returns {EventsGraphSound}
   */

    loadSound(cb?: (sound: PositionalAudio) => void): EventsGraphSound {
  
    if (!this._listener) { return this }

    // check for loaded sounds cache
    const cache = loadedSounds.get(this._url)

    // If sound found in cache assign to current sound
    if (cache) {
      this._sound = cache
    }

    if (cb && this._sound) { 
      cb(this._sound) 
      return this
    }
  
    // Create positional audio sound to associate sound with VR space
    this._sound = new PositionalAudio( this._listener )

    // Add distance reference value for Poisitional Audio sound
    this._sound.setRefDistance( this._defaultRefDistance )

    // Attach sound to source object for locality
    if (this._source) {
      this._source.attach( this._sound )
    }


    // Configure default values
    this._sound.setLoop( false )
    this._sound.setVolume( this._volume )

    // Load sound form url
    this._loader.load( this._url, 
      ( buffer: AudioBuffer ) => {   // onLoad

        // Set loaded buffered audio to sound object
        if (this._sound) {
          this._sound.setBuffer( buffer )

          // check for call back
          if (typeof cb === "function") {

            // Add loaded sound to cache
            loadedSounds.set(this._url, this._sound)

            // Call back and pass loaded sound
            cb(this._sound)
          }
        }
      },
      () => {},       //onProgress
      () => {         //onError
        console.log('ERROR SOUND: unable to load sound. ', this)
      }
    )

    return this
  }

  /**
   * play
   * 
   * @returns {EventsGraphEventSound}
   */

  play(): EventsGraphSound {

    this.loadSound((sound) => {
      sound.play()
    })

    return this
  }
}