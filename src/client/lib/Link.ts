import { EntityType } from "../types/EntityType"
import { GraphLinkObject } from "../types/GraphLinkObject"
import GraphEntity from "./GraphEntity"
import { getIDFromObj, getSourceIDFroObj, getTargetIDFroObj } from "./Utils"

/**
 * CONST
 */

const ID: EntityType = 'Link'


/**
 * Link
 *
 * @extends {GraphEntity}
 */

export default class Link extends GraphEntity<Link, GraphLinkObject> {

  public static TYPE_ID     : EntityType = ID

  private _sourceID         : string | number | undefined

  private _targetID         : string | number | undefined

  private _graphObj         : GraphLinkObject

  /**
   * constructordata.source
   *
   * @param {IGraphLink} data
   */

  constructor(obj: GraphLinkObject) {

    // Setup abstrct constructor
    super(obj.__lineObj, getIDFromObj(obj))

    // Assign parameters
    this._sourceID    = getSourceIDFroObj(obj)
    this._targetID    = getTargetIDFroObj(obj)
    this._graphObj    = obj
  }

  /**
   * ############################################### GETTER / SETTER
   */

  /**
   * entityTypeID
   */

  get entityTypeID(): EntityType {
    return Link.TYPE_ID
  }
  
  get source(){ return this._graphObj.source }

  get sourceID() { return this._sourceID }

  get target() { return this._graphObj.target }

  get targetID() { return this._targetID }
  
  get label() { return this._graphObj.label }

  get val() { return this._graphObj.val }

  /**
   * ############################################### PUBLIC
   */

  /**
   * getData
   *
   * @returns {GraphLinkObject}
   */

  getData(): GraphLinkObject  { return this._graphObj }
}