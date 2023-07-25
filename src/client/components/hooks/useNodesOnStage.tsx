import { useState, useEffect } from 'react'
import NodesOnStageObserved from '../../lib/observers/NodesOnStageObserved'
import { NodesOnStage } from '../../types/NodesOnStage'
import { NodesOnStageMessage } from '../../types/NodesOnStageMessage'

/**
 * useNodesOnStage
 *
 * @description hook used to expose NodesOnStageObserved to react components
 * @returns 
 */

const useNodesOnStage: () => NodesOnStage = (): NodesOnStage => {

  const [nodesOnStage, setNodesOnStage] = useState(NodesOnStageObserved.nodesOnStage)

  /**
   * handleUpdate
   *
   * @param {NodesOnStageMessage} message
   */

  const handleUpdate: (message: NodesOnStageMessage) => void = (message: NodesOnStageMessage): void => {
    setNodesOnStage(message.nodes)
  }

  /**
   * Effect
   */

  useEffect( () => {
    NodesOnStageObserved.onUpdate( handleUpdate )
    return (): void => {
      NodesOnStageObserved.removeOnUpdate( handleUpdate )
    }
  })

  return nodesOnStage
}

/**
 * Export
 */

export default useNodesOnStage