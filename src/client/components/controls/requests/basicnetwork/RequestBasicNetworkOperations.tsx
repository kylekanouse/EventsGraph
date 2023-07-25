import React, { ChangeEvent, FormEvent, MouseEventHandler } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { constants } from '../../../../../server/constants'
import IControlProps from '../../../../domain/IControlsProps'
import DummyRequests from '../../../../data/mock.twitter.tweet-looup.request'

/**
 * Get environment vars
 */

const collectionID        : string = constants.BASICNETWORK_COLLECTION_ID
const context             : string = constants.BASICNETWORK_OPERATIONS_CONTEXT_ID
const submitButtonText    : string = constants.CONTROLS_SUBMIT_BUTTON_TEXT

/**
 * ControlsID
 *
 * @constant
 * @type {string}
 */

export const ControlsID: string = collectionID + constants.SEP + context

/**
 * RequestTweetSearchControls
 *
 * @extends {React.Component}
 * @exports
 */

export default class RequestBasicNetworkOperationsControls extends React.Component<IControlProps, {}> {

  /**
   * constructor
   *
   * @param props
   */

  constructor(props: any) {

    // Call super with passed props
    super(props)
  
    // Bind this to handler methods
    this.handleClicked = this.handleClicked.bind(this)
  }



  /**
   * handleClicked
   *
   * @param {FormEvent<HTMLFormElement>} e
   * @param {FormProps} data
   * @returns {void}
   */

  handleClicked(): void { 
    this.props.onControlsUpdate( DummyRequests.basicnetworkOperationsRequest )
  }

  /**
   * render
   *
   * @returns
   */

  render() {
    return (
      <Box>
        <Button variant="contained" onClick={this.handleClicked}>{submitButtonText}</Button>
      </Box>
    )
  }
}