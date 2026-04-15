import IResponse from "./IResponse";
import ITweetData from "./ITweetData";

/**
 * ITweetsResponse
 * 
 * @interface
 * @extends {IResponse}
 */

export default interface ITweetsResponse extends IResponse {
  data?: ITweetData[]
}