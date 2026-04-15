
export declare type ResponseStatus = "pending" | "error" | "completed"

/**
 * IResponseMeta
 *
 * @interface
 */

export default interface IResponseMeta {
  status?: ResponseStatus,
  progress?: number,
  timeSent: string
}