import React from "react"
import IActiveNodesDisplayProps from "../../../domain/IActiveNodesDisplayProps"
import { ActiveNodes } from '../../../types/ActiveNodes'
import ActiveNodesObserved from '../../../lib/observers/ActiveNodesObserved'
import { Box } from "@material-ui/core"

/**
 * IActiveNodesDisplayState
 *
 * @description Interface for request controls state object
 * @interface
 */

interface IActiveNodesDisplayState {
  activeNodes: ActiveNodes
}

/**
 * ActiveNodesDisplay
 *
 * @class
 * @extends {React.Component}
 */

export default class ActiveNodesDisplay extends React.Component<IActiveNodesDisplayProps, IActiveNodesDisplayState> {

  /**
   * constructor
   *
   * @param {any} props 
   */

  constructor(props?: any) {

    super(props)

    this.state = {activeNodes: ActiveNodesObserved.activeNodes}

    // Setup update bind for ActiveNodes oberver
    ActiveNodesObserved.onUpdate( this.update.bind(this) )
  }


  /**
   * update
   *
   * @description used to propagate updated activenodes state to react state binding
   * @param {ActiveNodes} activeNodes
   */

  update(activeNodes: ActiveNodes): void {
    this.setState({activeNodes: activeNodes})
  }

  /**
   * render
   *
   * @returns
   */

  render() {
    return (
      <Box>
        <p>Active Node count: {this.state.activeNodes.size}</p>
      </Box>
    )
  }
}