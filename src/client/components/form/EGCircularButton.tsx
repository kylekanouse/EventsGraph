import React from "react"
import IEGCircularButtonProps from '../../domain/IEGCircularButtonProps'
import { Button, ButtonProps, Icon } from "semantic-ui-react"

/**
 * EGCircularButton
 *
 * @class
 * @extends {React.Component}
 */

export default class EGCircularButton extends React.Component<IEGCircularButtonProps> {

  /**
   * constructor
   *
   * @param {any} props 
   */

  constructor(props: any) {
    super(props)
  }

  /**
   * handleClick
   *
   */

  handleClick = (event: React.MouseEvent<HTMLButtonElement>, data: ButtonProps): void => {
    this.props.onClick(event)
  }

  /**
   * render
   *
   * @returns
   */

  render() {
    return (
      <div>
        <Button onClick={this.handleClick} className={'circular ui icon button eg-circular ' + this.props.toggleState}>
          <Icon className={this.props.icon}></Icon>
        </Button>
      </div>
    )
  }
}