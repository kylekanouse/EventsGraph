import Observer from './Observer'

/**
 * Observer
 *
 * @description Singleton Factory controller for managing messaging and shared observed state for application
 */

export default class ObserverController {

  /**
   * _observables
   *
   * @type {Map<string , any>}
   */

  private static _observables: Map<string , any> = new Map()

  /**
   * createObserved<T>
   *
   * @param {string} id
   * @param {T} props
   * @returns {Observer<T>}
   */

  public static createObserved<T>(id: string, props?: T): Observer<T> {

    if (ObserverController._observables.has(id)) {
      return ObserverController._observables.get(id)
    }

    return ObserverController._observables
                                .set(id, new Observer(id, props))
                                .get(id)
  }

  /**
   * addObserved
   *
   * @param {Observer<T>} observed
   * @returns {Observer<T>}
   */

  public static addObserved<T>(observed: Observer<T>): Observer<T> {

    if (ObserverController._observables.has(observed.id)) {
      return observed
    }

    return ObserverController._observables
                                .set(observed.id, observed)
                                .get(observed.id)
  }

  /**
   * getObserver<T>
   *
   * @param {string} id
   * @returns {Observer<T> | undefined}
   */

  public static getObserver<T>(id: string): Observer<T> | undefined {
    return ObserverController._observables.get(id)
  }

  /**
   * destroy
   */

  public static destroy(): void {
    ObserverController._observables.forEach((observed): void => {
      observed.destroy()
    })
  }
}