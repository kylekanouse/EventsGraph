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
   * addUser
   * 
   * @param {EventsGraphUser} user 
   */

  addUser(user) {
    console.log("======> ADD: User");
    console.log(user);
    this._users.push(user);
    this.addEGNode( user.egNode )
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
    return this;
  }

  /**
   * buildEGNodes
   * 
   * Map 3d force graph world to egEvents graph world
   * 
   * @param {Array} nodes 
   */

  buildEGNodes(nodes) {
    return nodes.map((node) => {
      return new EventsGraphNode(node.id, node.label, node.group, node.val, node.desc, node.icon);
    });
  }

  /**
   * buildEGLinks
   * 
   * Map 3d force graph world to egEvents graph world
   * 
   * @param {Array} links 
   */

  buildEGLinks(links) {
    return links.map((link) => {
      return new EventsGraphLink(link.source, link.target);
    });
  }

  /**
   * emitParticle
   * 
   * @param {} link 
   */

  emitParticle (link) {
    this._graph.emitParticle(link);
    return this;
  }

  /**
   * GET id
   * 
   * @returns {*}
   */

  get id() {
    return this._id;
  }

  get data() {
    return this._data;
  }

  get egLinks() {
    return this._egLinks;
  }

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

      data = JSON.parse(result);
      console.log(data);
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
    this.data.links = this.data.links.filter(function(l, index, arr){ 

      let linkID = egLink.getIDFromLink(l);

      console.log("linkID = ", linkID);
      console.log("egLink.id = ", egLink.id);
      return egLink.getIDFromLink(l) != egLink.id;
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
    this.data.nodes = this.data.nodes.filter(function(n, index, arr){ return n.id != egNode.id;});
    return this;
  }

  /**
   * removeUser
   * 
   * @param {EventsGraphUser} user
   */

  removeUser(user) {
    console.log('removeUser() ', user);
    this._users = this._users.filter(function(u, index, arr){ return u.id != user.id;});

    console.log('egNode: ',user.egNode);
    console.log('egLink: ',user.egLink);
    this.removeEGNode( user.egNode )
        .removeEGLink( user.egLink )
        .render;
    return true;
  }

  /**
   * Render
   */ 

  render() {
    console.log('==== render()')
    this._graph
      .cooldownTicks(5000)
      .cooldownTime(100000)
      // .forceEngine('d3')
      // .dagMode('far-to-near')
      // .nodeColor(nodeColor)
      .nodeLabel('label')
      .nodeVal('val')
      .nodeAutoColorBy('group')
      .nodeRelSize(3)
      .onNodeCenterHover((cnode, pnode) => {
        //nodeHover(cnode);
      })
      // .linkVisibility(true)
      .linkAutoColorBy('val')
      .linkOpacity(0.3)
      .linkWidth(0.8)
      // .linkDirectionalParticles(0)
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
  }

  /**
   * SET: data
   */

  set data(d) {
    if (!("nodes" in d)) {return;}
    this._data = d;
    this._egNodes = this.buildEGNodes(d.nodes);
    this._egLinks = this.buildEGLinks(d.links);
  }

} // EOF