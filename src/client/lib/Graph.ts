  /// <reference path='../types/index.d.ts' />
import ForceGraphVR, { ForceGraphVRInstance } from "3d-force-graph-vr"
import { Object3D, Scene } from "three"
import IGraphData from "../../server/domain/IGraphData"
import { createGraphDataObject } from "../../server/lib/Utils"
import IGraphCallback from "../domain/IGraphCallback"
import { GraphLinkObject } from "../types/GraphLinkObject"
import { GraphNodeObject } from "../types/GraphNodeObject"
import GraphEvent from "./GraphEvent"
import Link from "./Link"
import Node from './Node'
import { centerObjToCoords, getIcon3D, getLinkObject, getScene } from "./Utils"
import GraphLoadedObserved from "./observers/GraphLoadedObserved"

/**
 * CONST
 */

const coolDownTicks                          : number                   = 5000,
      cooldownTime                           : number                   = 100000,
      eventTypeColors                        : Map<string, string>      = new Map([
                                                                                    ['user', 'green'],
                                                                                    ['service', 'red']
                                                                                  ]),
      linkAutoColorBy                        : string                   = 'val',
      initLoadSoundVol                       : number                   = 0.2,
      linkParticleSpeed                      : number                   = 0.01,
      linkParticleResolution                 : number                   = 100,
      linkParticleWidth                      : number                   = 4,
      linkOpacity                            : number                   = 0.3,
      linkWidth                              : number                   = 0.8,
      nodeAutoColorBy                        : string                   = 'group',
      nodeDefaultColor                       : number                   = 0x00ff00,
      nodeLabel                              : string                   = 'label',
      nodeValue                              : string                   = 'val',
      nodeRelationSize                       : number                   = 3,
      spriteTextColor                        : string                   = 'lightgray'

/**
 * Graph
 *
 * @description Main class for handleing graph and interface with ForceGraph3D
 * @class
 */

export default class Graph {

  private _forceGraph                 : ForceGraphVRInstance

  private _links                      : Map<string, Link>             = new Map()

  private _nodes                      : Map<string, Node>             = new Map()

  private _nodeIndexMap               : Map<number, string>           = new Map()

  private _nodeObjects                : Map<string, Object3D>         = new Map()

  private _onNodeHoverCB              : IGraphCallback | undefined

  private _onNodeOutCB                : IGraphCallback | undefined

  /**
   * constructor
   *
   * @constructor
   * @param {HTMLElement} ele
   */

  constructor(ele: HTMLElement) {

    // setup properties
    this._forceGraph            = ForceGraphVR()(ele)

    // initalize instance
    this._init()
  }

  /**
   * ########################################################## GETTER / SETTER
   */

  /**
   * get scene
   * 
   * @returns {Scene}
   */

  get scene(): Scene {
    return getScene()
  }

  /**
   * size
   *
   * @type {number}
   */

  get size(): number {
    return this._forceGraph.graphData().nodes.length
  }

  /**
   * ########################################################## PRIVATE
   */

  /**
   * _init
   *
   * @private
   */

  private _init(): void {

    this._forceGraph
      .cooldownTicks(coolDownTicks)
      .cooldownTime(cooldownTime)
      .nodeLabel(nodeLabel)
      .nodeVal(nodeValue)
      .nodeAutoColorBy(nodeAutoColorBy)
      .nodeRelSize(nodeRelationSize)
      .onNodeCenterHover( (node: object | null, previousNode: object | null): void => {

        // Hover out
        if (previousNode!==null && this._onNodeOut) {
          const prevObj         = previousNode as GraphNodeObject 
          if (prevObj.__threeObj) {
            const prevNode      = this.getNodeByID( prevObj.__threeObj.name )
            if (prevNode) {
              this._onNodeOut( prevNode )
            }
          }
        }

        // Hover over
        if (node!==null && this._onNodeHover) {
          const nodeObj        = node as GraphNodeObject
          if (nodeObj.__threeObj) {
            const hoverNode    = this.getNodeByID(nodeObj.__threeObj.name)
            if (hoverNode) {
              this._onNodeHover( hoverNode )
            }
          }
        }

      })
      .onLinkCenterHover((link: object | null, previousLink: object | null): void => {
        console.log('EventsGraph | graph.onLinkCenterHover() | link = ', link, ' | previousLink = ', previousLink)
      })
      .linkAutoColorBy(linkAutoColorBy)
      .linkOpacity(linkOpacity)
      .linkWidth(linkWidth)
      .linkDirectionalParticleSpeed(linkParticleSpeed)
      .linkDirectionalParticleResolution(linkParticleResolution)
      .linkDirectionalParticleColor((link: any) => {
        // console.log('linkDirectionalParticleColor() | link = ', link)
        const color: string | undefined = eventTypeColors.get(link.source?.type)
        return (color) ? color: ''
      })
      .linkDirectionalParticleWidth(linkParticleWidth)
      .linkThreeObjectExtend(true)
      .linkThreeObject((linkData: any): Object3D => {
        return getLinkObject(linkData)
      })
      .linkPositionUpdate((obj: Object3D, coords: { start: Coords, end: Coords }, data: any): null | boolean => {
        return (obj) ? centerObjToCoords(obj, coords) : null
      })
      .nodeThreeObject((obj: object): any => {
        return this._nodeThreeObject(obj as GraphNodeObject)
      })
  }

  /**
   * _nodeThreeObject
   *
   * @private
   * @param {GraphNodeObject} node
   * @returns {Object3D}
   */

  private _nodeThreeObject(node: GraphNodeObject): Object3D {
    return getIcon3D(node.icon, node.val)
  }

  /**
   * _onGraphLoaded
   *
   * @private
   */

  private _onGraphLoaded(): void {

    // Get loaded graph data
    const { nodes, links }: GraphData = this._forceGraph.graphData() as GraphData

    if (nodes.length === 0) { return }

    // Loop over create EventGraph wrappers
    nodes.forEach( (node: NodeObject, index: number): void => {
      this._onNodeLoaded(node as GraphNodeObject, index)
    })

    // Loop over create EventGraph wrappers
    links.forEach( (link: LinkObject): void => {
      this._onLinkLoaded(link as GraphLinkObject)
    })

    // Add prev / next ref
    this._nodes.forEach( (node: Node): void => {

      // Get next and previous params from node index
      const prevIndex       : number                = (node.index > 0) ? node.index - 1 : this._nodes.size - 1
      const nextIndex       : number                = (node.index < this._nodes.size - 1) ? node.index + 1 : 0
      const prevNodeID      : string | undefined    = this._nodeIndexMap.get(prevIndex)
      const nextNodeID      : string | undefined    = this._nodeIndexMap.get(nextIndex)

      if (prevNodeID) {
        node.previous = this._nodes.get( prevNodeID ) 
      }

      if (nextNodeID) {
        node.next = this._nodes.get( nextNodeID ) 
      }
    })

    GraphLoadedObserved.send({isLoaded: true, nodeCount: this._nodes.size})
  }

  /**
   * _linkDataLoaded
   *
   * @private
   * @param {IGraphLink} linkData
   * @returns {EventsGraph}
   */

  private _onLinkLoaded(linkGraphObj: GraphLinkObject): Graph {

    // Get Link to EventGraphLink Wrapper Links array
    const link = new Link( linkGraphObj ).addedToStage() as Link

    // Add link to map
    this._links.set(link.id.toString(), link)

    return this
  }

  /**
   * _onGraphNodeLoaded
   *
   * @param {GraphNodeObject} nodeGraphObj
   * @returns {EventsGraph}
   */

  private _onNodeLoaded(nodeGraphObj: GraphNodeObject, index: number): Graph {

    const node: Node = new Node( nodeGraphObj ).addedToStage() as Node

    node.index = index

    this._nodeIndexMap.set(index, node.id.toString())

    this._nodes.set(node.id.toString(), node)

    if (node.object3D) {
      this._nodeObjects.set(node.id.toString(), node.object3D)
    }

    return this
  }

  /**
   * _onNodeHover
   *
   * @param {Node} node
   * @returns {Graph}
   */

  private _onNodeHover(node: Node): Graph {

    if (this._onNodeHoverCB) {
      this._onNodeHoverCB(node)
    }

    return this
  }

  /**
   * _onNodeOut
   *
   * @param {Node} node
   * @returns {Graph}
   */

  private _onNodeOut(node: Node): Graph {

    if (this._onNodeOutCB) {
      this._onNodeOutCB(node)
    }

    return this
  }
  /**
   * ########################################################## PUBLIC
   */

  clear(): Graph {

    console.log('Graph | clear(): ', );
    //this._forceGraph.graphData( createGraphDataObject() )
    this._nodes.forEach((node: Node) => {
      node.destroy()
    })
    this._nodes.clear()
    this._links.clear()
    this._forceGraph.graphData( createGraphDataObject() )
    this._forceGraph.refresh()

    return this
  }

  /**
   * sendEvent
   *
   * @param {GraphEvent} event
   * @returns {Graph}
   */

  sendEvent( event: GraphEvent ): Graph {

    if (event.link?.sourceID && event.link?.targetID) {
      this._forceGraph.emitParticle( event.link.getData() )
    }

    // Emit sound
    event.playSound()

    return this
  }

  /**
   * getLinkByNodeIDs
   * 
   * @param {string} sourceNodeID 
   * @param {string} targetNodeID
   * 
   * @returns {Link | undefined}
   */

  getLinkByNodeIDs(sourceNodeID: string, targetNodeID: string): Link | undefined {

    return [...this._links.values()].find((l: any, index: number, arr: any) => {
      return (l.source.id == sourceNodeID && l.target.id == targetNodeID)
    })
  }

  /**
   * graphData
   *
   * @returns {GraphData}
   */

  graphData(): GraphData { return this._forceGraph.graphData() }

  /**
   * getNodeByID
   *
   * @param {string} id
   * @returns {Node | undefined}
   */

  getNodeByID(id: string | number): Node | undefined { return this._nodes.get( id.toString() ) }

  /**
   * load
   *
   * @param {IGraphData} data
   * @returns {Graph}
   */

  load(data: IGraphData): Graph {

    this._forceGraph.graphData(data)

    // Call graphloaded after delay because forcegraph changes graphdata source and target nodes from strings to objects
    setTimeout((): void => {
      this._onGraphLoaded()
    }, 5)

    return this
  }

  /**
   * onNodeHover
   *
   * @param {IGraphCallback} cb
   * @returns {Graph}
   */

  onNodeHover(cb: IGraphCallback): Graph { this._onNodeHoverCB = cb; return this }

  /**
   * onNodeOut
   *
   * @param {IGraphCallback} cb
   * @returns {Graph}
   */

  onNodeOut(cb: IGraphCallback): Graph { this._onNodeOutCB = cb; return this }
}