import IPlaceGeoData from "./IPlaceGeoData";

/**
 * IPlaceData
 *
 * @interface
 */

export default interface IPlaceData {
  full_name?: string
  id?: string
  contained_within?: string[]
  country?: string
  country_code?: string
  geo?: IPlaceGeoData
  name?: string
  place_type?: string
}