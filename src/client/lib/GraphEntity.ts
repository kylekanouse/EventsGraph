import { Object3D } from "three"
import Entity from "./Entity"
import IGraphEntity from "../domain/IGraphEntity"

/**
 * GraphEntity
 *
 * @description Main wrapper for an entity to add graph related concepts like graphdata to entity
 * @abstract
 * @class
 */

export default abstract class GraphEntity<T, DataObj> extends Entity<T> implements IGraphEntity<DataObj> {

  /**
   * constructor
   *
   * @param {Object3D} object3D
   * @param {id | undefined} id
   */

  constructor(object3D?: Object3D, id?: string | number) {

    if (object3D) {
      object3D.userData['type'] = 'graphEntity'
    }

    // Call Super
    super(object3D, id)

    // set onstage true due to being a graph entity that is already on stage
    this._isOnStage = true
  }

  /**
   * ############################################### PUBLIC
   */

  /**
   * getData
   *
   * @abstract
   * @public
   * @returns {DataObj}
   */

  abstract getData(): DataObj

  /**
   * OVERRIDES
   * 
   * @description 3DForceGraph manages the Object3D for graph entities so disable certain functionality
   */

   addToStage(): GraphEntity<T, DataObj> {
     return this
   }

   removeFromStage(): GraphEntity<T, DataObj> {
    return this
   }
}