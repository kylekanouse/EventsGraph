import React from "react"
import { Box, Grid, Typography, FormLabel, FormControl, Select, MenuItem, SelectChangeEvent } from "@mui/material"
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
 */

const controlOptions = [
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
   * @param {SelectChangeEvent} e
   * @returns {void}
   */

  handleSelectChange = (e: SelectChangeEvent<string>): void => this.setState({ controlType: e.target.value })

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
        <FormLabel>
          <Grid container className="segment padded centered" direction="column" alignItems="center">
            <Typography variant="h6">Request Graph</Typography>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select displayEmpty value={this.state.controlType} onChange={this.handleSelectChange}>
                <MenuItem value="" disabled>Select Context ----</MenuItem>
                {controlOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.text}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </FormLabel>
        {this.state.controlType !== '' && 
        <Grid container className="segment padded centered" direction="column" alignItems="center">
          <Grid item>
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
          </Grid>
        </Grid>
        }
      </div>
    )
  }
}
