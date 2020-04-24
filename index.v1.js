/**
 * Testing VR Force-Directed Graph
 * 
 * @ref https://bl.ocks.org/vasturiano/972ca4f3e8e074dacf14d7071aad8ef9
 */

((doc) => {

  ///// DATA LOADER VERSION
  const Graph = ForceGraphVR()
	(document.getElementById("3d-graph"));

  let curDataSetIdx;
  const dataSets = getGraphDataSets();

  let toggleData;
  (toggleData = function() {
    curDataSetIdx = curDataSetIdx === undefined ? 0 : (curDataSetIdx+1)%dataSets.length;
    const dataSet = dataSets[curDataSetIdx];

    Graph.resetProps(); // Wipe current state
    dataSet(Graph); // Load data set

    document.getElementById('graph-data-description').innerHTML = dataSet.description ? `Viewing ${dataSet.description}` : '';
  })();
})(document);