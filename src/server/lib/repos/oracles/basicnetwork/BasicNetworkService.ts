import IEventsGraphCollectionContextRequest from '../../../../domain/IEventsGraphCollectionContextRequest'
import IEventsGraphCollectionContextResponse from '../../../../domain/IEventsGraphCollectionContextResponse'
import IGraphData from '../../../../domain/IGraphData'
import IUpdateGraphDataCallback from '../../../../domain/IUpdateGraphDataCallback'
import { buildResponse } from '../../../Utils'

// Get dummy data from JSON
// import graphJSON from './data/mock.graph.data.json'
import IEventData from '../../../../domain/IEventData'
import { MockData } from './MockData'

/**
 * eventIntervalTime
 *
 * @type {number}
 */

const eventIntervalTime: number = 1000

/**
 * eventsInterval
 *
 * @type {ReturnType<typeof setInterval>}
 */

let eventsInterval: ReturnType<typeof setInterval>

/**
 * closeStrream
 *
 * @description closure function to clear interval sustaining events
 */

const closeStream = () => {
  clearInterval(eventsInterval)
}

/**
 * sendDummyEvent
 *
 * @param {IEventsGraphCollectionContextRequest} request
 * @param {IUpdateGraphDataCallback} cb
 */

const sendDummyEvent = (request: IEventsGraphCollectionContextRequest, cb: IUpdateGraphDataCallback): void => {

  // Send dummy event back through calllback
  cb( null, buildResponse( request, undefined, MockData.getRandomEventData() ), closeStream)
}

/**
 * BasicNetworkService
 *
 * @namespace
 */

export namespace BasicNetworkService {

  /**
   * getOperationsData
   *
   * @param {IEventsGraphCollectionContextRequest} request
   * @returns {Promise<IEventsGraphCollectionContextResponse>}
   */

  export function getOperationsData(request: IEventsGraphCollectionContextRequest): Promise<IEventsGraphCollectionContextResponse> {

    return new Promise( async (resolve, reject) => {
      resolve( buildResponse( request, MockData.getDummyGraphData() ) )
    })
  }

  /**
   * listenToStream
   *
   * @param {IUpdateGraphDataCallback} cb
   * @param {IEventsGraphCollectionContextRequest} request
   */

   export function listenToStream(params: any | undefined, request: IEventsGraphCollectionContextRequest, cb: IUpdateGraphDataCallback) : void {

    // Send initial graph data
    cb( null, buildResponse( request, MockData.getDummyGraphData() ), closeStream )

    console.log('BasicNetwork | listenToStream | eventsInterval = ', eventsInterval)
    if (eventsInterval) {
      closeStream()
    }

    // Setup interval to mimic stream of event data
    eventsInterval = setInterval( () => {
      sendDummyEvent(request, cb)
    }, eventIntervalTime )
  }
}