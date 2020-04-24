/**
 * MockUp
 */

let MockUp = (function(doc) {

  let addUsersInt,
      deleteUsersInt, 
      eventsInt,
      userNodesWhiteList = ['olycloud.catalog', 'olycloud.distribution','olycloud.assets', 'olycloud.ingestion'];

  /**
   * _getGraph
   */

  const _getGraph = () => {
    return doc.eGraph;
  };

  /**
   * _createRandomEvent
   */

  const _createRandomEvent = () => {
    // Get a random egLink from array of all links to send event with
    const randEGLink = _getGraph().egLinks[Math.floor(Math.random() * _getGraph().egLinks.length)];
    //console.log('_createRandomEvent() | length = ', _getGraph().egLinks.length);
    // Send event
    _getGraph().sendEvent(
      new EventsGraphEvent( randEGLink )
    );
  };

  /**
   * _createRandomUser
   */

  const _createRandomUser = () => {

    let randUserID,
        user;

    // Created Random User ID
    randUserID = Math.floor(Math.random() * 100000);

    // Create Random User to add to graph
    user = new EventsGraphUser(randUserID, null, 33, 33, null, './assets/images/user.icon.jpg');

    // Create link to node
    user.createLink(user.id, userNodesWhiteList[Math.floor(Math.random() * userNodesWhiteList.length)] );

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
    // console.log('===> REMOVE User ')
    // console.log(user);
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