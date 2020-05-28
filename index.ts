import EventsGraph from './lib/events-graph.class';
import MockUp from './lib/activities.mock';
import "./assets/css/style.css";

/**
 * loadGraph
 * 
 * @param {Document} doc 
 */

const loadGraph = (doc: Document): void => {

  // Create Events Graph
  const graph = new EventsGraph( 'eventsgraph', doc.getElementById('3d-graph'), doc.getElementById('hud') );

  //load graph data
  graph.loadGraphDataFromUrl('./data/mock.graph.data.json', (data: any) => {

    // Start Mock Activity
    MockUp.startMockEGEvents(graph);
    //MockUp.startMockEGUsers();

    // SETUP  Users Controls
    doc.getElementById('add-user-btn')
    .addEventListener('click', (e) => {
      MockUp.createRandomUser(graph);
      return;
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

    return {};
  });
};

/**
 * removeOverlay
 * 
 * @param {Document} doc 
 */

const removeOverlay = (doc: Document): void => {
  doc.getElementById('overlay-wrapper').style.display = "none";
};

/**
 * Main Application Clousure
 */

((doc: Document) => {

  MockUp.loadEvents('./data/mock.events.data.json');

  doc.getElementById('startBtn')
  .addEventListener('click', (e) => {
    loadGraph(doc);
    removeOverlay(doc);
  });

})(document);