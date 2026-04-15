import IEventsGraphDataRepo from '../../domain/IEventsGraphDataRepo'
import IEventsGraphCollection from '../../domain/IEventsGraphCollection'
import IEventsGraphCollectionContextRequest from '../../domain/IEventsGraphCollectionContextRequest'
import IEventsGraphCollectionContextResponse from '../../domain/IEventsGraphCollectionContextResponse'
import Twitter from './oracles/Twitter'
import BasicNetwork from './oracles/BasicNetwork'
import DummyData from './oracles/DummyData'
import { isStreamable } from '../Utils'
import IUpdateGraphDataCallback from '../../domain/IUpdateGraphDataCallback'

const ERROR_NO_COLLECTION_PREFIX: string = 'Unable to find collection'
const ERROR_NO_STREAM_COLLECTION: string = ERROR_NO_COLLECTION_PREFIX.concat('', 'that is streamable')

/**
 * GraphDataRepo
 *
 * @description
 *
 * Main repository for all GraphData. Data is pulled from different Oracles
 * from various sources and translated into GraphData of Nodes, Liks, and Events
 *
 * @type class
 */

class EventsGraphDataRepo implements IEventsGraphDataRepo {

  /**
   * _repo
   *
   * @description main container for collections
   * @private
   * @type {IEventsGraphCollection[]}
   */

  private _repo: Map<string, IEventsGraphCollection>

  /**
   * Constructor
   *
   * @constructor
   */

  constructor() {
    this._repo = new Map([
      [Twitter.getID(), Twitter],
      [BasicNetwork.getID(), BasicNetwork],
      [DummyData.getID(), DummyData]
    ])
  }

  /**
   * _getCollectionIDfromRequest
   *
   * @param request {IEventsGraphCollectionActionRequest}
   * @returns {string}
   */

  protected _getCollectionIDfromRequest(request: IEventsGraphCollectionContextRequest): string {
    return request.collection.toLowerCase()
  }

  /**
   * getCollectionIDs()
   *
   * @type {function}
   * @returns {string[]}
   */

  public getCollectionIDs() : string[] {
    return [...this._repo.keys()]
  }

  /**
   * getCollectionContextIDs
   *
   * @param collectionID {string}
   * @returns {string[] | void[]}
   */

  public getCollectionContextIDs(collectionID: string) : string[] | void {
    return this._repo.forEach( (collection) => { if (collection.getID() === collectionID) { return collection.getContextIDs() }})
  }

  /**
   * findCollectionByID
   *
   * @param id {string}
   * @returns {IEventsGraphCollection | undefined}
   */

  public findCollectionByID(id: string): IEventsGraphCollection | undefined {
    return this._repo.get( id )
  }

  /**
   * getData
   *
   * @param request {IEventsGraphCollectionContextRequest}
   * @async
   * @returns {Promise<IEventsGraphCollectionContextResponse>}
   */

  public async getData(request: IEventsGraphCollectionContextRequest): Promise<IEventsGraphCollectionContextResponse> {

    // Return Promise
    return new Promise((resolve, reject) => {

      // Search for requested context
      const collection: IEventsGraphCollection | undefined = this.findCollectionByID( this._getCollectionIDfromRequest(request) )

      // If collection found make request
      if (collection !== undefined) {

        // Make request on collection
        collection.getData(request).then((res: IEventsGraphCollectionContextResponse) => {
          resolve(res)
        }).catch((err) => {
          reject(err)
        })

      } else {
        reject( ERROR_NO_COLLECTION_PREFIX.concat(' ', this._getCollectionIDfromRequest(request)) )
      }
    })
  }

  /**
   * getDataStream
   *
   * @param {IEventsGraphCollectionContextRequest} request 
   * @param {IUpdateGraphDataCallback} cb 
   */

  public getDataStream(request: IEventsGraphCollectionContextRequest, cb: IUpdateGraphDataCallback): void {

      // Search for requested context
      const collection: IEventsGraphCollection | undefined = this.findCollectionByID( this._getCollectionIDfromRequest(request) )

      // If found and streamable make request
      if (collection !== undefined && isStreamable(collection)) {     

        // Make call to collection and pass callback
        collection.getDataStream(request, cb)

      } else {
        cb( new Error( ERROR_NO_STREAM_COLLECTION.concat(' ', this._getCollectionIDfromRequest(request)) ))
      }
  }
}

// EXPORT
export default new EventsGraphDataRepo()