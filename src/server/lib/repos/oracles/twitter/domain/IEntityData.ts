/**
 * IEntityData
 * 
 * @interface
 */

export default interface IEntityData {
  id?: number,
  start?: number,
  end?: number,
  probability?: number,
  type?: string,
  normalized_text?: string,
  url?: string,
  expanded_url?: string,
  display_url?: string,
  media_url?: string,
  media_url_https?: string,
  name?: string,
  screen_name?: string,
  sizes?: any,
  images?: any[],
  status?: string,
  title?: string,
  text?: string,
  description?: string,
  indices?: number[],
  unwound_url?: string,
  username?: string,
  tag?: string
}