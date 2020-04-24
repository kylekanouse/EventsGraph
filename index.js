((doc) => {

  // Get Events Graph
  const eGraph = doc.eGraph = new EventsGraph('olycloud', doc.getElementById('3d-graph'), [], []);

  //load graph data
  eGraph.loadDataFromUrl('.olycloud.graph.data.json', (data) => {
    console.log("loadDataFromUrl CB ", data);

    // Start Mock Activity
    MockUp.startMockEGEvents();
    //MockUp.startMockEGUsers();
  });

  doc.getElementById('add-user-btn').addEventListener('click', (e) => {
    //console.log('---> Click: ', e);
    // MockUp.createRandomEvent();
    MockUp.createRandomUser();
    console.log(eGraph);
  });

  doc.getElementById('remove-user-btn').addEventListener('click', (e) => {
    //console.log('---> Click: ', e);
    // MockUp.createRandomEvent();
    MockUp.removeRandomUser();
  });
})(document);