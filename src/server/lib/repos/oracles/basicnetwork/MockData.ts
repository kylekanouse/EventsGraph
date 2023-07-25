import IEventData from '../../../../domain/IEventData'
import IGraphData from '../../../../domain/IGraphData'
import IGraphLink from '../../../../domain/IGraphLink'
import eventsJSON from './data/mock.events.data.json'
import graphJSON from './data/mock.graph.data.json'
// import graphJSON from './mock.graph.data.basic.json'

// Get graph data from JSON object
const graphData: IGraphData = graphJSON as IGraphData

// Get events from JSON object
const { events } =  eventsJSON

// Setup whitelist of nodes to be used for mock user data
const userNodesWhiteList = ['basicnetwork.catalog', 'basicnetwork.distribution','basicnetwork.assets', 'basicnetwork.ingestion']

/**
 * MockData
 *
 * @description main domain for handling dummy mock data for basicnetwork service
 * @namespace
 */

export namespace MockData {

  /**
   * getRandomEvent
   *
   * @returns {EventsGraphEvent}
   */

  export function getRandomEventData(): IEventData {

    // Use random index from mock graph data
    const randIndex = Math.floor(Math.random() * graphData.links.length)

    // Get a random link from array of all links to send event with
    const randLink: IGraphLink = <IGraphLink> graphData.links[randIndex]

    // Use random index from mock graph data
    const randEventIndex = Math.floor(Math.random() * events.length)

    const randEvent: IEventData = events[randEventIndex] as IEventData

    randEvent.source = randLink.source
    randEvent.target = randLink.target
  
    // Fill in event data with mock data
    // if (randLink.type == 'user') {
    //   randEvent.data = _getRandomUserEventData()
    // } else {
    //   const data = _getEventDataByLink(randLink)
    //   if (data) {
    //     randEvent.data = data
    //   }
    // }

    // return event
    return randEvent
  }

  /**
   * getDummyGraphData
   *
   * {IGraphData} @returns
   */

  export function getDummyGraphData(): IGraphData {
    return graphData
  }
}
