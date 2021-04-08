import Utils from './utils';
import EventsGraph from './events-graph.class';
import EventsGraphEvent from './events-graph-event.class';
import EventsGraphNode from './events-graph-node.class';
import EventsGraphUser from './events-graph-user.class';
import EventsGraphLink from './events-graph-link.class';

const mockEventsInterval = 3000;

/**
 * MockUp
 * 
 * Object used to simulate activity
 */

const userNodesWhiteList = ['olycloud.catalog', 'olycloud.distribution','olycloud.assets', 'olycloud.ingestion'];

let eventData,
    addUsersInt,
    deleteUsersInt, 
    eventsInt;

/**
 * _createRandomEvent
 */

const _createRandomEvent = (graph: EventsGraph): void => {

  if (!graph.links.length) { return; }

  const randIndex = Math.floor(Math.random() * graph.links.length);

  // // Get a random link from array of all links to send event with
  const randLink = <any> graph.links[randIndex];

  // // Create a new event
  const randEvent = graph.createEvent(randLink);

  // Fill in event data with mock data
  if (randLink.sourceNode.type == 'user') {
    randEvent.data = _getRandomUserEventData();
  } else {
    randEvent.data = _getEventDataByLink(randLink);
  }

  // Send event
  graph.sendEvent(randEvent);
};

/**
 * _createRandomUser
 */

const _createRandomUser = (graph: EventsGraph): void => {

  let linkedToNode,
      randUserID,
      user;

  // Created Random User ID
  randUserID = Math.floor(Math.random() * 100000);

  // Create Random User to add to graph
  user = new EventsGraphUser( randUserID );

  // Node random user is linked to
  linkedToNode = new EventsGraphNode( userNodesWhiteList[Math.floor(Math.random() * userNodesWhiteList.length)] );

  // Add link to node
  user.linkTo( linkedToNode );

  // Add User to graph
  graph.addUser( user );
};

/**
 * _getEventByLink
 * 
 * @param {EventsGraphLink} link 
 * 
 * @returns {Array}
 */

const _getEventDataByLink = (link: EventsGraphLink): any => {
  if (!eventData) { return false; }
  return eventData.find((event: any) => 
    event.source == link.source && 
    event.target == link.target
  );
};

/**
 *  _getRandomUserEventData
 * 
 * @returns {Object}
 */

const _getRandomUserEventData = (): any => {
  if (!eventData) {return false;}
  // Get all user specific events
  let userEvents = eventData.filter((event: any) => 
    event.type == 'user'
  );

  // Pick a random event and return
  return userEvents[Math.floor(Math.random()*userEvents.length)];
};

/**
 * _getRandomUser
 * 
 * @param {EventsGraph} graph
 * 
 * @returns {EventsGraphUser}
 */

const _getRandomUser = (graph: EventsGraph): EventsGraphUser|false => {

  const ids = graph.getUserIds();
  
  if (!ids) { return false; }

  // Pick an existing user id at random
  const randUserId = ids[Math.floor(Math.random() * ids.length)];

  // Return user
  return graph.getUser(randUserId);
};

/**
 * _removeRandomUser
 * 
 * @param {EventsGraph} graph
 */

const _removeRandomUser = (graph: EventsGraph): void => {
  const user = _getRandomUser(graph);
  if (user) {
    graph.removeUser(user);
  }
};

/**
 * loadEvents
 * 
 * @param url {string}
 */

const _loadEvents = (url: string): void => {

  Utils.loadJSON(url, (result: any) => {
    try {
      result = <any> JSON.parse(result);
      eventData = result.events;
    } catch(err){
      console.log('Unable to parse JSON | message = ', err.message);
    }
    return {};
  });

};

/**
 * Export Object
 * 
 * @returns {Object}
 */

export default {

  createRandomEvent: _createRandomEvent,

  createRandomUser: _createRandomUser,

  loadEvents: _loadEvents,

  /**
   * startMockEGEvents
   */

  startMockEGEvents: (graph: EventsGraph): void => {
    eventsInt = setInterval( _createRandomEvent, mockEventsInterval, graph );
    // setTimeout(function() {
    //   _createRandomEvent(graph);
    //   _createRandomEvent(graph);
    //   _createRandomEvent(graph);
    //  }, 1000);
    
  },

  /**
   * stopMockEGEvents
   */

  stopMockEGEvents: (): void => {
    clearInterval( eventsInt );
  },

  /**
   * startMockEGUsers
   */

  startMockEGUsers: (graph: EventsGraph): void => {

    _createRandomUser(graph);

    /**
     * simulating users being added
     */

    addUsersInt = setInterval( _createRandomUser, 12000, graph );

    /**
     * Simulating Users leaving
     */

    //deleteUsersInt = setInterval( _removeRandomUser, 20000 );
  },

  removeRandomUser: _removeRandomUser,

  /**
   * stopMockEGUsers
   */

  stopMockEGUsers: (): void => {
    clearInterval( addUsersInt );
    // clearInterval( deletUsersInt );
  }
};