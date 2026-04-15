import React, { ReactElement, ReactNode } from "react"
import Box from '@mui/material/Box'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Chip from '@mui/material/Chip'
import useNodeTypesOnStage from '../../hooks/useNodeTypesOnStage'
import useNavSelectedTypes from '../../hooks/useNavSelectedTypes'
import ICallback from "../../../domain/ICallback"

/**
 * CONST
 */

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
 * @type
 */

declare type Props = {
  onUpdate: ICallback
}

/**
 * NodeTypesSelectDisplay
 *
 * @function
 */

const NodeTypesSelectDisplay: (props: Props) => ReactElement = (props: Props): ReactElement => {

  const selectedTypes       : Set<string>               = useNavSelectedTypes(),
        availableTypes      : string[]                  = useNodeTypesOnStage()

  /**
   * handleChange
   *
   * @param event 
   */

  const handleChange: (event: SelectChangeEvent<string[]>, child: ReactNode) => void = (event: SelectChangeEvent<string[]>, child: ReactNode): void => {
    if (props.onUpdate) {
      props.onUpdate( new Set(event.target.value as string[]) )
    }
  }

  /**
   * @returns {ReactElement}
   */

  return (
    <div>
      <FormControl sx={{ m: 1, width: 300, margin: '20px' }}>
        <InputLabel id="node-type-select-label">ActiveType(s)</InputLabel>
        <Select
          labelId="node-type-select-label"
          multiple
          value={[...selectedTypes]}
          onChange={handleChange}
          input={<OutlinedInput id="select-multiple-chip"/>}
          MenuProps={MenuProps}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
              {selected.map((value) => (
                <Chip key={value} label={value} sx={{color: 'white'}} />
              ))}
            </Box>
          )}
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
      </FormControl>
    </div>
  )
}

/**
 * EXPORT
 */

export default NodeTypesSelectDisplay