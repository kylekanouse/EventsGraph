/**
 * IObserverReducer
 * 
 * @description basic callback interface 
 * @interface
 */

export default interface IObserverReducer<TState, TProps> {
  (prevState: TState, message: TProps): TState
}