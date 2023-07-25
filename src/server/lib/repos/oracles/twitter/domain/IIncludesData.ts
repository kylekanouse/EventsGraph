import ITweetData from "./ITweetData"
import IPlaceData from "./IPlaceData"
import IUserData from "./IUserData"
import IMediaData from "./IMediaData"
import IPollData from "./IPollData"

/**
 * IIncludesData
 *
 * @interface
 */

export default interface IIncludesData {
  tweets?: ITweetData[]
  users?: IUserData[]
  places?: IPlaceData[]
  media?: IMediaData[]
  polls?: IPollData[]
}