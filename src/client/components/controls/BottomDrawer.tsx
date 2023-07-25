import React, { ReactElement } from 'react'
import IconButton from '@material-ui/core/IconButton'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import { KeyboardArrowUp } from '@material-ui/icons'
import NodeTypesSelectDisplay from './displays/NodeTypesSelectDisplay'
import NavSelectedTypesObserved from '../../lib/observers/NavSelectedTypesObserved'

/**
 * CONST
 */

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
});

/**
 * BottomDrawer
 *
 * @returns 
 */

const BottomDrawer: () => ReactElement = () => {

  const classes = useStyles()
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