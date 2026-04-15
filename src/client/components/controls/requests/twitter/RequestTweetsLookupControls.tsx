import React, { ChangeEvent, FormEvent } from 'react'
import { Form, FormProps, InputOnChangeData } from 'semantic-ui-react'
import { constants } from '../../../../../server/constants'
import IEventsGraphCollectionContextRequest from '../../../../../server/domain/IEventsGraphCollectionContextRequest'
import IControlProps from '../../../../domain/IControlsProps'

/**
 * Get environment vars
 */

const collectionID        : string = constants.TWITTER_COLLECTION_ID
const context             : string = constants.TWITTER_TWEETS_LOOKUP_CONTEXT_ID
const submitButtonText    : string = constants.CONTROLS_SUBMIT_BUTTON_TEXT
const placeholderText     : string = constants.TWITTER_TWEETS_LOKUP_PLACEHOLDER_TEXT

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
  ids: string
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
    isStream: false,
    params: {
      ids: data.ids
    }
  }
}

/**
 * RequestTweetsLookupControls
 *
 * @extends {React.Component}
 * @exports
 */

export default class RequestTweetsLookupControls extends React.Component<IControlProps, IControlsState> {

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
      ids: ''
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
        <Form onSubmit={this.handleSubmit}>
          <Form.Input name="ids" label="Tweet ID(s):" value={this.state.ids} onChange={this.handleChange}  placeholder={placeholderText}/>
          <Form.Button fluid>{submitButtonText}</Form.Button>
        </Form>
      </div>
    )
  }
}