import IResponse from "./IResponse";
import ITweetData from "./ITweetData";

/**
 * ITweetResponse
 * 
 * @interface
 * @extends {IResponse}
 */
export default interface ITweetResponse extends IResponse {
  data?: ITweetData
}