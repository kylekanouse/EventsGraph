import IResponse from "./IResponse";
import IUserData from "./IUserData";

/**
 * IUserResponse
 *
 * @interface
 * @example {IResponse}
 */

export default interface IUserResponse extends IResponse {
  data?: IUserData[]
}