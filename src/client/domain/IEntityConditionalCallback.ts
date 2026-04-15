import { EntityConditions } from '../types/EntityConditions'
import ICallback from './ICallback'
/**
 * IEntityConditionalCallback
 * 
 * @description basic callback interface for Entities
 * @interface
 */

 export default interface IEntityConditionalCallback {
  cb: ICallback,
  conditions?: EntityConditions
}