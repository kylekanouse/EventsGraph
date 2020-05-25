import Utils from './utils.mjs';
import EventsGraphNode from './events-graph-node.class.mjs';
import EventsGraphLink from './events-graph-link.class.mjs';
import EventsGraphUser from './events-graph-user.class.mjs';
import EventsGraphEvent from './events-graph-event.class.mjs';
import EventsGraphMonitor from './events-graph-monitor.class.mjs';

// Define constsants
const coolDownTicks             = 5000,
      cooldownTime              = 100000,
      eventTypeColors           = {
        'user': 'green',
        'service': 'red'
      },
      fontUrl                   = './assets/fonts/helvetiker_regular.typeface.json',
      initLoadSoundUrl          = './assets/audio/explosion.ogg',
      linkAutoColorBy           = 'val',
      initLoadSoundVol          = 0.2,
      linkParticleSpeed         = 0.01,
      linkParticleResolution    = 100,
      linkParticleWidth         = 4,    
      linkOpacity               = 0.3,
      linkWidth                 = 0.8,
      nodeAutoColorBy           = 'group',
      nodeDefaultColor          = 0x00ff00,
      nodeLabel                 = 'label',
      nodeValue                 = 'val',
      nodeRelationSize          = 3;

let graphFirstLoaded            = false;

/**
 * Events Graph
 */

class EventsGraph {

  /**
   * constructor
   * 
   * @param {*} id 
   * @param {HTMLDivElement} ele 
   * @param {HTMLDivElement} monitorEle
   */

  constructor(id, ele, monitorEle = null) {

    if (typeof id === "object") {
      ({id, ele, graphData, events, users} = id);
    }

    this._id = id;
    this._ele = ele;
    this._graph =  ForceGraphVR()( this._ele );
    this._graphData = null;
    this._users = [];
    this._usersMapper = {};
    this._nodes = [];
    this._nodesMapper = {};
    this._links = [];
    this._linksMapper = {};
    this._linksUserMapper = {};
    this._font = null;

    // Callback Arrays
    this._nodeLoadedCallbacks = [];
    this._linkLoadedCallbacks = [];
    this._userLoadedCallbacks = [];

    // Setup listner for sounds 
    this._listener = new THREE.AudioListener();

    // Setup event monitoring of activity
    this._monitor = new EventsGraphMonitor( monitorEle );

    // Enable monitoring for all event types
    this._monitor.enableEventType('*');

    // Setup the scene
    this._initScene();

    new THREE.FontLoader().load( fontUrl, font => {
      this._font = font;
    });
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
   * GET graphData
   * 
   * @returns {Object}
   */

  get graphData() {
    return this._graphData;
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
   * get links
   * 
   * @returns {Array}
   */

  get links() {
    return this._links;
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
   * SET: graphData
   * 
   * @param {Object} d
   * 
   * @returns {EventsGraph}
   */

  set graphData(d) {
    if (!("nodes" in d)) { return; }
    this._graphData = d;

    return this;
  }

  /**
   * _addNodeFromGraphData
   * 
   * @param nodeData
   * 
   * @returns {EventsGraphNode}
   */

  _addNodeFromGraphData(nodeData) {
    if (!nodeData) { return false; }

    // Create new EventsGrpahNode object from Graph Node Data
    const node = new EventsGraphNode(nodeData);

    // Add to array and map by id
    this._nodes.push( node );
    this._nodesMapper[node.id] = this._nodes.length - 1;

    // Return reference to node object
    return node;
  }

  /**
   * _addLinkFromGraph
   * 
   * @param linkData
   *
   * @returns {EventsGraphLink}
   */

  _addLinkFromGraphData(linkData) {
    if (!linkData) { return false; }

    const link        = new EventsGraphLink(linkData);
    link.sourceNode   = this._getNodeFromID(link.source);
    link.targetNode   = this._getNodeFromID(link.target);

    this._links.push( link );
    this._linksMapper[link.id] = this._links.length - 1;

    return link;
  }

  /**
   * _addLinkRefernceToUserMap
   *
   * @param {String} linkId 
   * @param {Integer} userId
   * 
   * @returns {EventsGraph}
   */

  _addUserRefernceToLinkMap(linkId, userId) {
    if (!linkId || !userId) { return this; }

    // Add to mapper
    this._linksUserMapper[linkId] = userId;

    return this;
  }

  /**
   * _addUserFromNodeGraphData
   *
   * @param {Object} nodeData
   */

  _addUserFromNodeGraphData(nodeData) {
    if (!nodeData) { return false; }

    // Create new EventsGrpahNode object from Graph Node Data
    const user = new EventsGraphUser(nodeData);

    // Add to array and map by id
    this._users.push( user );
    this._usersMapper[user.id] = this._users.length - 1;

    // Return reference to user object
    return user;
  } 

  /**
   * _clearWrappers
   * 
   * These values should be built on graph rendering
   * 
   * @returns {EventsGraph}
   */

  _clearWrappers() {

    this._nodes = [];
    this._nodesMapper = {};
    this._links = [];
    this._linksMapper = {};
    this._usersMapper = {};

    return this;
  }

  /**
   * _getNodeFromID
   * 
   * @param {String} id
   */

  _getNodeFromID(id) {
    return (this._nodesMapper.hasOwnProperty(id)) ? this._nodes[this._nodesMapper[id]] : false;
  }

  /**
   * _initScene
   * 
   * @returns {EventsGraph}
   */

  _initScene() {

    const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    const planeMaterial = new THREE.MeshLambertMaterial({color: 0xFF0000, side: THREE.DoubleSide});
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(-100, -200, -100);
    plane.rotation.set(0.5 * Math.PI, 0, 0);

    // Add plane to scene
    this.scene.add(plane);

    return this;
  }

  /**
   * _linkDataLoaded
   *
   * @param {Object} linkData
   * @returns {EventsGraph}
   */

  _linkDataLoaded(linkData) {

    // Add Link to EventGraphLink Wrapper Links array
    const link = this._addLinkFromGraphData(linkData);

    // Check if link is associated to a user and if so associate the link with the user object link
    if (link.id in this._linksUserMapper) {

      // Get User ID from links mapper
      const userId        = this._linksUserMapper[link.id];
      const userIndex     = this._usersMapper[userId];

      // User userid to associate link with user object
      this._users[userIndex].link = link;
    }

    // Fire Link Loaded Callbacks
    this._linkLoadedCallbacks.forEach(cb => {
      cb(link);
    });

    return this;
  }

  /**
   * _nodeHover
   * 
   * @param {*} node 
   */

  _nodeCenterHover(node) {
    if (!node || !this._font) { return; }

    //console.log(node);

    // let size = 10;
    // let geometry = new THREE.TextBufferGeometry(""+node.id, {
    //   font: this._font,
    //   size,
    //   height: 3,
    //   curveSegments: 12,
    // });

    // let material = new THREE.MeshLambertMaterial({
    //   color: 0xffffff,
    //   side: THREE.DoubleSide
    // });

    // let mesh = new THREE.Mesh(geometry, material);
    // mesh.position.set(node.x, node.y, node.z);
    // //mesh.lookAt( this.scene.camera.position );
    // this.scene.object3D.add( mesh );

    // node.hoverObject3D = mesh;
    // node.hoverGeometry = geometry;
  }

  /**
   * _nodeCenterHoverOut
   *
   * @param {*} node
   * 
   * @returns {EventsGraph}
   */

  _nodeCenterHoverOut(node) {

    if (!node) { return; }

    if (node.hoverObject3D) {

      // Remove hover object
      this.scene.object3D.remove( node.hoverObject3D );

      // need to explicitly envoke BufferGeometry.dispose()
      node.hoverGeometry.dispose();
    }

    return this;
  }

  /**
   * _nodeLoaded
   *
   * @param {Object} nodeData
   * @returns {EventsGraph}
   */

  _nodeDataLoaded(nodeData) {

    if (!nodeData) { return this; }

    // Add Node to Graph collection
    const node = this._addNodeFromGraphData(nodeData);

    // Publish load event to listener callbacks
    this._nodeLoadedCallbacks.forEach(cb => {
      cb(node);
    });

    // Check if loaded node is a user node
    if (node.type == 'user') {
      this._userNodeDataLoaded( node.getData() );
    }

    return this;
  }

  /**
   * _userNodeDataLoaded
   *
   * @param nodeData
   * @returns {EventsGraph}
   */

  _userNodeDataLoaded(nodeData) {
    if (!nodeData) { return this; }

    // Add user from graph node data
    const user = this._addUserFromNodeGraphData(nodeData);

    // Call user loaded callbacks
    this._userLoadedCallbacks.forEach(cb => {
      cb(user);
    });

    return this;
  }

  /**
   * _onGraphRendered
   * 
   * @description Called after the data has been rendered to graph
   * 
   * @returns {EventsGraph}
   */

  _onGraphRendered() {
    if (!graphFirstLoaded) {
      this._onGraphFirstLoad();
    }

    return this;
  }

  /**
   * _onGraphFirstLoad
   * 
   * @returns {EventsGraph}
   */

  _onGraphFirstLoad() {

    graphFirstLoaded = true;

    // Add listner to camera
    this.scene.camera.add( this._listener );

    // // create a audio listener
    var sound = new THREE.Audio( this._listener );

    // load a sound and set it as the Audio object's buffer
    var audioLoader = new THREE.AudioLoader();

    // Load init Load sound url
    audioLoader.load( initLoadSoundUrl, function( buffer ) {
      sound.setBuffer( buffer );
      sound.setLoop( false );
      sound.setVolume( initLoadSoundVol );
      sound.play();
    });

    return this;
  }

  /**
   * _removeLinkRefernceToUserMap
   *
   * @param {String} linkId 
   * 
   * @returns {EventsGraph}
   */

  _removeUserRefernceToLinkMap(linkId) {
    if (!(linkId in this._linksUserMapper)) { return this; }

    // Remove ref from reference map
    delete this._linksUserMapper[linkId];

    return this;
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

    // Add reference of user to link
    this._addUserRefernceToLinkMap( user.link.id, user.id);

    // Add user elements to graph and render graph
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
   * @returns {EventsGraph}
   */

  addLink(link) {
    if (!(link instanceof EventsGraphLink)) { return this; }

    // Add link graph data to graph array for rendering
    this.graphData.links.push( link.getData() );

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

    return this;
  }

  /**
   * createEvent
   * 
   * @param {Object} link 
   * 
   * @returns {EventsGraphEvent}
   */

  createEvent(link) {
    return new EventsGraphEvent(link, this._listener);
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
    return Object.keys(this._usersMapper);
  }

  /**
   * getUser
   * 
   * @param {Integer} id
   * 
   * @returns {EventsGraphsUser}
   */

  getUser(id) {
    if (!(id in this._usersMapper)) { return false; }

    // Get Array Index from map
    const userIndex = this._usersMapper[id];

    // Make sure user exists in array
    if (!(userIndex in this._users)) { return false; }
    
    return this._users[userIndex];
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
      if (!result) { return this; }

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
   * onNodeLoaded
   * @param {Function} cb
   * @returns {EventsGraph}
   */

  onNodeLoaded(cb) {
    this._nodeLoadedCallbacks.push(cb);
    return this;
  }

  /**
   * onLinkLoaded
   *
   * @param {Function} cb
   * @returns {EventsGraph}
   */

  onLinkLoaded(cb) {
    this._linkLoadedCallbacks.push(cb);
    return this;
  }

  /**
   * onUserLoaded
   *
   * @param {Function} cb
   * @returns {EventsGraph}
   */

  onUserLoaded(cb) {
    this._userLoadedCallbacks.push(cb);
    return this;
  }

  /**
   * removeLink
   * 
   * @param {EventsGraphLink} link
   * 
   * @returns {EventsGraph}
   */

  removeLink(link) {
    if (!(link instanceof EventsGraphLink || !(link.id in this._linksMapper))) { return this; }  

    // Remove from links array
    this._links.splice(this._linksMapper[link.id], 1);

    // Remove mapping
    delete this._linksMapper[link.id];

    // Remove link from graph graphData array
    this._graphData.links = this._graphData.links.filter((l, index, arr) => { 
      return link.getIDFromGraphLinkData(l) != link.id;
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

  removeNode(node) {
    if (!(node instanceof EventsGraphNode)) { return this; }

    // Remove from nodes array
    this._nodes.splice(this._nodesMapper[node.id], 1);

    // Delete mapper element
    delete this._nodesMapper[node.id];

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
    this._users.splice(this._usersMapper[user.id], 1);

    // Delete entry in mapper object
    delete this._usersMapper[user.id];

    // Remove mapper reference to link
    this._removeUserRefernceToLinkMap(user.link.id);

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

    // Clear out all the wrapper objects to be refreshed on graph rendering
    this._clearWrappers();

    // Configure and Render Grpah
    this._graph
      .cooldownTicks(coolDownTicks)
      .cooldownTime(cooldownTime)
      .nodeLabel(nodeLabel)
      .nodeVal(nodeValue)
      .nodeAutoColorBy(nodeAutoColorBy)
      .nodeRelSize(nodeRelationSize)
      .onNodeCenterHover((cnode, pnode) => {
        this._nodeCenterHover(cnode);
        this._nodeCenterHoverOut(pnode);
      })
      .linkAutoColorBy(linkAutoColorBy)
      .linkOpacity(linkOpacity)
      .linkWidth(linkWidth)
      .linkDirectionalParticleSpeed(linkParticleSpeed)
      .linkDirectionalParticleResolution(linkParticleResolution)
      .linkDirectionalParticleColor(link => {
        return eventTypeColors[link.source.type];
      })
      .linkDirectionalParticleWidth(linkParticleWidth)
      .linkThreeObjectExtend(true)
      .linkThreeObject(linkData => {

        linkData.source = (linkData.source instanceof Object) ? linkData.source.id : linkData.source;
        linkData.target = (linkData.target instanceof Object) ? linkData.target.id : linkData.target;

        // Setup text to show link label in center of the link
        const text = (linkData.label) ? `${linkData.label}` : `${linkData.source} > ${linkData.target}`;
        const sprite = new SpriteText(text);
        sprite.color = 'lightgrey';
        sprite.textHeight = 1.5;

        // Create container to add sprite
        let group = new THREE.Group();
        group.add(sprite);

        // Associate object to link
        linkData.object3D = group;

        this._linkDataLoaded( linkData );

        return group;
      })
      .linkPositionUpdate((sprite, { start, end }) => {
        const middlePos = Object.assign(...['x', 'y', 'z'].map(c => ({
            [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
        })));

        // Position sprite
        Object.assign(sprite.position, middlePos);
      })
      .nodeThreeObject(nodeData => {

        let obj = false,
            group = new THREE.Group();

        if (nodeData.icon) {

          // Create Image icon for node
          const imgTexture = new THREE.TextureLoader().load(nodeData.icon);
          const material = new THREE.SpriteMaterial({ map: imgTexture });
          obj = new THREE.Sprite(material);
          obj.scale.set(12, 12);

        } else {

          // Create Circular object for node
          const material = new THREE.MeshBasicMaterial({ wireframe: false, color: nodeDefaultColor });
          const sphere = new THREE.SphereGeometry(0.5 * nodeData.val,20,20);
          obj = new THREE.Mesh( sphere, material );

        }

        // Standardize container by adding Object into group
        group.add( obj );

        // Assocuate object to node
        nodeData.object3D = group;

        this._nodeDataLoaded( nodeData );

        // Return Object to be rendered
        return group;
      })
      .graphData( this._graphData );

    this._onGraphRendered();

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

    // Emit visual
    this._graph.emitParticle( this.getGraphLinkByNodeIDs( event.link.source,  event.link.target) );

    // Emit sound
    event.playSound();

    // Log event with monitor
    this._monitor.logEvent(event);

    return this;
  }
} // EOF

// Expose Class
export default EventsGraph;