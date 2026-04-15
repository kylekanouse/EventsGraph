import React, { useEffect } from "react"
import EventsGraphRenderer from '../lib/EventsGraph'
import IGraphData from "../../server/domain/IGraphData"
import IResponse from "../../server/domain/IEventsGraphCollectionContextResponse"
import IResponseMeta from "../../server/domain/IResponseMeta"
import IEventsGraphCollectionContextRequest from "../../server/domain/IEventsGraphCollectionContextRequest"
import IEventData from "../../server/domain/IEventData"
import GraphDataService from '../lib/GraphDataService'
import HUD from './controls/HUD'

let graph                             : EventsGraphRenderer
let graphRef                          : HTMLElement | null
let dataService                       : GraphDataService

/**
 * EventsGraph
 *
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
    dataService.requestData(request, (progress: number | undefined): void => {
      graph.clear().showLoader(progress)
    })
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
   * graphStreamDataListener
   *
   * @param {IResponse} data
   */

  const graphStreamDataListener = (data: IResponse) => {

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
      graph.sendEventFromData(eventData)
    }
  }

  /**
   * loadGraph
   */

  const loadGraph = (): void => {
    if (graphRef) {
      graph = new EventsGraphRenderer('events-graph', graphRef)

      // Initialize data service and subscribe to socket events
      dataService = new GraphDataService(socket)
      dataService
        .onGraphData(graphDataListener)
        .onGraphStream(graphStreamDataListener)
    }
  }

  // Call loadGraph once component is mounted
  useEffect((): void => {
    loadGraph()
  }, [])

  return (
    <div className='events-graph-app' data-mode='scene-focus'>
      <div className="eventsgraph-graph-wrapper" >
        <HUD onRequestControlsUpdate={requestGraphData}></HUD>
        <div className="graph" ref={ele => graphRef = ele}></div>
      </div>
    </div>
  )
}

// Export
export default EventsGraph