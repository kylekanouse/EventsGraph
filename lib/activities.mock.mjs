import Utils from './utils.mjs';
import EventsGraph from './events-graph.class.mjs';
import EventsGraphEvent from './events-graph-event.class.mjs';
import EventsGraphNode from './events-graph-node.class.mjs';
import EventsGraphUser from './events-graph-user.class.mjs';

/**
 * MockUp
 * 
 * Object used to simulate activity
 */

const userNodesWhiteList = ['olycloud.catalog', 'olycloud.distribution','olycloud.assets', 'olycloud.ingestion'];

let events,
    addUsersInt,
    deleteUsersInt, 
    eventsInt;

/**
 * _createRandomEvent
 */

const _createRandomEvent = (graph) => {

  // // Get a random link from array of all links to send event with
  const randLink = graph.links[Math.floor(Math.random() * graph.links.length)];

  // console.log('_createRandomEvent() | randLink = ', randLink);

  // // Create a new event
  const event = graph.createEvent(randLink);

  // Fill in event data with mock data
  if (randLink.sourceNode.type == 'user') {
    event.data = _getRandomUserEventData();
  } else {
    event.data = _getEventDataByLink(randLink);
  }

  // Send event
  graph.sendEvent(event);
};

/**
 * _createRandomUser
 */

const _createRandomUser = (graph) => {

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

const _getEventDataByLink = (link) => {
  return events.find(event => 
    event.source == link.source && 
    event.target == link.target
  );
};

/**
 *  _getRandomUserEventData
 * 
 * @returns {Object}
 */

const _getRandomUserEventData = () => {

  // Get all user specific events
  let userEvents = events.filter(event => 
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

const _getRandomUser = (graph) => {

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

const _removeRandomUser = (graph) => {
  const user = _getRandomUser(graph);
  if (!user) { return; }
  graph.removeUser(user);
};

/**
 * loadEvents
 * 
 * @param url {String}
 */

const _loadEvents = (url) => {
  Utils.loadJSON(url, (result) => {
    try {
      result = JSON.parse(result);
      events = result.events;
      console.log(events);
    } catch(err){
      console.log('Unable to parse JSON | message = ', err.message);
    }
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

  startMockEGEvents: (graph) => {
    eventsInt = setInterval( _createRandomEvent, 500, graph );
  },

  /**
   * stopMockEGEvents
   */

  stopMockEGEvents: () => {
    clearInterval( eventsInt );
  },

  /**
   * startMockEGUsers
   */

  startMockEGUsers: (graph) => {

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

  stopMockEGUsers: () => {
    clearInterval( addUsersInt );
    clearInterval( deletUsersInt );
  }
};