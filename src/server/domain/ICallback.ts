/**
 * ICallback
 *
 * @interface
 */

 export default interface ICallback {
  ( error: Error | null, data?: any ) : void
}