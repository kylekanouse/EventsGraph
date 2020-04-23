/**
 * MockUp
 */

let MockUp = (function(doc){

  let addUsersInt,
      deleteUsersInt, 
      eventsInt,
      nodesList = ['olycloud.catalog', 'olycloud.distribution','olycloud.assets', 'olycloud.ingestion'];

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

    const gData = _getGraph().data,
    link = gData.links[Math.floor(Math.random() * gData.links.length)];
    _getGraph().emitParticle(link);
  };

  /**
   * _createRandomUser
   */

  const _createRandomUser = () => {

    const egLinks = _getGraph().egLinks;
    let randUserID,
        egLink,
        user;

    // Created Random User ID
    randUserID = Math.floor(Math.random() * 100000);

    // Create Random User to add to graph
    user = new EventsGraphUser(randUserID, null, 33, 33, null, './assets/images/user.icon.jpg');

    egLink = new EventsGraphLink(user.id, nodesList[Math.floor(Math.random() * nodesList.length)] );

    // Add Random Link to attach to node
    user.egLink = egLink;

    console.log('===> Create User | ID = ', user.id);
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
    // console.log('===> REMOVE User ')
    // console.log(user);
    _getGraph().removeUser( user );
  };

  /**
   * Return MockUp Object
   */

  return {

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
    
        addUsersInt = setInterval( _createRandomUser, 10000 );
    
        /**
         * Simulating Users leaving
         */
    
        deleteUsersInt = setInterval( _removeRandomUser, 20000 );
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