import { Camera, Mesh, MeshBasicMaterial, Object3D, Scene, SphereGeometry, Sprite, SpriteMaterial, TextureLoader, Group, Material, MeshPhongMaterial, DoubleSide, DodecahedronGeometry, Sphere, BufferGeometry } from "three"
import SpriteText from "three-spritetext"
import IEventData from "../../server/domain/IEventData"
import { EventsGraphCustomNodeParams } from "../types/EventsGraphCustomNodeParams"
import { GraphLinkObject } from "../types/GraphLinkObject"
import { GraphNodeObject } from "../types/GraphNodeObject"
import { constants } from "../../server/constants"
import { normalize } from "../../server/lib/Utils"
import TWEEN, { Tween } from "./tween/tween"
import { createOcean, Ocean } from "@uboot/uboot"


const defaultColor        : number = 0x00ff00,
      ocean               : Ocean = createOcean()

/**
 * createEventData
 *
 * @param {string | undefined} id
 * @param {string | undefined} category
 * @param {string | undefined} action
 * @param {string | undefined} label
 * @param {number | undefined} val
 * @param {string | undefined} type
 * @param {string | undefined} source
 * @param {string | undefined} target
 * @returns {IEventData}
 */

export function createEventData(id?: string, category?: string, action?: string, label?: string, val?: number, type?: string, source?: string, target?: string): IEventData {

  return {
    id: id,
    category: category,
    action: action,
    label: label,
    val: (val!==undefined) ? val : 0,
    type: type,
    source: source,
    target: target
  } as IEventData
}

/**
 * createGraphLinkObject
 *
 * @param source 
 * @param target 
 * @param lineObject 
 * @param color 
 * @param index 
 * @param label 
 * @returns 
 */

export const createGraphLinkObject = (source: string | GraphNodeObject, target: string | GraphNodeObject, lineObject: Object3D, color?: string, index?: number, label?: string ): GraphLinkObject => {
  return {
    color: color,
    index: index,
    label: label,
    source: source,
    target: target,
    __lineObj: lineObject
  } as GraphLinkObject
}

/**
 * centerObjToCoords
 * @param {Object3D} obj 
 * @param coords 
 */
  
export const centerObjToCoords = (obj: Object3D, coords: { start: Coords, end: Coords }): boolean => {

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

  // Position obj
  Object.assign(obj.position, middlePos)

  return true
}

/**
 * debounce
 *
 * @param {Function} fn
 * @param ms 
 * @returns 
 */

export const debounce = (fn: Function, ms = 300): Function => {

  let timeoutId: ReturnType<typeof setTimeout>
  let isActive = false

  return function (this: any, ...args: any[]) {
    if (isActive) { return }
    clearTimeout(timeoutId)
    fn.apply(this, args)
    isActive = true
    timeoutId = setTimeout(() => isActive = false, ms)
  }
}

/**
 * getLinkObject
 *
 * @param obj 
 * @returns {Object3D}
 */

export const getLinkObject = (obj: any): Object3D => {

  obj.source = (obj.source instanceof Object) ? obj.source.id : obj.source
  obj.target = (obj.target instanceof Object) ? obj.target.id : obj.target

  // Setup text to show link label in center of the link
  const sprite            = new SpriteText(obj.label)
  sprite.color            = constants.LINK_TEXT_COLOR
  sprite.textHeight       = constants.LINK_TEXT_HEIGHT

  // Associate object to link
  obj.object3D = sprite

  return sprite
}

/**
 * createDefaultNodeObject3D
 *
 * @param {number | undefined} value
 * @returns
 */
export const createDefaultNodeObject3D = (value?: number): Object3D => {

  // Create Circular object for node
  const material = new MeshBasicMaterial({ wireframe: false, color: defaultColor })
  const radius = (value!==undefined) ? normalize( Math.max(value, 0.8), 20, 0 ) * 5 : 10
  const sphere = new SphereGeometry(radius, 20, 20)
  let obj = new Mesh(sphere, material)

  return obj
}

/**
 * createImageObject3D
 *
 * @param {string} url
 * @returns {Object3D}
 */

export const createImageObject3D = (url: string): Object3D => {

  const imgTexture    = new TextureLoader().load(url),
        material      = new SpriteMaterial({ map: imgTexture }),
        obj           = new Sprite(material)

  obj.scale.set(12, 12, 12)

  return obj
}

/**
 * createMaterial
 *
 * @returns {MeshPhongMaterial}
 */

export const createMaterial = (): MeshPhongMaterial => {

  const material      = new MeshPhongMaterial({
                                                side: DoubleSide,
                                              }),
        hue           = Math.random(),
        saturation    = 1,
        luminance     = .5

  material.color.setHSL(hue, saturation, luminance)

  return material
}

/**
 * createHoverObject
 *
 * @returns {Object3D}
 */

export const createHoverObject = (): Object3D => {

  const dodeca      : DodecahedronGeometry  = new DodecahedronGeometry(3.6),
        mesh        : Mesh                  = new Mesh(dodeca, createMaterial()),
        obj         : Object3D              = new Object3D()

  // Compute bounding for height
  dodeca.computeBoundingSphere()

  // Set hover height for reference
  //hoverHeight = (dodeca.boundingSphere?.radius) ? dodeca.boundingSphere.radius * 2 : 0
  obj.userData['height'] = (dodeca.boundingSphere?.radius) ? dodeca.boundingSphere.radius * 2 : 0

  obj.add(mesh)

  return obj
}

/**
 * extractCustomNodeParams
 * @param {GraphNodeObject} obj
 * @returns {EventsGraphCustomNodeParams}
 */

export const extractCustomNodeParams = (obj: GraphNodeObject): EventsGraphCustomNodeParams => {
  return {
    url: obj.url
  }
}

// export function trackOriginalOpacities(mesh) {
    
//   var opacities = [], 
//       materials = mesh.material.materials ? mesh.material.materials : [mesh.material];
//   for (var i = 0; i < materials.length; i++) {        
//        materials[i].transparent = true;
//        opacities.push(materials[i].opacity);
//   }
//   mesh.userData.originalOpacities = opacities;
// }

export const fadeMesh = (mesh: Mesh | Mesh[], direction: any, options?: any) => {
  options = options || {};

  // var originals = []
  // set and check 
  var current = { percentage : direction == "in" ? 1 : 0 },
  // this check is used to work with Mesh and Mesh[] with both normal and multi materials.
  mats = Array.isArray(mesh) ? 
           [...mesh.map((m: Mesh): Material[] => {
             return [...(Array.isArray(m.material) ? m.material as Material[] : [m.material as Material] as Material[])]
           })]: Array.isArray(mesh.material) ? mesh.material as Material[] : [mesh.material as Material],

  //  originals = mesh.userData.originalOpacities,
   originals = Array.isArray(mesh) ?
                [...mesh.map((m: Mesh): number[] => {
                  return m.userData.originalOpacities
                })] : mesh.userData.originalOpacities,
   easing = options.easing || TWEEN.Easing.Linear.None,
   duration = options.duration || 2000;
  // check to make sure originals exist
  if( !originals ) {
       console.error("Fade error: originalOpacities not defined, use trackOriginalOpacities");
        return;
  }
  // tween opacity back to originals
  var tweenOpacity = new Tween(current)
      .to({ percentage: direction == "in" ? 0 : 1 }, duration)
      .easing(easing)
      .onUpdate((): void => {
           for (var i = 0; i < mats.length; i++) {
              // mats[i].opacity = originals[i] * current.percentage;
           }
       })
       .onComplete((): void => {
            if(options.callback){
                 options.callback();
            }
       });
  tweenOpacity.start();
  return tweenOpacity;
}


/**
 * getScene
 *
 * @description Get the THREE.Scene object
 * @returns {Scene}
 */

export const getScene = (): Scene => {
  const ele = <any> document.getElementsByTagName("A-SCENE")[0]
  return (AFRAME && AFRAME.scenes.length) ? AFRAME.scenes[0].object3D : ele.object3D
}

/**
 * _getBoundingSphere
 *
 * @private
 * @returns {Sphere | null}
 */

export const getBoundingSphere = (geometry: BufferGeometry): Sphere | null => {

  if(geometry.boundingSphere === null ) {
    geometry.computeBoundingSphere()
  }

  return geometry.boundingSphere
}

/**
 * getCamera
 *
 * @description Get the camera object associated to the current THREE.Scene object
 * @returns {Camera}
 */

export const getCamera = (): Camera => {
  const ele = <any> document.getElementsByTagName("A-SCENE")[0]
  return (AFRAME && AFRAME.scenes.length) ? AFRAME.scenes[0].camera : ele.camera
}

/**
 * getCameraGroup
 *
 * @returns {Group}
 */

export const getCameraGroup = (): Group => {
  const ele = <any> document.getElementsByTagName("a-entity")[0]
  return ele.object3D
}

/**
 * getCursor
 *
 * @returns {Object3D}
 */

export const getCursor = (): any => {
  const ele = <any> document.querySelector('a-cursor')

  return ele
}

/**
 * getOcean
 *
 * @description used to get a singelton object for whole application to have single reference for Ocean used for messeging and shared state
 * @returns {Ocean}
 */

export const getOcean = (): Ocean => { return ocean }

/**
 * getIcon3D
 *
 * @param iconUrl 
 */

export const getIcon3D = (iconUrl?: string, value?: number): any => {

  let obj,
      group = new Group()

  if (iconUrl) {
    // Use iconUrl to create Image Object3D
    obj = createImageObject3D(iconUrl)

  } else {
    // Create Circular object for node
    obj = createDefaultNodeObject3D(value)
  }

  group.add(obj)

  return obj
}

export const getSourceIDFroObj = (obj: GraphLinkObject): string | number | undefined  => {
  return (typeof obj.source === 'string') ? obj.source : obj.source?.id
}

export const getTargetIDFroObj = (obj: GraphLinkObject): string | number | undefined  => {
  return (typeof obj.target === 'string') ? obj.target : obj.target?.id
}

export const getIDFromObj = (obj: GraphLinkObject): string => {
  return getSourceIDFroObj(obj) + constants.SEP + getTargetIDFroObj(obj)
}