import IPollOptionData from "./IPollOptionData";

/**
 * IPollData
 *
 * @interface
 */

export default interface IPollData {
  id?: string
  options?: IPollOptionData[]
  duration_minutes?: number
  end_datetime?: string
  voting_status?: string
}