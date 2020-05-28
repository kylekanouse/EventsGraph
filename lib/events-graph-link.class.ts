import EventsGraphNode from './events-graph-node.class';
import Utils from './utils';

/**
 * Events Graph Link
 */

class EventsGraphLink {

  protected _id: string;
  protected _source: any;
  protected _target: any;
  protected _sourceNode: EventsGraphNode|false;
  protected _targetNode: EventsGraphNode|false;
  protected _val: string;
  protected _label: string;
  protected _object3D: THREE.Object3D;

  /**
   * constructor
   * 
   * @param {object} source
   * @param {object} target
   * @param {string} val 
   * @param {string} label
   * 
   * @todo 
   */

  constructor(source: any, target?: any, val?: string, label?: string, sourceNode?: EventsGraphNode|false, targetNode?: EventsGraphNode|false, object3D?: THREE.Object3D) {

    this._id = 'dgdg';
    
    if (typeof source === "object") {
      ({source, target, val, label, sourceNode, targetNode, object3D} = source);
    }
    
    this._source = source;
    this._target = target;
    this._sourceNode = sourceNode;
    this._targetNode = targetNode;
    this._val = val;
    this._label = label;
    this._object3D = object3D;
    this._id = this._buildID(this._source, this._target);
  }

  /**
   * GET id
   * 
   * @returns {string}
   */

  get id(): string {
    return this._id;
  }

  /**
   * get object3D
   */

  get object3D() {
    return this._object3D;
  }

  /**
   * GET source
   * 
   * @returns {object||string}
   */

  get source(): any {
    return this._source;
  }

  /**
   * get sourceNode
   * 
   * @returns {EventsGraphNode|false}
   */

  get sourceNode(): EventsGraphNode|false {
    return this._sourceNode;
  }

  /**
   * get target
   */

  get target(): any {
    return this._target;
  }

  /**
   * get targetNode
   * 
   * @returns {EventsGraphNode|false}
   */

  get targetNode(): EventsGraphNode|false {
    return this._targetNode;
  }

  /**
   * get val
   * 
   * @returns {string}
   */

  get val(): string {
    return this._val;
  }

  /**
   * get label
   * 
   * @returns {string}
   */

  get label(): string {
    return this._label;
  }

  /**
   * set source
   * 
   * @param {any} val
   */

  set source(val: any) {
    this._source = val;
  }

  /**
   * set sourceNode
   * 
   * @param {EventsGraphNode|false} node
   */

  set sourceNode(node: EventsGraphNode|false) {
    this._sourceNode = node;
  }

  /**
   * set target
   * 
   * @param {Oject||string} val
   */

  set target(val: any) {
    this._target = val;
  }

  /**
   * set targetNode
   * 
   * @param {EventsGraphNode|false} node
   */

  set targetNode(node: EventsGraphNode|false) {
    this._targetNode = node;
  }

  /**
   * set val
   * 
   * @param {string} val
   */

  set val(val: string) {
    this._val = val;
  }

  /**
   * set label
   * 
   * @param {string} val
   */

  set label(val: string) {
    this._label = val;
  }

  /**
   * _buildID
   * 
   * @param {string} sourceID
   * @param {string} targetID
   * 
   * @returns {string}
   */

  _buildID(sourceID: string, targetID: string): string {
    return sourceID + Utils.IDSeperator() + targetID;
  }

  /**
   * _getNodeID
   * 
   * Helper internal method to deal with node being either a string or an object
   * due to force graph modifying node object after render
   * 
   * @param {string|EventsGraphNode} node 
   */

  _getNodeID (node: string|EventsGraphNode): string {
    return (typeof node === "object") ? node.id : node;
  }

  /**
   * getIDFromLinkData
   * 
   * @param {object} link 
   */

  getIDFromGraphLinkData(link: any): string {
    return this._buildID( this._getNodeID(link.source) , this._getNodeID(link.target) );
  }

  /**
   * getData
   * 
   * @returns {object}
   */

  getData(): object {
    return {
      id: this._id,
      source: this._source,
      sourceNode: this._sourceNode,
      target: this._target,
      targetNode: this._targetNode,
      val: this._val,
      label: this._label
    };
  }
}

/**
 * Export Class
 */

export default EventsGraphLink;