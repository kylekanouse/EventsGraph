import React, { useEffect } from "react"
import EventsGraphService from '../lib/EventsGraph'
import IGraphData from "../../server/domain/IGraphData"
import IResponse from "../../server/domain/IEventsGraphCollectionContextResponse"
import IResponseMeta from "../../server/domain/IResponseMeta"
import IEventsGraphCollectionContextRequest from "../../server/domain/IEventsGraphCollectionContextRequest"
import IEventData from "../../server/domain/IEventData"
import HUD from './controls/HUD'

let graph                             : EventsGraphService
let graphRef                          : HTMLElement | null
let isStreaming                       : boolean = false

/**
 * EventsGraph
 *
 * @todo REMOVE: reference to socket and bubble up events to parent domain and let application interface with the socket
 * @param param
 * @returns 
 */

const EventsGraph = ({ socket }: any) => {

  /**
   * requestGraphData
   *
   * @returns {void}
   */

  const requestGraphData = (request: IEventsGraphCollectionContextRequest): void => {

    const emitEvent: string = 'getGraphData' + ((request.isStream) ? 'Stream' : ''),
          progress: number | undefined = (request.isStream) ? 0 : undefined

    // stop any existing stream events
    if (isStreaming) {

      socket.emit( 'closeStream' )

      // Delay so servies can stop sending events before new graph request
      setTimeout((): void => {
        graph.clear().showLoader(progress)
        socket.emit( emitEvent,  JSON.stringify(request))
      }, 2000)

    } else {
      graph.clear().showLoader(progress)
      socket.emit( emitEvent,  JSON.stringify(request))
    }

    isStreaming = request.isStream
  }

  /**
   * graphDataListener
   *
   * @param {IResponse} data 
   */

  const graphDataListener = (data: IResponse): void => {

    const graphData     : IGraphData | undefined    = data.graphData
    const meta          : IResponseMeta             = data.meta

    if (meta.progress) {
      graph.updateProgressText(meta.progress)
    }

    if (graphData) {
      graph.loadGraphData(graphData)
    }
  }

  /**
   * graphDataListener
   *
   * @param {IResponse} data
   */

  const graphStreamDataListener = (data: IResponse) => {
    // console.log('EventsGraph: graphStreamListener() | data = ', data)

    const graphData     : IGraphData | undefined      = data.graphData
    const eventData     : IEventData | undefined      = data.eventData
    const meta          : IResponseMeta               = data.meta

    if (meta.progress) {
      graph.updateProgressText(meta.progress)
    }

    if (graphData) {
      graph.updateGraphData(graphData)
    }

    if (eventData) {
      graph.sendEventFromData( eventData )
    }
  }

  /**
   * loadGraph
   */

  const loadGraph = (): void => {
    if (graphRef) {
      graph = new EventsGraphService( 'events-graph', graphRef )
    }
  }

  // Setup handlers
  socket.on("graphData", graphDataListener)
  socket.on("graphStream", graphStreamDataListener)
  socket.off("graphStream", graphDataListener)

  // Call loadGraph once component is mounted
  useEffect((): void => {
    loadGraph()
  }, [])

  return (
    <div className='events-graph-app'>
      <div className="eventsgraph-graph-wrapper" >
        <HUD onRequestControlsUpdate={requestGraphData}></HUD>
        <div className="graph" ref={ele => graphRef = ele}></div>
      </div>
    </div>
  )
}

// Export
export default EventsGraph