/**
 * Main Application Clousure
 */

((doc) => {

  // Get Events Graph and store on document
  doc.eGraph = new EventsGraph( 'olycloud', doc.getElementById('3d-graph') );

  //load graph data
  doc.eGraph.loadGraphDataFromUrl('.olycloud.graph.data.json', (data) => {
    console.log("loadDataFromUrl CB ", data);

    // Start Mock Activity
    MockUp.startMockEGEvents();
    //MockUp.startMockEGUsers();
  });

  doc.getElementById('add-user-btn').addEventListener('click', (e) => {
    //console.log('---> Click: ', e);
    // MockUp.createRandomEvent();
    MockUp.createRandomUser();
  });

  doc.getElementById('remove-user-btn').addEventListener('click', (e) => {
    //console.log('---> Click: ', e);
    // MockUp.createRandomEvent();
    MockUp.removeRandomUser();
  });

})(document);