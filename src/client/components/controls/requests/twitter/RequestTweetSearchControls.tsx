import React, { ChangeEvent } from 'react'
import { constants } from '../../../../../server/constants'
import IEventsGraphCollectionContextRequest from '../../../../../server/domain/IEventsGraphCollectionContextRequest'
import IControlProps from '../../../../domain/IControlsProps'
import { TextField, Button } from '@mui/material'

/**
 * Get environment vars
 */

const collectionID            : string = constants.TWITTER_COLLECTION_ID
const context                 : string = constants.TWITTER_TWEET_SEARCH_CONTEXT_ID
const submitButtonText        : string = constants.CONTROLS_SUBMIT_BUTTON_TEXT
const defaultQuery            : string = ''
const DEFAULT_COUNT           : number = constants.TWITTER_DEFAULT_TWEET_COUNT
const placeholderText         : string = constants.TWITTER_TWEETS_QUERY_PLACEHOLDER_TEXT
const countPlaceholderText    : string = 'Tweet Count'
const searchInputLabel        : string = constants.TWITTER_TWEETS_QUERY_PLACEHOLDER_TEXT

/**
 * ControlsID
 *
 * @constant
 * @type {string}
 */

export const ControlsID: string = collectionID.concat(constants.SEP, context)

/**
 * IControlState
 *
 * @interface
 */

interface IControlsState {
  query: string,
  max_results: number
}

/**
 * getUpdateRequest
 *
 * @param {IControlsState} data
 * @returns {IEventsGraphCollectionContextRequest}
 */

const getUpdateRequest: (data: IControlsState) => IEventsGraphCollectionContextRequest = (data: IControlsState): IEventsGraphCollectionContextRequest => {

  return {
    collection: collectionID,
    context: context,
    isStream: false,
    params: {
      query: data.query,
      max_results: data.max_results
    }
  }
}

/**
 * RequestTweetSearchControls
 *
 * @extends {React.Component}
 * @exports
 */

export default class RequestTweetSearchControls extends React.Component<IControlProps, IControlsState> {

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
      query: defaultQuery,
      max_results: DEFAULT_COUNT
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

  handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { value, id } = event.target
    this.setState(oldValues => ({...oldValues, [id]: value }))
  }

  /**
   * handleSubmit
   *
   * @param {FormEvent<HTMLFormElement>} e
   * @param {FormProps} data
   * @returns {void}
   */

  handleSubmit(): void { this.props.onControlsUpdate( getUpdateRequest(this.state) ) }

  /**
   * render
   *
   * @returns
   */

  render() {
    return (
      <div>
        <form noValidate autoComplete="off">
          <TextField id="query" label={searchInputLabel} value={this.state.query} placeholder={placeholderText} onChange={this.handleChange}/>
          <TextField id="max_results" label="Tweet Count #:" value={this.state.max_results} placeholder={countPlaceholderText} onChange={this.handleChange}/>
          <Button variant="contained" onClick={this.handleSubmit} disabled={!this.state.query}>{submitButtonText}</Button>
        </form>
      </div>
    )
  }
}