import Utils from './utils.mjs';
import EventsGraphNode from './events-graph-node.class.mjs';
import EventsGraphLink from './events-graph-link.class.mjs';
import EventsGraphUser from './events-graph-user.class.mjs';
import EventsGraphEvent from './events-graph-event.class.mjs';

/**
 * Events Graph
 */

class EventsGraph {

  /**
   * constructor
   * 
   * @param {*} id 
   * @param {Element} ele 
   * @param {Object} graphData 
   * @param {Array} events
   * @param {Array} users
   */

  constructor(id, ele, graphData = {}, events = [], users = []) {

    if (id instanceof Object) {
      ({id, ele, graphData, events, users} = id);
    }

    this._id = id;
    this._ele = ele;
    this._graph =  ForceGraphVR()( this._ele );
    this._events = events;
    this._users = users;
    this._graphData = null;
    this.graphData = graphData;
    this._links = [];
    this._font = null;

    // Setup the scene
    this._initScene();

    new THREE.FontLoader().load( './assets/fonts/helvetiker_regular.typeface.json', ( font ) => {
      this._font = font;
    } );
  }

  /**
   * GET id
   * 
   * @returns {*}
   */

  get id() {
    return this._id;
  }

  /**
   * GET graphData
   * 
   * @returns {Object}
   */

  get graphData() {
    return this._graphData;
  }

  /**
   * GET doc
   * 
   * @returns {Document}
   */

  get doc() {
    return this._ele.ownerDocument;
  }

  /**
   * get scene
   * 
   * @returns {Scene}
   */
  get scene() {
    //return this.doc.getElementsByTagName("A-SCENE")[0].object3D;
    return (AFRAME && AFRAME.scenes.length) ? AFRAME.scenes[0] : this.doc.getElementsByTagName("A-SCENE")[0].object3D;
  }

  /**
   * get links
   * 
   * @returns {Array}
   */

  get links() {
    return this._links;
  }

  /**
   * SET: graphData
   * 
   * @param {Object} d
   */

  set graphData(d) {
    if (!("nodes" in d)) { return; }
    this._graphData = d;
    this._nodes = this._buildNodesFromGraphData(d.nodes);
    this._links = this._buildLinksFromGraphData(d.links);
  }

  /**
   * _buildNodesFromGraphData
   * 
   * Map 3d force graph world to egEvents graph world
   * 
   * @param {Array} nodes 
   */

  _buildNodesFromGraphData(nodes) {
    return nodes.map((node) => {
      return new EventsGraphNode(node);
    });
  }

  /**
   * _buildLinksFromGraphData
   * 
   * Map 3d force graph world to egEvents graph world
   * 
   * @param {Array} links 
   */

  _buildLinksFromGraphData(links) {
    return links.map((link) => {
      return new EventsGraphLink(link);
    });
  }

  /**
   * _initScene
   * 
   */

  _initScene() {

    const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    const planeMaterial = new THREE.MeshLambertMaterial({color: 0xFF0000, side: THREE.DoubleSide});
    const mesh = new THREE.Mesh(planeGeometry, planeMaterial);
    mesh.position.set(-100, -200, -100);
    mesh.rotation.set(0.5 * Math.PI, 0, 0);

    this.scene.add(mesh);
  }

  /**
   * _nodeHover
   * 
   * @param {*} node 
   */

  _nodeCenterHover(node) {
    if (!node || !this._font) { return; }

    console.log(node);

    let size = 10;
    let geometry = new THREE.TextBufferGeometry(""+node.id, {
      font: this._font,
      size,
      height: 3,
      curveSegments: 12,
    });

    let material = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(node.x, node.y, node.z);
    //mesh.lookAt( this.scene.camera.position );
    this.scene.object3D.add( mesh );

    node.hoverObject3D = mesh;
    node.hoverGeometry = geometry;
  }

  /**
   * _nodeCenterHoverOut
   *
   * @param {*} node 
   */

  _nodeCenterHoverOut(node) {
    if (!node) { return; }

    if (node.hoverObject3D) {

      // Remove hover object
      this.scene.object3D.remove( node.hoverObject3D );

      // need to explicitly envoke BufferGeometry.dispose()
      node.hoverGeometry.dispose();
    }
  }

  /**
   * addUser
   * 
   * @param {EventsGraphUser} user
   * 
   * @returns {EventsGraph}
   */

  addUser(user) {
    if (!(user instanceof EventsGraphUser)) { return this; }

    this._users.push( user );
    this.addNode( user )
      .addLink( user.link )
      .render();
    return this;
  }

  /**
   * addLink
   * 
   * @param {EventsGraphLink} link 
   * 
   * @returns {Object}
   */

  addLink(link) {
    if (!(link instanceof EventsGraphLink)) { return this; }

    this.graphData.links.push( link.getData() );
    this._links.push( link );
    return this;
  }

  /**
   * addNode
   * 
   * Adds an Event Graph Node to graph graphData
   * 
   * @param {EventGraphNode} node
   * 
   * @returns {EvenetsGraph}
   */

  addNode(node) {
    if (!(node instanceof EventsGraphNode)) { return this; }

    // Add Node graph graphData to grpah nodes
    this.graphData.nodes.push( node.getData() );
    this._nodes.push( node );
    return this;
  }

  /**
   * getGraphLinkByNodeIDs
   * 
   * @param {String} sourceNodeID 
   * @param {String} targetNodeID
   * 
   * @returns {Object}
   */

  getGraphLinkByNodeIDs(sourceNodeID, targetNodeID) {
    const link = this._graph.graphData().links.filter( (l, index, arr) => { 
      return (l.source.id == sourceNodeID && l.target.id == targetNodeID);
    });
    return (link.length) ? link[0] : link;
  }

  /**
   * getUserIds
   * 
   * @returns {Array}
   */

  getUserIds() {
    return this._users.map( user => user.id );
  }

  /**
   * getUser
   * 
   * @param {Integer} id
   * 
   * @returns {EventsGraphsUser}
   */

  getUser(id) {
    return this._users.find(obj => {
      if (!(obj instanceof EventsGraphUser)) { return false; }
      return (obj.id == id);
    });
  }

  /**
   * loadGraphData
   * 
   * @param {*} data
   * 
   * @returns {EventsGraph}
   */

  loadGraphData(data) {
    if (!data) { return; }
    this.graphData = data;
    this.render();
    return this;
  }

  /**
   * loadGraphDataFromUrl
   * 
   * @param {String} url 
   * @param {*} cb
   * 
   * @returns {EventsGraph}
   */

  loadGraphDataFromUrl(url, cb = null) {

    Utils.loadJSON(url, (result) => {
      let graphData;
      if (!result) {return this;}

      try {
        graphData = JSON.parse(result);
      } catch(err){
        console.log('Unable to parse JSON | message = ', err.message);
      }

      // console.log("EventsGraph | loadgraphDataFromUrl() | ", graphData);
      this.loadGraphData(graphData);

      if (cb) {
        cb(graphData);
      }
    });
    return this;
  }

  /**
   * removeLink
   * 
   * @param {EventsGarphLink} link
   * 
   * @returns {EventsGraph}
   */

  removeLink(link) {
    if (!(link instanceof EventsGarphLink)) { return this; }

    //Remove link from links array
    this._links = this._links.filter((l, index, arr) => { 
      return l.id != link.id;
    });    

    // Remove link from graph graphData array
    this._graphData.links = this._graphData.links.filter((l, index, arr) => { 
      return link.getIDFromLinkgraphData(l) != link.id;
    });

    return this;
  }

  /**
   * removeNode
   * 
   * @param {EventsGraphNode} node
   *
   * @returns {EventsGraph}
   */

  removeNode(egNode) {
    if (!(node instanceof EventsGraphNode)) { return this; }

    // Remove from egNodes array
    this._nodes = this._nodes.filter( (n) => { return n.id != node.id; });

    // Remove from graph graphData
    this._graphData.nodes = this._graphData.nodes.filter( (n) => { return n.id != node.id; });

    return this;
  }

  /**
   * removeUser
   * 
   * @param {EventsGraphUser} user
   * 
   * @returns {EventsGraph}
   */

  removeUser(user) {
    if (!(user instanceof EventsGraphUser)) { return this; }

    // Remove user from users array
    this._users = this._users.filter( (u, index, arr) => { return u.id != user.id; });

    // Remove user graph elements
    this.removeNode( user )
        .removeLink( user.link )
        .render();
    return this;
  }

  /**
   * Render
   * 
   * @returns {EventsGraph}
   */ 

  render() {
    // console.log('==== render() | _graphData: ', this._graphData);
  this._graph
    .cooldownTicks(5000)
    .cooldownTime(100000)
    .nodeLabel('label')
    .nodeVal('val')
    .nodeAutoColorBy('group')
    .nodeRelSize(3)
    .onNodeCenterHover((cnode, pnode) => {
      this._nodeCenterHover(cnode);
      this._nodeCenterHoverOut(pnode);
    })
    .linkAutoColorBy('val')
    .linkOpacity(0.3)
    .linkWidth(0.8)
    .linkDirectionalParticleSpeed(0.01)
    .linkDirectionalParticleResolution(100)
    .linkDirectionalParticleColor(() => 'red')
    .linkDirectionalParticleWidth(4)
    .linkThreeObjectExtend(true)
    .linkThreeObject(link => {

      link.source = (link.source instanceof Object) ? link.source.id : link.source;
      link.target = (link.target instanceof Object) ? link.target.id : link.target;

      // Setup text to show link label in center of the link
      const text = (link.label) ? `${link.label}` : `${link.source} > ${link.target}`
      const sprite = new SpriteText(text);
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

      // Check if graphData provides image for an icon
      if (node.icon) {
        const imgTexture = new THREE.TextureLoader().load(node.icon);
        const material = new THREE.SpriteMaterial({ map: imgTexture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(12, 12);
        return sprite;
      }

      return false;
    })
    .graphData(this._graphData);
    return this;
  }

  /**
   * sendEvent
   * 
   * Main handler for processing events on the graph
   * 
   * @param {EventsGraphEvent} event
   * 
   * @returns {EventsGraph}
   */

  sendEvent(event) {
    if (!(event instanceof EventsGraphEvent)) { return this; }
    const link = event.getLinkData();
    this._graph.emitParticle(this.getGraphLinkByNodeIDs(link.source, link.target));
    return this;
  }
} // EOF

// Expose Class
export default EventsGraph;