import * as React from 'react'
import {AppProps, AppStates} from "../../server/domain/IApp"
import io from "socket.io-client"
import EventsGraph from './EventsGraph'

// Get socket connection
const socket = io(__WS_SERVICE_URL__)

/**
 * App
 * 
 * @class
 * @extends {React.Component<AppProps, AppStates>}
 */

export default class App extends React.Component<AppProps, AppStates> {

  render() {
    return (
      <EventsGraph socket={socket} />
    )
  }
}
