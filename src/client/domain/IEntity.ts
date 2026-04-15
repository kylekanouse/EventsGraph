import Node from "../lib/Node";

/**
 * IEntity
 *
 * @interface
 */
export default interface IEntity<T> {
  onBlurred(): IEntity<T>
  onClick(event: MouseEvent): IEntity<T>
  onDblClick(event: MouseEvent): IEntity<T>
  onFocused(): IEntity<T>
  onHover(): IEntity<T>
  onOut(): IEntity<T>
  activate(): IEntity<T>
  deactivate(): IEntity<T>
}