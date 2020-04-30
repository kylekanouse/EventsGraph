import EventsGraph from './lib/events-graph.class.mjs';
import MockUp from './lib/activities.mock.mjs';

/**
 * Main Application Clousure
 */

((doc) => {

  // Get Events Graph and 
  const graph = new EventsGraph( 'olycloud', doc.getElementById('3d-graph') )

  //load graph data
  graph.loadGraphDataFromUrl('./data/olycloud.graph.data.json', (data) => {
    console.log("loadDataFromUrl CB ", data);

    // Start Mock Activity
    MockUp.startMockEGEvents(graph);
    //MockUp.startMockEGUsers();
  });

  doc.getElementById('add-user-btn').addEventListener('click', (e) => {
    //console.log('---> Click: ', e);
    // MockUp.createRandomEvent();
    MockUp.createRandomUser(graph);
  });

  doc.getElementById('remove-user-btn').addEventListener('click', (e) => {
    //console.log('---> Click: ', e);
    // MockUp.createRandomEvent();
    MockUp.removeRandomUser(graph);
  });

})(document);