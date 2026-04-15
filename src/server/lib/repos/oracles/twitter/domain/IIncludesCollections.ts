import MediaCollection from "../MediaCollection"
import UserCollection from "../UserCollection"

/**
 * IIncludesCollections
 * 
 * @description COllection to contain reference entities attached to includes property in response data object
 * @interface
 */

export default interface IIncludesCollections {

  refUserCollection?: UserCollection

  refMediaCollection?: MediaCollection
}