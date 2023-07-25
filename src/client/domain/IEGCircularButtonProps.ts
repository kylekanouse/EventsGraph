
/**
 * IEGCircularButtonProps
 *
 * @interface
 */

export default interface IEGCircularButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  icon?: string
  toggleState?: boolean
}