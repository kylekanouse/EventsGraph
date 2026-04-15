/**
 * IGraphLink
 *
 * @interface
 */
export default interface IGraphLink {
  source: string,
  target: string,
  label?: string,
  val?: number,
  type?: string
}