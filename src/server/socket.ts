import { Server, Socket } from "socket.io"
import EventsGraphService from './lib/EventsGraphService'
import IEventsGraphCollectionContextRequest from "./domain/IEventsGraphCollectionContextRequest"
import IEventsGraphCollectionContextResponse from "./domain/IEventsGraphCollectionContextResponse"
import IGraphEvent from './domain/IGraphEvent'
import IUpdateGraphDataCallback from "./domain/IUpdateGraphDataCallback"
import { RateLimiter } from "limiter"
import { throttle } from "./lib/Throttler"
import IStreamCallback from "./domain/IStreamCallback"
import { GraphDataRequestSchema } from './domain/schemas'

let socket: Socket | Server | undefined
let limiter: RateLimiter
let currentCloseStream: IStreamCallback = () => {}

/**
 * Throttler
 */

const throttledSend = throttle((data: IEventsGraphCollectionContextResponse) => sendGraphDataStreamResponse(data), 10000, {start: true})

/**
 * sendGraphEven
 *
 * @author Kyle Kanouse
 * @description Main function to send event data
 * @param socket sendGraphEvent
 * @constant
 * @returns
 */

const sendGraphEvent = () =>
  (event: IGraphEvent) => { 
    if (socket) { socket.emit("graphEvent", event) } 
  }

/**
 * sendGraphDataResponse
 * 
 * @param {IEventsGraphCollectionContextResponse | undefined} data
 */

const sendGraphDataStreamResponse = (data?: IEventsGraphCollectionContextResponse): void => { 
  
  if (socket&&data) { 

    socket.emit("graphStream", data) 
  }
}

/**
 * graphStreamUpdate
 *
 * @param {Error} error
 * @param {IEventsGraphCollectionContextResponse} data
 */

const graphStreamUpdate: IUpdateGraphDataCallback = (error: Error | null, data?: IEventsGraphCollectionContextResponse, closeStream?: IStreamCallback): void => {

  if (closeStream) {
    currentCloseStream = closeStream
  }

  if (data) {
    sendGraphDataStreamResponse(data)
  }
}

const throttledGraphStreamUpdate: IUpdateGraphDataCallback = (error: Error | null, data?: IEventsGraphCollectionContextResponse): void => {
  if (data) {
    throttledSend(data)
  }
}

/**
 * getRequestFromJSON
 *
 * @param {any} json
 * @returns {IEventsGraphCollectionContextRequest}
 */

const getRequestFromJSON = (json: any): IEventsGraphCollectionContextRequest => {
  return JSON.parse(json) as IEventsGraphCollectionContextRequest
}

// EXPORT
export default (io: Server): void => {

  const events            : Set<IGraphEvent> = new Set()
  let contextRequest      : IEventsGraphCollectionContextRequest

  // Establish Socket connection
  io.on("connection", (s: Socket ) => {
    // console.log('SOCKET | connection()')
    socket = s

    // listen for get Graph node data
    socket.on("getGraphData", (request: any): void => {
      // console.log('SOCKET | ------------ getGraphData() | request = ', request)

      // Validate request with Zod
      let parsed: any
      try {
        parsed = JSON.parse(request)
      } catch (err) {
        console.log('ERROR: SOCKET parsing JSON request string')
        socket?.emit('error', { message: 'Invalid JSON' })
        return
      }

      const parseResult = GraphDataRequestSchema.safeParse(parsed)
      if (!parseResult.success) {
        socket?.emit('error', { message: 'Invalid request', errors: parseResult.error.issues })
        return
      }
      contextRequest = parseResult.data as IEventsGraphCollectionContextRequest

      // Get data from EventsGraph service
      EventsGraphService.getData(contextRequest).then((res: IEventsGraphCollectionContextResponse) => {

        socket?.emit("graphData", res)

      }).catch((res) => {
        console.log('EventsGraphService ERROR: ', res)
      })
    })

    /**
     * getGraphStream
     */

    socket.on("getGraphDataStream", (request: any): void => {
      console.log('SOCKET | ------------ getGraphDataStream() | request = ', request)

      // Validate request with Zod
      let parsed: any
      try {
        parsed = JSON.parse(request)
      } catch (err) {
        console.log('ERROR: SOCKET parsing JSON request string')
        socket?.emit('error', { message: 'Invalid JSON' })
        return
      }

      const parseResult = GraphDataRequestSchema.safeParse(parsed)
      if (!parseResult.success) {
        socket?.emit('error', { message: 'Invalid request', errors: parseResult.error.issues })
        return
      }
      contextRequest = parseResult.data as IEventsGraphCollectionContextRequest

      // Get Stream data from service
      EventsGraphService.getDataStream(contextRequest, graphStreamUpdate)
    })

    /**
     * closeStream
     */
    socket.on("closeStream", (): void => {
      currentCloseStream()
    })

    socket.on("disconnect", (reson: string) => { 
      console.log('--------- SOCKET: DISCONNECT | reson = ', reson)
      currentCloseStream()
    })
  })
}
