import React, { ReactElement, useState, ReactNode  } from "react"
import { constants } from '../../../../../server/constants'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import DummyDataType from '../../../../../server/lib/repos/oracles/dummydata/data/DummyDataType'
import IControlProps from "../../../../domain/IControlsProps"
import DummyRequests from '../../../../data/mock.twitter.tweet-looup.request'
import IEventsGraphCollectionContextRequest from "../../../../../server/domain/IEventsGraphCollectionContextRequest"

/**
 * CONST
 */

const availableTypes: DummyDataType[] = ['basic', 'request', 'singleNode']

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

/**
 * Get environment vars
 */

const collectionID        : string = constants.DUMMY_DATA_COLLECTION_ID
const context             : string = constants.DUMMY_DATA_BASIC_CONTEXT_ID
const submitButtonText    : string = constants.CONTROLS_SUBMIT_BUTTON_TEXT

/**
 * ControlsID
 *
 * @constant
 * @type {string}
 */
 
export const ControlsID: string = collectionID + constants.SEP + context

/**
 * NodeTypesSelectDisplay
 *
 * @function
 */

const RequestDummyData: (props: IControlProps) => ReactElement = (props: IControlProps) => {

  const [selectedType, setSelectedType] = useState('basic')

  /**
   * handleChange
   *
   * @param event 
   */

  const handleChange: (event: SelectChangeEvent<string>, child: ReactNode) => void = (event: SelectChangeEvent<string>, child: ReactNode): void => {
    const value: string = event.target.value as string
    setSelectedType(value) 
  }

  /**
   * handleClick
   */

  const handleClick: () => void = (): void => {

    // Use Dummy data request for request object
    const request: IEventsGraphCollectionContextRequest = DummyRequests.dummyDataRequest

    // Add selected type to params property
    request.params.type = selectedType

    // Make update callback
    props.onControlsUpdate( request )
  }

  /**
   * @returns {ReactElement}
   */

  return (
    <Box>
      <FormControl sx={{ m: 1, margin: '5px' }} fullWidth>
        <InputLabel id="dummy-data-type-select-label">Request Type</InputLabel>
        <Select
          labelId="dummy-data-type-select-label"
          id="dummy-data-type-select"
          value={selectedType}
          input={<OutlinedInput id="select-dummy-data-type" sx={{width: '200px'}}/>}
          label="Request Type"
          onChange={handleChange}
          MenuProps={MenuProps}
        >
        {availableTypes.length == 0 &&
          <MenuItem >
            No Types Available
          </MenuItem>
        }
        {availableTypes.map((name: string) => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
        </Select>
        <Button variant="contained" onClick={handleClick} sx={{marginTop: '20px'}}>{submitButtonText}</Button>
      </FormControl>
    </Box>
  )
}

/**
 * EXPORT
 */

export default RequestDummyData