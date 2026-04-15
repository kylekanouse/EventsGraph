import { Object3D } from "three"
import Entity from "../lib/Entity"

/**
 * IEntityCallback
 *
 * @interface
 */

export default interface IEntityCallback { 
  (obj: Object3D, entity?: any): void 
}