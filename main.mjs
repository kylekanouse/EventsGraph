import EventsGraph from './lib/events-graph.class.mjs';
import MockUp from './lib/activities.mock.mjs';

let camera, scene, renderer;

/**
 * loadGraph
 * 
 * @param {Document} doc 
 */

const loadGraph = (doc) => {

  // Get Events Graph and 
  const graph = new EventsGraph( 'olycloud', doc.getElementById('3d-graph') );

  //load graph data
  graph.loadGraphDataFromUrl('./data/olycloud.graph.data.json', (data) => {

    // Start Mock Activity
    //MockUp.startMockEGEvents(graph);
    //MockUp.startMockEGUsers();

    // SETUP  Users Controls
    doc.getElementById('add-user-btn')
    .addEventListener('click', (e) => {
      MockUp.createRandomUser(graph);
    });

    doc.getElementById('remove-user-btn')
      .addEventListener('click', (e) => {
        MockUp.removeRandomUser(graph);
      });

    // SETUP Event Controls
    doc.getElementById('add-event-btn')
      .addEventListener('click', (e) => {
        MockUp.createRandomEvent(graph);
      });
  }); 
};

/**
 * removeOverlay
 * 
 * @param {Document} doc 
 */

const removeOverlay = (doc) => {
  doc.getElementById('overlay-wrapper').style.display = "none";
};

/**
 * Main Application Clousure
 */

((doc) => {

  MockUp.loadEvents('./data/olycloud.events.data.json');

  doc.getElementById('startBtn')
  .addEventListener('click', (e) => {
    loadGraph(doc);
    removeOverlay(doc);
  });

})(document);