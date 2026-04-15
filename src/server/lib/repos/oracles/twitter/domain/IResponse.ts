import IIncludesData from "./IIncludesData";
import IResponseErrorData from "./IResponseErrorData";

export default interface IResponse {
  includes?: IIncludesData
  meta?: any
  errors?: IResponseErrorData[]
} 