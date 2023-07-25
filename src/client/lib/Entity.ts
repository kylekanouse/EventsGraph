import { Object3D, Scene } from "three"
import { v4 as uuidV4} from "uuid"
import IEntity from "../domain/IEntity"
import { createHoverObject, getScene } from "./Utils"
import EntityClickedOberved from './observers/EntityClickedObserved'
import EntityActiveObserved from './observers/EntityActiveObserved'
import EntityOnStageObserved from "./observers/EntityOnStageObserved"
import { EntityPointerEventMessage } from "../types/EntityPointerEventMessage"
import { EntityType } from "../types/EntityType"
import { EntityAddedToStageMessage } from "../types/EntityAddedToStageMessage"
import EntityFocusedObserved from "./observers/EntityFocusedObserved"
import EntityHoverObserved from "./observers/EntityHoverObserved"
import { EntityConditions } from "../types/EntityConditions"

/**
 * Entity<T>
 *
 * @description Main abstract class for defining entity which is lowest unit element used in events graph
 * @abstract
 * @class
 * @implements {IEntity<T>}
 */
export default abstract class Entity<T> implements IEntity<T> {

  public static TYPE_ID                 : EntityType

  private _id                           : string | number

  protected _object3D                   : Object3D | undefined

  protected  _hoverObj                  : Object3D | undefined

  protected _scene                      : Scene

  protected _isActive                   : boolean             = false

  protected _isOnStage                  : boolean             = false

  protected _isOver                     : boolean             = false

  protected _isFocused                  : boolean             = false

  protected _index                      : number              = 0

  protected _prevEntity                 : T | undefined

  protected _nextEntity                 : T | undefined

  protected _hoverObjHeight             : number | undefined

  /**
   * constructor
   *
   * @param {any} object3D
   * @param {Scene} scene
   * @param {id | undefined} id
   */

  constructor(object3D?: Object3D, id?: string | number) {

    this._id                      = (id) ? id : uuidV4()
    this._object3D                = object3D
    this._scene                   = getScene()
    // this._hoverObj                = createHoverObject()
    // this._hoverObjHeight          = this._hoverObj.userData['height']

    this._init()
  }

  /**
   * ############################################### GETTER / SETTER
   */

  /**
   * ##### GETTER
   */

  abstract get entityTypeID()     : EntityType

  get id()                        : string | number { return this._id }

  get index()                     : number { return this._index }

  get isOver()                    : boolean { return this._isOver }

  get isFocused()                 : boolean { return this._isFocused }

  get isActive()                  : boolean { return this._isActive }

  get isOnStage()                 : boolean { return this._isOnStage }

  get next()                      : T | undefined { return this._nextEntity }

  get object3D()                  : Object3D | undefined { return this._object3D }

  get previous()                  : T | undefined { return this._prevEntity }

  get scene()                     : Scene { return this._scene }

  /**
   * ##### SETTER
   */

  set index(value: number) { this._index = value }

  set next(obj: T | undefined) { this._nextEntity = obj }

  set previous(obj: T | undefined) { this._prevEntity = obj }

  /**
   * ############################################### PRIVATE
   */

  /**
   * _activateEntity
   *
   * @description Entity implmentation for entity scoped activated state
   * @private
   */

  private _activateEntity(): void { this._isActive = true }

  /**
   * _blurrEntity
   * 
   * @private
   */

  private _blurrEntity(): void { this._isFocused = false }

  /**
   * _clicked
   *
   * @param {EntityPointerEventMessage} event
   */

  private _clicked(event: EntityPointerEventMessage): void {}

  /**
   * _deactivateEntity
   * 
   * @private
   */

  private _deactivateEntity(): void { this._isActive = false }

  /**
   * _focusEntity
   * 
   * @private
   */

  private _focusEntity(): void { this._isFocused = true }

  /**
   * _hover
   *
   * @private
   */

  private _hover(): void {
    if (this._hoverObj && !this._isOver) {
      this._updateHoverPosition()
      this._scene.add(this._hoverObj)
    }
    this._isOver = true
  }

  /**
   * _init
   */

  private _init(): void {

    if (this._object3D) {
      this._object3D.name = this._id.toString()
    }

    // Setup ID condition for callbacks
    const idCondition: EntityConditions = {id: this.id.toString()}

    EntityActiveObserved.onUpdate({cb: this._activateEntity.bind(this), conditions: {...idCondition, isActive: true}})

    EntityActiveObserved.onUpdate({cb: this._deactivateEntity.bind(this), conditions: {...idCondition, isActive: false}})

    EntityHoverObserved.onUpdate({cb: this._hover.bind(this), conditions: {...idCondition, isOver: true}})

    EntityHoverObserved.onUpdate({cb: this._out.bind(this), conditions: {...idCondition, isOver: false}})
  }

  /**
   * _out
   *
   * @private
   */

  private _out(): void {

    if (this._hoverObj && this._isOver) {
      this._scene.remove(this._hoverObj)
    }

    this._isOver = false
  }

  /**
   * _updatePosition
   *
   * @protected
   */

  protected _updatePosition(): void {}

  /**
   * _updateHoverPosition
   *
   * @protected
   */

  protected _updateHoverPosition(): void {}

  /**
   * ############################################### PUBLIC
   */

  /**
   * addToStage
   *
   * @returns {Entity<T>}
   */

  addToStage(): Entity<T> {

    if (!this._object3D) { return this }

    // Add object to scene
    this.scene.add( this._object3D )

    this.addedToStage()

    return this
  }

  /**
   * addedToStage
   *
   * @description used when objects already exist on stage (ex. Nodes & Links)
   * @returns 
   */

  addedToStage(): Entity<T> {

    this._updatePosition()

    this._isOnStage = true

    // Notify environment
    EntityOnStageObserved.send({action: "added", entity: this } as EntityAddedToStageMessage)

    return this
  }

  /**
   * isFocusable
   *
   * @description boolean method to let environment know if entity is able to be focused
   * @returns {boolean}
   */

  isFocusable(): boolean { return true }

  /**
   * onBlurred
   *
   * @public
   * @returns {Entity<T>}
   */

  onBlurred(): Entity<T>  { EntityFocusedObserved.send({isFocused: false, entity: this}); return this }

  /**
   * onClick
   *
   * @abstract
   * @public
   * @param {MouseEvent | undefined} event
   * @returns {Entity<T>}
   */

  onClick(event?: MouseEvent): Entity<T> {

    // Cast as Node Pointer Event type
    const entityEvent: EntityPointerEventMessage = event as EntityPointerEventMessage

    // // Associate the current node with the event
    entityEvent.entity = this
    
    // Update through observed
    EntityClickedOberved.send(entityEvent)

    return this 
  }

  /**
   * onDblClick
   *
   * @public
   * @param {MouseEvent | undefined} event
   * @returns {Entity<T>}
   */

  onDblClick(event?: MouseEvent): Entity<T> {

    // Check to Activate / Deactivate node
    if (this._isActive) {
      this.deactivate()
    } else {
      this.activate()
    }

    return this
  }

  /**
   * onFocused
   *
   * @public
   * @returns {Entity<T>}
   */

  onFocused(): Entity<T> {

    if (this.isFocusable()) {
      EntityFocusedObserved.send({isFocused: true, entity: this})
    }

    return this 
  }

  /**
   * onHover
   *
   * @public
   * @returns {Entity<T>}
   */

  onHover(): Entity<T> {

    if (!this._isOver) {
      EntityHoverObserved.send({isOver: true, entity: this})
    }

    return this
  }

  /**
   * onOut
   *
   * @public
   * @returns {Entity<T>}
   */

  onOut(): Entity<T> {

    if (this._isOver) {
      EntityHoverObserved.send({isOver: false, entity: this})
    }

    return this
  }

  /**
   * onActivate
   *
   * @public
   * @returns {Entity<T>}
   */

  activate(): Entity<T> { 

    if (!this._isActive) {
      EntityActiveObserved.send({isActive: true, entity: this})
    }

    return this
  }

  /**
   * onDeactivate
   *
   * @returns {Entity<T>}
   */

  deactivate(): Entity<T> {

    if (this._isActive) {
      EntityActiveObserved.send({isActive: false, entity: this})
    }

    return this
  }

  /**
   * destroy
   * 
   * @returns {Entity<T>}
   */

  destroy():  Entity<T> {
    console.log('Entity | destroy | id = ', this.id.toString())
    this.deactivate()
    this.onOut()
    this.removeFromStage()
    if (this._hoverObj) {
      this._scene.remove(this._hoverObj)

    }
    return this
  }
  /**
   * removeFromStage
   *
   * @returns {Entity<T>}
   */

  removeFromStage(): Entity<T> {

    if (this._object3D && this._isOnStage) {
      this.scene.remove( this._object3D )
      this._isOnStage = false

      // Notify environment
      EntityOnStageObserved.send({action: "removed", entity: this } as EntityAddedToStageMessage)
    }

    return this
  }
}