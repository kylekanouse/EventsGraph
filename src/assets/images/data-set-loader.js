function getGraphDataSets() {

  let gData = {
    nodes: [],
    links: []
  };

  const loadMiserables = function(Graph) {
      Graph
          .cooldownTicks(200)
          .nodeLabel('id')
          .nodeAutoColorBy('group')
          .jsonUrl('.graph.data.json');
  };
  loadMiserables.description = "";

  //

  const loadBlocks = function(Graph) {
      fetch('.blocks.json').then(r => r.json()).then(data => {
          data.nodes.forEach(node => { node.name = `${node.user?node.user+': ':''}${node.description || node.id}` });

          Graph
              .cooldownTicks(300)
              .cooldownTime(20000)
              .nodeAutoColorBy('user')
              .forceEngine('ngraph')
              .graphData(data);
      });
  };
  loadBlocks.description = "<em>Blocks</em> data (<a href='https://bl.ocks.org/mbostock/afecf1ce04644ad9036ca146d2084895'>afecf1ce04644ad9036ca146d2084895</a>)";

  //

  const loadD3Dependencies = function(Graph) {
      fetch('.d3.csv').then(r => r.text()).then(d3.csvParse).then(data => {
          const nodes = [], links = [];
          data.forEach(({ size, path }) => {
              const levels = path.split('/'),
                  module = levels.length > 1 ? levels[1] : null,
                  leaf = levels.pop(),
                  parent = levels.join('/');

              nodes.push({
                  path,
                  leaf,
                  module,
                  size: +size || 1
              });

              if (parent) {
                  links.push({ source: parent, target: path});
              }
          });

          Graph
              .cooldownTicks(300)
              .nodeRelSize(0.5)
              .nodeId('path')
              .nodeVal('size')
              .nodeLabel('path')
              .nodeAutoColorBy('module')
              .forceEngine('ngraph')
              .graphData({ nodes: nodes, links: links });
      });
  };
  loadD3Dependencies.description = "<em>D3 dependencies</em> data (<a href='https://bl.ocks.org/mbostock/9a8124ccde3a4e9625bc413b48f14b30'>9a8124ccde3a4e9625bc413b48f14b30</a>)";

  const tunnel = function(Graph) {

      const perimeter = 12, length = 30;

      const getId = (col, row) => `${col},${row}`;

      let nodes = [], links = [];
      for (let colIdx=0; colIdx<perimeter; colIdx++) {
          for (let rowIdx=0; rowIdx<length; rowIdx++) {
              const id = getId(colIdx, rowIdx);
              nodes.push({id});


              if (rowIdx>0) {
                  links.push({ source: getId(colIdx, rowIdx-1), target: id });
              }

              // Link horizontally
              links.push({ source: getId((colIdx || perimeter) - 1, rowIdx), target: id });
          }
      }

      Graph
          .cooldownTicks(300)
          .forceEngine('ngraph')
          .graphData({ nodes: nodes, links: links });
  };
  tunnel.description = "fabric data for a cylindrical tunnel shape";


  const getPolygonID = function(scope, vertices) {
    return scope + "-" + vertices;
  };

  /**
   * createNode
   * 
   * @param {*} id 
   * @param {*} name 
   * @param {*} value 
   */

  const createNode = function (id, name, value) {
    return { 
      "id": id,
      "name": name,
      "val": value
    };
  };

  /**
   * createLink
   * 
   * @param {*} id1 
   * @param {*} id2 
   */

  const createLink = function (id1, id2) {

    return {
      "source": id1,
      "target": id2
    };
  };

  /**
   * createPolygonLinks
   * 
   * @param {*} vertices 
   */

  const createPolygonLinks = function (vertices) {

    let links = [];
    for (let i=1; i<=vertices; i++) {
      // if (i==0) {continue;}
      links.push(
        createLink(
          getPolygonID(vertices, i-1), 
          getPolygonID(vertices, i)
        )
      );
    }

    // Connect the first and last node to complete the link
    if (vertices>2) {
      links.push(
        createLink(
          getPolygonID(vertices, 0), 
          getPolygonID(vertices, vertices - 1)
        )
      );
    }

    return links;
  };

  /**
   * createPolygon
   * 
   * @param {*} vertices 
   */

  const createPolygon = function (vertices) {

    let polygon = [];

    for (let i=0; i<vertices; i++) {
      polygon.push( 
        createNode( 
          getPolygonID(vertices, i), 
          getPolygonID(vertices, i), 
          vertices
        )
      );
    }

    return polygon;
  };

  const emitParticle = function (link) {
    Graph.emitParticle(link);
  };

  /**
   * nodeColor
   * 
   * @param {*} something 
   */

  const nodeColor = function(something) {
    console.log(something);
  } 

  /**
   * getIndexFromID
   * 
   * @param {*} id 
   */

  const getVerticesFromID = function (id) {
    let parts = id.split("-");
    return parts[0];
  };


  /**
   * renderGraph
   * 
   * @param {*} nodes 
   * @param {*} links 
   */

  const renderGraph = function (Graph, nodes, links) {
    Graph
    .cooldownTicks(300)
    .forceEngine('ngraph')
    // .nodeColor(nodeColor)
    .nodeAutoColorBy('val')
    // .linkAutoColorBy('source')
    .linkColor('blue')
    .linkVisibility(true)
    .linkOpacity(0.8)
    .linkWidth(4)
    .linkDirectionalParticleColor(() => 'red')
    .linkDirectionalParticleWidth(6)
    .nodeThreeObject(({ id }) => new THREE.Mesh(
      new THREE.TorusGeometry(10, 1, Math.max(getVerticesFromID(id), 3), Math.max(getVerticesFromID(id), 3) ),
      new THREE.MeshLambertMaterial({
        color: Math.round(Math.random() * Math.pow(2, 24)),
        transparent: false,
        opacity: 0.75
      })
    ))
    .graphData({
        nodes: nodes,
        links: links
    });
  };

  /**
   * polygons
   * 
   * @param {*} Graph 
   */
  
  const polygons = function(Graph) {

    const length = 15;
    const seed = 3;

    for (let n=seed; n<=length; n++) {

      gData.nodes = gData.nodes.concat( createPolygon(n) );
      gData.links = gData.links.concat( createPolygonLinks(n) );

      if (n<=seed) {continue;}

      gData.links.push(
        createLink(
          getPolygonID(n, 0), 
          getPolygonID(n-1, 0)
        )
      );

    }

    renderGraph(Graph, gData.nodes, gData.links);

      
    let increment = 0;

    setInterval(() => {
      const id = (increment % gData.links.length)
      const link = gData.links[Math.floor(Math.random() * gData.links.length)];

      emitParticle(link);
      
      increment++;

    }, 500);
  };
  //

  return [loadMiserables, loadBlocks, loadD3Dependencies, tunnel, polygons];
}