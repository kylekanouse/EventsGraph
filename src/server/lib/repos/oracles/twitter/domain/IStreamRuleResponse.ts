import IResponseErrorData from "./IResponseErrorData"
import IResponseMeta from "./IResponseMeta"
import IStreamRuleData from "./IStreamRuleData"

/**
 * IStreamRuleResponse
 *
 * @description Main response object for POSTing to rules endpoint
 * @interface
 */

export default interface IStreamRuleResponse {

  data: IStreamRuleData[]

  meta: IResponseMeta

  errors: IResponseErrorData
}