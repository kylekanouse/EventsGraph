  /// <reference path='../types/index.d.ts' />
import GraphEvent from './GraphEvent'
import Sound from './Sound'

/**
 * constants
 */

 const eventSoundUrl: string = './assets/audio/bee_buzz.ogg'

/**
 * Sound
 *
 * @description Class used to handle sound related to eventsgraph event activity
 * @class
 */

export default class EventSound extends Sound {


  /**
   * constructor
   * 
   * @param {string} sound_url 
   * @param {AudioListener} listener 
   * @param {GraphNode} source
   */

   constructor(event: GraphEvent, listener: THREE.AudioListener) {
    super(eventSoundUrl, listener, event.link?.object3D)
  }
}