import IEventsGraphCollectionContextResponse from '../../../domain/IEventsGraphCollectionContextResponse'
import IEventsGraphCollectionContextRequest from '../../../domain/IEventsGraphCollectionContextRequest'
import IEventsGraphCollectionContext from '../../../domain/IEventsGraphCollectionContext'
import IUpdateGraphDataCallback from '../../../domain/IUpdateGraphDataCallback'
import IEventsGraphCollection from '../../../domain/IEventsGraphCollection'

/**
 * Oracle
 *
 * @type abstract
 * @description Used to contain all common Oracle funcitonality
 */

 export default abstract class Oracle implements IEventsGraphCollection {

  private _contexts: IEventsGraphCollectionContext[] = []

  protected _isStreamable: boolean = false

  private _id: string

  /**
   * constructor
   *
   * @param id {string}
   */

  constructor(id: string, contexts: IEventsGraphCollectionContext[]) {
    this._id            = id
    this._contexts      = contexts
  }

  protected _isStreamble(): boolean {
    return this._isStreamable
  }

  /**
   * _getContextfromRequest
   *
   * @param request {IEventsGraphCollectionActionRequest}
   * @returns {string}
   */

  protected _getContextfromRequest(request: IEventsGraphCollectionContextRequest): string {
    return request.context.toLowerCase()
  }

  /**console.log('GraphDataRepo | getGraphData() | oracle found. ', oracle)
   * getID
   *
   * @returns {string}
   */

  public getID(): string {
    return this._id
  }

  /**
   * getActions
   *
   * @returns {IEventsGraphCollectionAction[]}
   */

  public getContexts(): IEventsGraphCollectionContext[] {
    return this._contexts
  }

  /**
   * getContextIDs
   *
   * @description list of Context IDs that can be requested from the oracle to return various graph data sets
   * @abstract
   * @returns {string[]}
   */

  public getContextIDs(): string[] {
    return this._contexts.map(c => c.getID())
  }

  /**
   * findContextByID
   *
   * @param id {string}
   * @returns {IEventsGraphCollectionContext | undefined}
   */

  public findContextByID(id: string): IEventsGraphCollectionContext | undefined {
    return this._contexts.find( a => a.getID() === id )
  }

  /**
   * getData
   *
   * @param request {IEventsGraphCollectionContextRequest}
   * @returns Promise<IEventsGraphCollectionContextResponse>
   */

   public async getData(request: IEventsGraphCollectionContextRequest): Promise<IEventsGraphCollectionContextResponse> {

    // Return Promise with result
    return new Promise((resolve, reject) => {

      // Search for requested context
      const context: IEventsGraphCollectionContext | undefined = this.findContextByID( this._getContextfromRequest(request) )

      // If found make request
      if (context !== undefined) {
        context.getData(request).then((res) => {
          resolve(res)
        }).catch((err) => {
          reject(err)
        });
      } else {
        reject(`Unable to find context "${this._getContextfromRequest(request)}"`)
      }
    })
  }


  /**
   * getDataStream
   *
   * @param {IEventsGraphCollectionContextRequest} request 
   * @param {IUpdateGraphDataCallbac} cb 
   */

   public getDataStream(request: IEventsGraphCollectionContextRequest, cb: IUpdateGraphDataCallback): void {

    // Search for requested context
    const context: IEventsGraphCollectionContext | undefined = this.findContextByID( this._getContextfromRequest(request) )

    // If found and streamable make request
    if (context !== undefined && context.isStreamable()) {
      context.getDataStream(request, cb)
    } else {
      cb(new Error(`Unable to find context stream "${this._getContextfromRequest(request)}"`))
    }
  }
}
