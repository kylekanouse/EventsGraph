import { Object3D } from "three"
import { GraphLinkData } from "./GraphLinkData"
import { GraphNodeObject } from "./GraphNodeObject"

/**
 * GraphLink
 */

export declare type GraphLinkObject = GraphLinkData & {
  __lineObj      : Object3D
}