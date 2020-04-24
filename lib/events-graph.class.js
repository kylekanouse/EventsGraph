/**
 * Events Graph
 */

class EventsGraph {

  /**
   * constructor
   * 
   * @param {*} id 
   * @param {Element} ele 
   * @param {Array} data 
   * @param {Array} egEvents
   * @param {Array} egUsers
   */

  constructor(id, ele, data = [],egEvents = [], users = []) {
    this._id = id;
    this._ele = ele;
    this._graph =  ForceGraphVR()(this._ele);
    this._egEvents = egEvents;
    this._users = users;
    this._data = null;
    this.data = data;
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
   * GET data
   */

  get data() {
    return this._data;
  }

  /**
   * get egLinks
   */

  get egLinks() {
    return this._egLinks;
  }

  /**
   * SET: data
   */

  set data(d) {
    if (!("nodes" in d)) {return;}
    this._data = d;
    this._egNodes = this._buildEGNodes(d.nodes);
    this._egLinks = this._buildEGLinks(d.links);
  }

  /**
   * _buildEGNodes
   * 
   * Map 3d force graph world to egEvents graph world
   * 
   * @param {Array} nodes 
   */

  _buildEGNodes(nodes) {
    return nodes.map((node) => {
      return new EventsGraphNode(node.id, node.label, node.group, node.val, node.desc, node.icon);
    });
  }

  /**
   * _buildEGLinks
   * 
   * Map 3d force graph world to egEvents graph world
   * 
   * @param {Array} links 
   */

  _buildEGLinks(links) {
    return links.map((link) => {
      return new EventsGraphLink(link.source, link.target);
    });
  }

  /**
   * addUser
   * 
   * @param {EventsGraphUser} user 
   */

  addUser(user) {
    // console.log("======> ADD: User");
    // console.log(user);
    this._users.push(user);
    this.addEGNode( user )
      .addEGLink( user.egLink )
      .render();
    return this;
  }

  /**
   * addEGLink(
   * 
   * @param {EventsGraphLink} egLink 
   */

  addEGLink( egLink ) {
    this.data.links.push( egLink.getData() );
    this._egLinks.push( egLink );
    return this;
  }

  /**
   * addEGNode
   * 
   * Adds an Event Graph Node to graph data
   * 
   * @param {EventGraphNode} node 
   */

  addEGNode(egNode) {
    if (!egNode) {return false;}
    this.data.nodes.push( egNode.getData() );
    this._egNodes.push( egNode );
    return this;
  }

  /**
   * getGraphLinkByNodeIDs
   * 
   * @param {String} sourceNodeID 
   * @param {String} targetNodeID 
   */

  getGraphLinkByNodeIDs(sourceNodeID, targetNodeID) {
    const link = this._graph.graphData().links.filter(function(l, index, arr) { 
      return (l.source.id == sourceNodeID && l.target.id == targetNodeID);
    });
    return (link.length) ? link[0] : link;
  }

  /**
   * getUserIds
   */

  getUserIds() {
    return this._users.map(user => user.id);
  }

  /**
   * getUser
   * 
   * @param {Integer} id 
   */

  getUser(id) {
    return this._users.find(obj => {
      if (!obj instanceof EventsGraphUser) {return false;}
      return (obj.id == id);
    });
  }

  /**
   * loadData
   * 
   * @param {} data 
   */

  loadData(data) {
    if (!data) {return;}
    this.data = data;
    this.render();
    return this;
  }

  /**
   * loadDataFromUrl
   * 
   * @param {*} url 
   * @param {*} cb 
   */

  loadDataFromUrl(url, cb = null) {

    Utils.loadJSON(url, (result) => {
      let data;
      if (!result) {return this;}

      try {
        data = JSON.parse(result);
      } catch(err){
        console.log('Unable to parse JSON | message = ', err.message);
      }

      console.log("EventsGraph | loadDataFromUrl() | ", data);
      this.loadData(data);

      if (cb) {
        cb(data);
      }
    });
    return this;
  }

  /**
   * removeEGLink
   * 
   * @param {EventsGarphLink} egLink 
   */

  removeEGLink(egLink) {
    if (!egLink) {return this;}

    //Remove link from egLinks array
    this._egLinks = this._egLinks.filter((l, index, arr) => { 
      return l.id != egLink.id;
    });    

    // Remove link from graph data array
    this.data.links = this.data.links.filter((l, index, arr) => { 
      return egLink.getIDFromLinkData(l) != egLink.id;
    });

    return this;
  }

  /**
   * removeEGNode
   * 
   * @param {EventsGraphNode} egNode 
   */

  removeEGNode(egNode) {
    if (!egNode) {return this;}

    // Remove from egNodes array
    this._egNodes = this._egNodes.filter( (n) => { return n.id != egNode.id;});

    // Remove from graph data
    this.data.nodes = this.data.nodes.filter( (n) => { return n.id != egNode.id; });

    return this;
  }

  /**
   * removeUser
   * 
   * @param {EventsGraphUser} user
   */

  removeUser(user) {
    console.log('removeUser() ', user);
    if (!user) {return this;}

    // Remove user from users array
    this._users = this._users.filter(function(u, index, arr){ return u.id != user.id;});

    // Remove user graph elements
    this.removeEGNode( user )
        .removeEGLink( user.egLink )
        .render();
    return this;
  }

  /**
   * Render
   */ 

  render() {
    console.log('==== render() | _data: ', this._data);
    const testData = {
      "nodes": [{
        "id": "com.pongalo",
        "group": 1,
        "label": "Pongalo",
        "val": 20,
        "desc": "This is a description for pongalo",
        "icon": "./assets/images/pongalo.icon.png"
      }, {
        "id": "com.freetv",
        "group": 1,
        "label": "Free TV",
        "val": 20,
        "desc": "This is a description for FreeTV",
        "icon": "./assets/images/freetv_logo-1.png"
      }
    ],
    "links": [{
      "source": "com.pongalo",
      "target": "com.freetv",
      "val": 1,
      "label": "Pongalo -> Ingest"
    }]
  };

    this._graph
      .cooldownTicks(5000)
      .cooldownTime(100000)
      .nodeLabel('label')
      .nodeVal('val')
      .nodeAutoColorBy('group')
      .nodeRelSize(3)
      .onNodeCenterHover((cnode, pnode) => {
        //nodeHover(cnode);
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

        if (node.icon) {
          const imgTexture = new THREE.TextureLoader().load(node.icon);
          const material = new THREE.SpriteMaterial({ map: imgTexture });
          const sprite = new THREE.Sprite(material);
          sprite.scale.set(12, 12);
          return sprite;
        }

        return false;
      })
      .graphData(this._data);
      // .graphData(testData);
      // console.log("BROKEN: this._Data = ", this._data);
      // console.log("WORKING: testData = ", testData);
  }

  /**
   * sendEvent
   * 
   * Main handler for processing events on the graph
   * 
   * @param {EventsGraphEvent} event 
   */

  sendEvent(event) {
    const link = event.getLinkData();
    this._graph.emitParticle(this.getGraphLinkByNodeIDs(link.source, link.target));
  }
} // EOF