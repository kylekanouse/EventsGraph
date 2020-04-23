function getGraphDataSets() {

  let gData = {
    nodes: [],
    links: []
  };

  const colors = [0xAAAAAA , 0xFF9992, 0xBF9232]

  const loadJSON = function (url, callback) {   

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }

  // const loadOlyCloud = function(Graph) {
  //     Graph
  //         .cooldownTicks(200)
  //         .nodeLabel('id')
  //         .nodeAutoColorBy('group')
  //         .jsonUrl('.olycloud.graph.data.json');
  // };
  // loadOlyCloud.description = "";


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

  const renderGraph = function (Graph, data) {
    Graph
    .cooldownTicks(500)
    .forceEngine('ngraph')
    // .nodeColor(nodeColor)
    .nodeLabel('label')
    .nodeVal('value')
    .nodeAutoColorBy('group')
    .nodeRelSize(3)
    // .linkVisibility(true)
    .linkAutoColorBy('value')
    .linkOpacity(0.3)
    .linkWidth(0.8)
    // .linkDirectionalParticles(0)
    .linkDirectionalParticleSpeed(0.01)
    .linkDirectionalParticleResolution(100)
    .linkDirectionalParticleColor(() => 'red')
    .linkDirectionalParticleWidth(4)
    // .linkColor('blue')
    .linkThreeObjectExtend(true)
    .linkThreeObject(link => {
      // extend link with text sprite
      const sprite = new SpriteText(`${link.source} > ${link.target}`);
      sprite.color = 'lightgrey';
      sprite.textHeight = 1.5;
      return sprite;
    })
    .linkPositionUpdate((sprite, { start, end }) => {
      const middlePos = Object.assign(...['x', 'y', 'z'].map(c => ({
          [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
      })));

      // Position sprite
      Object.assign(sprite.position, middlePos);
    })
    .nodeThreeObject((node) => {

      if (node.image) {
        const imgTexture = new THREE.TextureLoader().load(node.image);
        const material = new THREE.SpriteMaterial({ map: imgTexture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(12, 12);
        return sprite;
      }

      return false;
    })
    // .nodeThreeObject(({ group }) => new THREE.Mesh(
    //   new THREE.TorusGeometry( (20 - (group * 3)), 5, group*3, group*3 ),
    //   new THREE.MeshLambertMaterial({
    //     color: (group * 100),
    //     transparent: false,
    //     opacity: 0.75
    //   })
    // ));

    if (typeof data == "string") {
      Graph.jsonUrl(data);
    } else if (typeof data == "object") {
      Graph.graphData(data);
    }
  };

  /**
   * loadOlyCloud
   * 
   * @param {*} Graph 
   */
  
  const loadOlyCloud = function(Graph) {

    const url = '.olycloud.graph.data.json';
    loadJSON (url, (result) => {

      console.log(result);
      if (!result) {return;}

      gData = JSON.parse(result);

      renderGraph(Graph, gData);

      let increment = 0;
  
      setInterval(() => {
        gData = Graph.graphData();
        const id = (increment % gData.links.length)
        const link = gData.links[Math.floor(Math.random() * gData.links.length)];
        
        //console.log(link);
        emitParticle(link);
        
        increment++;
  
      }, 500);
    } );


  };
  //

  return [loadOlyCloud];
}