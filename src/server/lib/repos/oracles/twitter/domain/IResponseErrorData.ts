/**
 * IResponseErrorData
 * 
 * @interface
 */

export default interface IResponseErrorData {
  value?: string
  details?: string[]
  detail?: string
  parameter?: string
  resource_type?: string
  errors?: any[]
  title?: string
  type?: string
}