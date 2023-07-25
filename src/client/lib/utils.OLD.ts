  /// <reference path='../types/index.d.ts' />

import { debug } from 'console';
import THREE, { Font, AudioListener, FontLoader, Group, TextureLoader, SpriteMaterial, Sprite, MeshBasicMaterial, SphereGeometry, Mesh, Object3D } from 'three'

import SpriteText from "three-spritetext";
import { constants } from "../../server/constants";


/**
 * Utils
 * 
 * @static true
 * @summary Main object for holding utility functions used by the application
 * @exports {Object}
 */

export namespace Utils {

  /**
   * loadJSON
   *
   * @param url 
   * @param callback 
   * @param errorcb 
   * 
   */

  // export function loadJSON(url: string, callback?: Function, errorcb?: Function) {

  //   let xobj: XMLHttpRequest = new XMLHttpRequest();
  //   xobj.overrideMimeType("application/json");
  //   xobj.open('GET', url, true);
  //   if (errorcb) {
  //     xobj.onerror = () => errorcb();
  //   }
  //   xobj.onreadystatechange = () => {
  //       if (xobj.readyState == 4 && xobj.status == 200 && callback) {
  //         callback(xobj.responseText);
  //       } else if (xobj.status == 0 && errorcb) {
  //         errorcb();
  //       }
  //   };
  //   xobj.send(null); 
  // }

  /**
   * IDSeperator
   * 
   * @returns {string}
   */

  export function IDSeperator(): string {
    return "-";
  }

  /**
   * centerObjToCoords
   * @param {Object3D} obj 
   * @param coords 
   */
  
  export function centerObjToCoords(obj: Object3D, coords: { start: Coords, end: Coords }): boolean {

    type CoordsKey = keyof typeof coords.start

    const ar: Array<any> = ['x', 'y', 'z'].map( (c) => {
      let prop: CoordsKey = c as keyof typeof coords.start
      return {[c]: coords.start[prop] + (coords.end[prop] - coords.start[prop]) / 2 }// calc middle point
    })

    const middlePos = {
      x: ar[0].x,
      y: ar[1].y,
      z: ar[2].z,
    }
    debugger
    // Position obj
    Object.assign(obj.position, middlePos)

    return true
  }

  /**
   * getLinkObject
   *
   * @param obj 
   * @returns {Object3D}
   */

  export function getLinkObject(obj: any): Object3D {

    obj.source = (obj.source instanceof Object) ? obj.source.id : obj.source
    obj.target = (obj.target instanceof Object) ? obj.target.id : obj.target

    // Setup text to show link label in center of the link
    const text = (obj.label) ? `${obj.label}` : `${obj.source} > ${obj.target}`
    const sprite = new SpriteText(text)
    sprite.color = constants.LINK_TEXT_COLOR
    sprite.textHeight = constants.LINK_TEXT_HEIGHT

    // Create container to add sprite
    // let group = new Group()
    
    // group.add(sprite)

    // Associate object to link
    obj.object3D = sprite

    return sprite
  }

  /**
   * getNodeObject
   *
   * @param {any} nodeData
   * @returns {Object3D}
   */

  export function getNodeObject(nodeData: any): Object3D {

    let obj: any

    // if (nodeData.icon) {

    //   // Create Image icon for node
    //   const imgTexture = new TextureLoader().load(nodeData.icon)
    //   const material = new SpriteMaterial({ map: imgTexture })
    //   obj = new Sprite(material)
    //   obj.scale.set(12, 12)

    // } else {

      // Create Circular object for node
      const material = new MeshBasicMaterial({ wireframe: false, color: constants.NODE_DEFAULT_COLOR })
      const sphere = new SphereGeometry(0.5 * nodeData.val, 20, 20)
      obj = new Mesh(sphere, material)
    // }

    // // Assocuate object to node
    // nodeData.object3D = obj

    return obj
  }
}