import IEventsGraphCollectionContext from "../../domain/IEventsGraphCollectionContext"
import IEventsGraphCollectionContextRequest from "../../domain/IEventsGraphCollectionContextRequest"
import IEventsGraphCollectionContextResponse from "../../domain/IEventsGraphCollectionContextResponse"
import IUpdateGraphDataCallback from "../../domain/IUpdateGraphDataCallback"

/**
 * Context
 * 
 * @abstract
 * @class
 * @implements {IEventsGraphCollectionContext}
 */
export abstract class Context implements IEventsGraphCollectionContext {

  protected abstract _id: string

  /**
   * getID
   *
   * @returns string
   */

  public getID(): string {
    return this._id
  }

  /**
   * isStreamable
   *
   * @type {boolean}
   */

  abstract isStreamable(): boolean

  /**
   * getData
   *
   * @param request {IEventsGraphCollectionContextRequest}
   * @returns Promise<IEventsGraphCollectionContextResponse>
   */
   
  abstract getData(request: IEventsGraphCollectionContextRequest): Promise<IEventsGraphCollectionContextResponse>

  /**
   * 
   * @param {IEventsGraphCollectionContextRequest} request 
   * @param {IUpdateGraphDataCallback} cb 
   */

  abstract getDataStream(request: IEventsGraphCollectionContextRequest, cb: IUpdateGraphDataCallback): void
}