import { useState, useEffect } from 'react'
import NavSelectedTypesObserved from '../../lib/observers/NavSelectedTypesObserved'
import { SetStringsMessage } from '../../types/SetStringsMessage'

/**
 * useNavSelectedNodeTypes
 *
 * @description hook used to expose NodesOnStageObserved to react components
 * @returns 
 */

const useNavSelectedTypes: () => Set<string> = (): Set<string> => {

  const [selectedTypes, setSelectedTypes] = useState(NavSelectedTypesObserved.selectedTypes)

  /**
   * handleUpdate
   *
   * @param {NodesOnStageMessage} message
   */

  const handleUpdate: (message: SetStringsMessage) => void = (message: SetStringsMessage): void => { setSelectedTypes(message.values) }

  /**
   * Effect
   */

  useEffect( () => {
    NavSelectedTypesObserved.onUpdate( handleUpdate )
    return (): void => {
      NavSelectedTypesObserved.removeOnUpdate( handleUpdate )
    }
  })

  return selectedTypes
}

/**
 * Export
 */

export default useNavSelectedTypes