import { Socket } from 'socket.io-client'
import IEventsGraphCollectionContextRequest from "../../server/domain/IEventsGraphCollectionContextRequest"
import IEventsGraphCollectionContextResponse from "../../server/domain/IEventsGraphCollectionContextResponse"
import IGraphData from "../../server/domain/IGraphData"
import IEventData from "../../server/domain/IEventData"
import IResponseMeta from "../../server/domain/IResponseMeta"

type GraphDataCallback = (response: IEventsGraphCollectionContextResponse) => void

/**
 * GraphDataService
 *
 * @description Service layer that manages Socket.IO connection for graph data.
 *              Component becomes a consumer that subscribes to data updates.
 */

export default class GraphDataService {

  private _socket: Socket
  private _isStreaming: boolean = false
  private _graphDataCallback: GraphDataCallback | undefined
  private _graphStreamCallback: GraphDataCallback | undefined

  constructor(socket: Socket) {
    this._socket = socket
  }

  /**
   * onGraphData
   *
   * @description Subscribe to graph data responses
   */

  onGraphData(callback: GraphDataCallback): GraphDataService {
    this._graphDataCallback = callback
    this._socket.on("graphData", (data: IEventsGraphCollectionContextResponse) => {
      if (this._graphDataCallback) {
        this._graphDataCallback(data)
      }
    })
    return this
  }

  /**
   * onGraphStream
   *
   * @description Subscribe to graph stream responses
   */

  onGraphStream(callback: GraphDataCallback): GraphDataService {
    this._graphStreamCallback = callback
    this._socket.on("graphStream", (data: IEventsGraphCollectionContextResponse) => {
      if (this._graphStreamCallback) {
        this._graphStreamCallback(data)
      }
    })
    this._socket.off("graphStream", this._graphDataCallback as any)
    return this
  }

  /**
   * requestData
   *
   * @description Send a data request through the socket, handling stream close/open
   * @param request
   * @param onBeforeEmit callback invoked before emitting (e.g., to clear graph / show loader)
   */

  requestData(
    request: IEventsGraphCollectionContextRequest,
    onBeforeEmit: (progress: number | undefined) => void
  ): void {

    const emitEvent: string = 'getGraphData' + ((request.isStream) ? 'Stream' : '')
    const progress: number | undefined = (request.isStream) ? 0 : undefined

    if (this._isStreaming) {
      this._socket.emit('closeStream')

      // Delay so services can stop sending events before new graph request
      setTimeout((): void => {
        onBeforeEmit(progress)
        this._socket.emit(emitEvent, JSON.stringify(request))
      }, 2000)
    } else {
      onBeforeEmit(progress)
      this._socket.emit(emitEvent, JSON.stringify(request))
    }

    this._isStreaming = request.isStream
  }

  /**
   * dispose
   *
   * @description Clean up socket listeners
   */

  dispose(): void {
    this._socket.off("graphData")
    this._socket.off("graphStream")
  }
}
