import IMediaNonPublicMetricsData from "./IMediaNonPublicMetricsData";
import IMediaOrganicMetricsData from "./IMediaOrganicMetricsData";
import IMediaPromotedMetricsData from "./IMediaPromotedMetricsData";
import IMediaPublicMetricsData from "./IMediaPublicMetricsData";

/**
 * IMediaData
 *
 * @description Media refers to any image, GIF, or video attached to a Tweet. The media object is not a primary object on any endpoint, but can be found and expanded in the Tweet object. The object is available for expansion with "?expansions=attachments.media_keys" to get the condensed object with only default fields. Use the expansion with the field parameter: media.fields when requesting additional fields to complete the object
 * @interface
 */

export default interface IMediaData {
  media_key: string
  type: string
  duration_ms?: number
  height?: number
  non_public_metrics?: IMediaNonPublicMetricsData
  organic_metrics?: IMediaOrganicMetricsData
  url?: string
  preview_image_url?: string
  promoted_metrics?: IMediaPromotedMetricsData
  public_metrics?: IMediaPublicMetricsData
  width?: number
}