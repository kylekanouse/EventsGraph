import { GraphNodeObject } from "./GraphNodeObject"

/**
 * GraphLinkData
 */

export declare type GraphLinkData = {
  color?: string
  index?: number
  label?: string
  source?: string | GraphNodeObject
  target?: string | GraphNodeObject
  val?: number
}