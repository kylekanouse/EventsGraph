import { Uboot } from '@uboot/uboot'
import { getOcean } from './Utils'
import IObserverReducer from '../domain/IObserverReducer'
import IObserverReceiver from '../domain/IObserverReceiver'
import ObserverController from './ObserverController'

/**
 * Observer
 *
 * @class
 */

export default class Observer<T> {

  private _id: string

  /**
   * _uBoot
   *
   * @private
   * @type {Uboot}
   */

  private _uBoot: Uboot

  /**
   * constructor
   *
   * @param {string} id
   * @param {T} props
   */

  constructor(id: string, props?: T) {
    this._id        = id
    this._uBoot     = getOcean().uboot(this._id, (props) ? props : {})
  }

  /**
   * id
   *
   * @type {string}
   */

  get id(): string {
    return this._id
  }

  /**
   * props
   * 
   * @returns {T}
   */

  get props(): T {
    return this._uBoot.state() as T
  }

  /**
   * destroy
   *
   * @returns {Observer<T>}
   */

  destroy(): Observer<T> {
    getOcean().sink(this._id)
    return this
  }

  /**
   * mutate
   *
   * @param event 
   * @param cb 
   */

  mutate<TProps>(event: string, cb: IObserverReducer<T, TProps>): Observer<T> {

    // Setup mutation event on uboot
    const sub = this._uBoot
                      .radio(event)
                      .mutate<TProps>((state, message): T => {
                        return cb(state as T, message as TProps)
                      })

    return this
  }

  /**
   * subscribe
   *
   * @param event 
   * @param cb 
   */

  subscribe<TProps>(event: string, cb: IObserverReceiver<TProps>): Observer<T> {

    // Setup recieve event on uboot
    const sub = this._uBoot
                      .radio(event)
                      .receive<TProps>((sub: Uboot, pub: Uboot, msg: TProps) => {
                        // Callback with passing message along with Observers
                        cb(
                            msg,
                            ObserverController.getObserver<T>(sub.id),
                            ObserverController.getObserver<T>(pub.id)
                          )
                      })

    return this
  }

  /**
   * send
   *
   * @param {string} event
   * @param {TProps} message
   * @returns {Observer<T>}
   */

  send<TProps>(event: string, message: TProps): Observer<T> {

    this._uBoot.radio(event).send<TProps>(message)

    return this
  }
}