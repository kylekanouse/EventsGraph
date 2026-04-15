import { AudioListener, AudioLoader, Audio } from 'three'

/**
 * AudioManager
 *
 * @description Manages audio listener and sound playback for EventsGraph
 */

export default class AudioManager {

  private _listener: AudioListener = new AudioListener()
  private _loadingSound: Audio
  private _initLoadSoundUrl: string
  private _initLoadSoundVol: number

  constructor(initLoadSoundUrl: string, initLoadSoundVol: number = 0.2) {
    this._initLoadSoundUrl = initLoadSoundUrl
    this._initLoadSoundVol = initLoadSoundVol
    this._loadingSound = new Audio(this._listener)
                              .setLoop(false)
                              .setVolume(this._initLoadSoundVol)
  }

  get listener(): AudioListener { return this._listener }

  /**
   * playInitLoadingSound
   *
   * @returns {AudioManager}
   */

  playInitLoadingSound(): AudioManager {

    if (this._loadingSound.buffer) {
      this._loadingSound.play()
      return this
    }

    // Load sound url, initialize, and play
    new AudioLoader().load(this._initLoadSoundUrl, (buffer: AudioBuffer): void => {
      this._loadingSound.setBuffer(buffer)
                        .play()
    }, () => {}, () => {})

    return this
  }
}
