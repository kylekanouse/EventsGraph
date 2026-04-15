import React from "react"
import IEventsGraphCollectionContextRequest from "../../../server/domain/IEventsGraphCollectionContextRequest"
import IHUDProps from "../../domain/IHUDProps"
import RequestControls from './requests/RequestControls'
import Button from '../form/EGCircularButton'
import ActiveNodesDisplay from './displays/ActiveNodesDisplay'
import BottomDrawer from './BottomDrawer'
/**
 * requestTogglerBtnIcon
 *
 * @description Semantic icon ID to be used for requests toggler button
 * @constant
 */

const requestTogglerBtnIcon: string = 'plus'

/**
 * IHUDState
 *
 * @description Interface for request controls state object
 * @interface
 */

interface IHUDState {
  requestControlsVisible: boolean
}

/**
 * HUD
 *
 * @class
 * @extends {React.Component}
 */

export default class HUD extends React.Component<IHUDProps, IHUDState> {

  /**
   * constructor
   *
   * @param {any} props 
   */

  constructor(props: any) {

    super(props)

    this.state             = {requestControlsVisible: true}

    this.onKeyUp           = this.onKeyUp.bind(this)
  }

  /**
   * onRequestControlUpdate
   *
   * @param {IEventsGraphCollectionContextRequest} resp
   */

  onRequestControlsUpdate = (resp: IEventsGraphCollectionContextRequest): void => {
    this.props.onRequestControlsUpdate(resp)
  }

  /**
   * toggleSideBar
   */

  toggleSideBar = (event?: React.MouseEvent<HTMLButtonElement>): void => {
    this.setState({requestControlsVisible: !this.state.requestControlsVisible})
  }

  onKeyUp = (event: KeyboardEvent): void => {
    if (event.code === 'Backquote') {
      this.toggleSideBar()
    }
  }

  componentDidMount(){
    document.addEventListener("keydown", this.onKeyUp, false)
  }

  componentWillUnmount(){
    document.removeEventListener("keydown", this.onKeyUp, false)
  }

  /**
   * render
   *
   * @returns
   */

   render() {
    return (
      <div id='hud'>
        <div className='hud-sidebar-panel'>
          <div className='toggle-btn'>
            <Button onClick={this.toggleSideBar} icon={requestTogglerBtnIcon} toggleState={this.state.requestControlsVisible}></Button>
          </div>
          <div 
            className={this.state.requestControlsVisible 
            ? "display-window open"
            : "display-window closed"}
          >
            <RequestControls onControlsUpdate={this.onRequestControlsUpdate}></RequestControls>
            <ActiveNodesDisplay />
          </div>
        </div>
        <BottomDrawer></BottomDrawer>
      </div>
    )
  }
}