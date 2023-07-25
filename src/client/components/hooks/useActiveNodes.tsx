import { useState, useEffect } from 'react'
import ActiveNodesObserved from '../../lib/observers/ActiveNodesObserved'
import { ActiveNodes } from '../../types/ActiveNodes'

/**
 * CONST
 */

/**
 * useActiveNodes
 *
 * @returns 
 */

const useActiveNodes: () => ActiveNodes = (): ActiveNodes => {

  const [activeNodes, setActiveNodes] = useState( ActiveNodesObserved.activeNodes )

  console.log('useActiveNodes | activeNodes = ', activeNodes)

  /**
   * handleUpdate
   *
   * @param {ActiveNodes} message
   */

  const handleUpdate: (message: ActiveNodes) => void = (message: ActiveNodes): void => {
    console.log('useActiveNodes | message = ', message)
    setActiveNodes( message )
  }

  /**
   * Effect
   */

  useEffect( () => {
    console.log('useActiveNodes | effect | create | activeNodes.size = ', activeNodes.size)
    ActiveNodesObserved.onUpdate( handleUpdate )
    return (): void => {
      console.log('useActiveNodes | effect | destroy | activeNodes.size = ', activeNodes.size)
      ActiveNodesObserved.removeOnUpdate( handleUpdate )
    }
  })

  return activeNodes
}

/**
 * Export
 */

export default useActiveNodes