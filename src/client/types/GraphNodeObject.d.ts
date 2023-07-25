import { Object3D } from "three"
import { GraphNodeData } from "./GraphNodeData"

/**
 * GraphNodeObject
 *
 * @type
 */

export declare type GraphNodeObject = GraphNodeData & {
  x?          : number
  y?          : number
  z?          : number
  vx?         : number
  vy?         : number
  vz?         : number
  fx?         : number
  fy?         : number
  fz?         : number
  __threeObj  : Object3D
}