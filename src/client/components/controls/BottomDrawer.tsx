import React, { ReactElement } from 'react'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp'
import NodeTypesSelectDisplay from './displays/NodeTypesSelectDisplay'
import NavSelectedTypesObserved from '../../lib/observers/NavSelectedTypesObserved'

/**
 * BottomDrawer
 *
 * @returns 
 */

const BottomDrawer: () => ReactElement = () => {

  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  })

  /**
   * toggleDrawer
   *
   * @param anchor 
   * @param open 
   * @returns 
   */

  const toggleDrawer = (anchor: string, open: boolean) => (event: any) => {

    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }

    setState({ ...state, [anchor]: open })
  }

  /**
   * handleUpdate
   *
   * @param selectedTypes 
   */

  const handleUpdate = (selectedTypes: Set<string>): void => {
    NavSelectedTypesObserved.send({values: selectedTypes})
  }

  /**
   * @returns {ReactElement}
   */

  return (
    <div>
        <React.Fragment key="bottom">
          <IconButton id="bottomToggle" color="primary" size="medium" onClick={toggleDrawer("bottom", true)}>
            <KeyboardArrowUp fontSize="large" />
          </IconButton>
          <Drawer className="bottomDrawer" anchor="bottom" open={state["bottom"]} onClose={toggleDrawer("bottom", false)}>

            <NodeTypesSelectDisplay onUpdate={handleUpdate}></NodeTypesSelectDisplay>

            <p>
            </p>
            <br />
          </Drawer>
        </React.Fragment>
    </div>
  )
}

/**
 * EXPORT
 */

export default BottomDrawer