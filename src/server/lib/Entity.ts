import { v4 as uuidv4 } from "uuid";
import IEventData from "../domain/IEventData";
import IEventsData from "../domain/IEventsData";
import IGraphData from "../domain/IGraphData";
import IGraphEntity from "../domain/IGraphEntity";
import IGraphLink from "../domain/IGraphLink"
import IGraphNode from "../domain/IGraphNode";
import { createEventData, createEventsObject, createGraphDataObject, createLink } from "./Utils"

/**
 * Entity
 * 
 * @class
 * @abstract
 * @implements {IGraphEntity}
 */

export default abstract class Entity implements IGraphEntity {

  protected _id: string

  protected _type: string | undefined

  protected _icon: string | undefined

  /**
   * constructor
   *
   * @param type {string}
   */

  constructor(type: string, id?: string, icon?: string) {
    this._type = type
    this._id = (id) ? id : uuidv4()
    this._icon = icon
  }

  /**
   * getLabel
   *
   * @returns {string}
   */

  public abstract getLabel(): string

  /**
   * getNode
   * 
   * @abstract
   * @returns {IGraphNode}
   */

  public abstract getNode(): IGraphNode

  /**
   * getType
   *
   * @returns {string}
   */

  public getType(): string {
    return (this._type) ? this._type : ''
  }

  /**
   * getIcon
   *
   * @returns {string}
   */

  public getIcon(): string {
    return (this._icon) ? this._icon : ''
  }

  /**
   * getID
   *
   * @returns {string}
   */

  public getID(): string {
    return this._id
  }

  /**
   * getRootNode
   *
   * @returns {string}
   */

  public getRootNodeID(): string {
    return this.getID()
  }

  /**
   * getLinks
   *
   * @param sourceNodeID {string}
   * @param label {string | undefined}
   * @returns {IGraphLink}
   */

  public getLink(targetNodeID: string, label?:string, value?: number): IGraphLink {

    // Use current sourceNodeID unless overrided by parameter
    label = label ? label : this.getLabel()

    // Return translated EventGraph Link Object
    return createLink(
                      this.getID(),
                      targetNodeID,
                      label,
                      value
                     )
  }

  /**
   * getGraphData
   * 
   * @param {string} targetNodeID
   * @returns {IGraphData}
   */

  public getGraphData(targetNodeID?: string): IGraphData {

    let graphData: IGraphData = createGraphDataObject()

    graphData.nodes.push( this.getNode() )

    if (targetNodeID) {
      graphData.links.push( this.getLink(targetNodeID) )
    }

    return graphData
  }

  /**
   * getEventData
   *
   * @returns {IEventData}
   */

  public getEventData(): IEventData {
    return createEventData()
  }
}