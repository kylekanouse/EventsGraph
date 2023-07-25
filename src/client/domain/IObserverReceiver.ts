import Observed from '../lib/Observer'

/**
 * IObserverReceiver
 *
 * @interface
 */

export default interface IObserverReceiver<TProps, TStateMe = any, TStateSender = any> {
  (props: TProps, sub?: TStateMe, pub?: TStateSender): void
}