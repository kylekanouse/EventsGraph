import React, { ChangeEvent, FormEvent } from 'react'
import { Container, Form, FormProps, Header, InputOnChangeData, Label } from 'semantic-ui-react'
import { constants } from '../../../../../server/constants'
import IEventsGraphCollectionContextRequest from '../../../../../server/domain/IEventsGraphCollectionContextRequest'
import IControlProps from '../../../../domain/IControlsProps'

/**
 * Get environment vars
 */

const collectionID        : string = constants.TWITTER_COLLECTION_ID
const context             : string = constants.TWITTER_FILTERED_STREAM_CONTEXT_ID
const maxSampleSize       : number = constants.TWITTER_FITERED_STREAM_MAX_SAMPLE_SIZE
const submitButtonText    : string = constants.CONTROLS_SUBMIT_BUTTON_TEXT
const defaultSampleSize   : number = __TWITTER_DEFAULT_FILTERED_STREAM_SAMPLE_SIZE__
const numberPattern       : string = "[+-]?\d+(?:[.,]\d+)?"
const maxLength           : number = 3

/**
 * ControlsID
 *
 * @constant
 * @type {string}
 */

 export const ControlsID: string = collectionID + constants.SEP + context

/**
 * IControlState
 *
 * @interface
 */

interface IControlsState {
  sampleSize: number
}

/**
 * getUpdateRequest
 *
 * @param {IControlsState} data
 * @returns {IEventsGraphCollectionContextRequest}
 */

const getUpdateRequest = (data: IControlsState): IEventsGraphCollectionContextRequest => {

  return {
    collection: collectionID,
    context: context,
    isStream: true,
    params: {
      sampleSize: data.sampleSize
    }
  }
}

/**
 * RequestTweetFilterStreamControls
 *
 * @extends {React.Component}
 * @exports
 */

export default class RequestTweetFilterStreamControls extends React.Component<IControlProps, IControlsState> {

  /**
   * constructor
   *
   * @param props
   */

  constructor(props: any) {

    // Call super with passed props
    super(props)

    // Set state
    this.state = {
      sampleSize: defaultSampleSize
    }
  
    // Bind this to handler methods
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  /**
   * handleChange
   *
   * @param {ChangeEvent<HTMLInputElement>} event
   * @param {InputOnChangeData} data
   * @returns {void}
   */

  handleChange(event: ChangeEvent<HTMLInputElement>, data: InputOnChangeData): void {
    const { value, name } = event.target
    this.setState(oldValues => ({...oldValues, [name]: value }))
  }

  /**
   * handleSubmit
   *
   * @param {FormEvent<HTMLFormElement>} e
   * @param {FormProps} data
   * @returns {void}
   */

  handleSubmit(e: FormEvent<HTMLFormElement>, data: FormProps): void { 
    this.props.onControlsUpdate( getUpdateRequest(this.state) )
  }

  /**
   * render
   *
   * @returns
   */

  render() {
    return (
      <div>
        <Container fluid>
          <Form onSubmit={this.handleSubmit}>
            <Form.Input name="sampleSize" label="# of Tweets:" value={this.state.sampleSize} onChange={this.handleChange} />
            <Form.Button fluid>{submitButtonText}</Form.Button>
          </Form>
        </Container>
      </div>
    )
  }
}