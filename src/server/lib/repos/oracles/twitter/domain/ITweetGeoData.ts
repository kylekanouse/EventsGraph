import ITweetGeoCoordinatesData from "./ITweetGeoCoordinatesData";

/**
 * ITweetGeoData
 *
 * @description Contains details about the location tagged by the user in this Tweet, if they specified one.
 * @interface
 */

export default interface ITweetGeoData {
  coordinates?: ITweetGeoCoordinatesData
  place_id?: string
}