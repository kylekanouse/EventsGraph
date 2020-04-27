/**
 * MockUp
 * 
 * Object used to simulate activity
 */

let MockUp = ( function(doc) {

  let addUsersInt,
      deleteUsersInt, 
      eventsInt,
      userNodesWhiteList = ['olycloud.catalog', 'olycloud.distribution','olycloud.assets', 'olycloud.ingestion'];

  /**
   * _getGraph
   * 
   * @returns {EventsGraph}
   */

  const _getGraph = () => {
    return doc.eGraph;
  };

  /**
   * _createRandomEvent
   */

  const _createRandomEvent = () => {

    // Get a random egLink from array of all links to send event with
    const randLink = _getGraph().links[Math.floor(Math.random() * _getGraph().links.length)];

    // Send event
    _getGraph().sendEvent(
      new EventsGraphEvent(randLink)
    );
  };

  /**
   * _createRandomUser
   */

  const _createRandomUser = () => {

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
    _getGraph().addUser( user );
  };

  /**
   * _getRandomUser
   */

  const _getRandomUser = () => {
    const ids = _getGraph().getUserIds();
    const rand = ids[Math.floor(Math.random() * ids.length)];
    return _getGraph().getUser(rand);   
  };

  /**
   * _removeRandomUser
   */

  const _removeRandomUser = () => {
    const user = _getRandomUser();
    if (!user) {return;}
    _getGraph().removeUser( user );
  };

  /**
   * Return MockUp Object
   */

  return {

    createRandomEvent: _createRandomEvent,

    createRandomUser: _createRandomUser,

    /**
     * startMockEGEvents
     */

    startMockEGEvents: () => {
      eventsInt = setInterval( _createRandomEvent, 500 );
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

    startMockEGUsers: () => {

      _createRandomUser();

      /**
       * simulating users being added
       */
  
      addUsersInt = setInterval( _createRandomUser, 12000 );
  
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

}(document));