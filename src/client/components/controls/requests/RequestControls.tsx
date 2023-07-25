import React, { SyntheticEvent } from "react"
import { DropdownItemProps, DropdownProps, Grid, GridRow, Header, Label, Select } from "semantic-ui-react"
import IEventsGraphCollectionContextRequest from "../../../../server/domain/IEventsGraphCollectionContextRequest"
import IControlProps from "../../../domain/IControlsProps"
import RequestTweetFilterStreamControls, { ControlsID as RequestTweetFilterStreamControlsID  } from "./twitter/RequestTweetFilterStreamControls"
import RequestTweetSearchControls, { ControlsID as RequestTweetSearchControlsID } from './twitter/RequestTweetSearchControls'
import RequestTwitterUserControls, { ControlsID as RequestTwitterUserControlsID} from './twitter/RequestTwitterUserControls'
import RequestTweetsLookupControls, { ControlsID as RequestTweetsLookupControlsID} from './twitter/RequestTweetsLookupControls'
import RequestBasicNetworkOperations, { ControlsID as RequestBasicNetworkOperationsControlsID } from './basicnetwork/RequestBasicNetworkOperations'
import RequestDummyData, { ControlsID as RequestDummyDataBasicControlsID } from './dummydata/RequestDummyData'

/**
 * RequestControlsState
 *
 * @description Interface for request controls state object
 * @interface
 */

interface IRequestControlsState {
  controlType: string
}

/**
 * controlOptions
 * 
 * @type {DropdownItemProps[]}
 */

const controlOptions: DropdownItemProps[] = [
  { value: RequestDummyDataBasicControlsID, text: 'Dummy Data Basic' },
  { value: RequestBasicNetworkOperationsControlsID, text: 'BasicNetwork Operations' },
  { value: RequestTweetFilterStreamControlsID, text: 'Twitter Filtered Stream' },
  { value: RequestTweetSearchControlsID, text: 'Twitter Search Tweets' },
  { value: RequestTweetsLookupControlsID, text: 'Twitter Tweets Lookup' },
  { value: RequestTwitterUserControlsID, text: 'Twitter User Lookup' },
]

/**
 * RequestControls
 *
 * @extends {React.Component}
 */

export default class RequestControls extends React.Component<IControlProps, IRequestControlsState> {

  /**
   * constructor
   *
   * @param {any} props 
   */

  constructor(props: any) {

    super(props)

    this.state                      = {controlType: ''}
    this.handleSelectChange         = this.handleSelectChange.bind(this)
    this.handleControlsUpdate       = this.handleControlsUpdate.bind(this)
  }

  /**
   * handleSelectChange
   *
   * @param {SyntheticEvent<HTMLElement, Event>} e
   * @param {DropdownProps} data 
   * @returns {void}
   */

  handleSelectChange = (e: SyntheticEvent<HTMLElement, Event>, data: DropdownProps): void => this.setState({ controlType: data.value as string})

  /**
   * handleControlUpdate
   *
   * @param {IEventsGraphCollectionContextRequest} resp
   */

  handleControlsUpdate = (resp: IEventsGraphCollectionContextRequest): void => {
    this.props.onControlsUpdate(resp)
  }

  /**
   * render
   *
   * @returns
   */

  render() {
    return (
      <div className='control-btn-container'>
        <Label>
          <Grid className="segment padded centered">
            <Header as='h3'>Request Graph</Header>
            <Select placeholder='Select Context ----' options={controlOptions} onChange={this.handleSelectChange}></Select>
          </Grid>
        </Label>
        {this.state.controlType !== '' && 
        <Grid className="segment padded centered">
          <GridRow>
          {this.state.controlType === RequestDummyDataBasicControlsID &&
            <RequestDummyData onControlsUpdate={this.handleControlsUpdate}></RequestDummyData> 
          }
          {this.state.controlType === RequestBasicNetworkOperationsControlsID &&
            <RequestBasicNetworkOperations onControlsUpdate={this.handleControlsUpdate}></RequestBasicNetworkOperations> 
          }
          {this.state.controlType === RequestTweetSearchControlsID &&
            <RequestTweetSearchControls onControlsUpdate={this.handleControlsUpdate}></RequestTweetSearchControls>
          }
          {this.state.controlType === RequestTweetFilterStreamControlsID &&
            <RequestTweetFilterStreamControls onControlsUpdate={this.handleControlsUpdate}></RequestTweetFilterStreamControls>
          }
          {this.state.controlType === RequestTwitterUserControlsID &&
            <RequestTwitterUserControls onControlsUpdate={this.handleControlsUpdate}></RequestTwitterUserControls>
          }
          {this.state.controlType === RequestTweetsLookupControlsID &&
            <RequestTweetsLookupControls onControlsUpdate={this.handleControlsUpdate}></RequestTweetsLookupControls>
          }
          </GridRow>
        </Grid>
        }
      </div>
    )
  }
}
