import { NodeConditions } from '../types/NodeConditions'
import ICallback from './ICallback'
/**
 * INodeConditionalCallback
 * 
 * @description basic callback interface for Nodes
 * @interface
 */

 export default interface INodeConditionalCallback {
  cb: ICallback,
  conditions?: NodeConditions
}