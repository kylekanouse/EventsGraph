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

let addUsersInt,
    deleteUsersInt, 
    eventsInt;

/**
 * _createRandomEvent
 */

const _createRandomEvent = (graph) => {

  // Get a random egLink from array of all links to send event with
  const randLink = graph.links[Math.floor(Math.random() * graph.links.length)];
  // Send event
  graph.sendEvent(
    new EventsGraphEvent(randLink)
  );
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

  // EGNode random user is linked to
  linkedToNode = new EventsGraphNode( userNodesWhiteList[Math.floor(Math.random() * userNodesWhiteList.length)] );

  // Add link to node
  user.linkTo(linkedToNode);

  // Add User to graph
  graph.addUser( user );
};

/**
 * _getRandomUser
 */

const _getRandomUser = (graph) => {
  const ids = graph.getUserIds();
  const rand = ids[Math.floor(Math.random() * ids.length)];
  return graph.getUser(rand);
};

/**
 * _removeRandomUser
 */

const _removeRandomUser = (graph) => {
  const user = _getRandomUser(graph);
  if (!user) { return; }
  graph.removeUser(user);
};

/**
 * Export Object
 * 
 * @returns {Object}
 */

export default {

  createRandomEvent: _createRandomEvent,

  createRandomUser: _createRandomUser,

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