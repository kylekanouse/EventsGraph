import React from "react"
import IEGCircularButtonProps from '../../domain/IEGCircularButtonProps'
import { IconButton, Icon } from "@mui/material"

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

  handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
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
        <IconButton onClick={this.handleClick} className={'circular ui icon button eg-circular ' + this.props.toggleState}>
          <Icon className={this.props.icon}></Icon>
        </IconButton>
      </div>
    )
  }
}