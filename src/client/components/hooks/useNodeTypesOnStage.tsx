import Node from '../../lib/Node'
import { NodesOnStage } from '../../types/NodesOnStage'
import useNodesOnStage from './useNodesOnStage'

/**
 * useNodeTypesOnStage
 *
 * @description React hook used to bind list of current 
 * @hook
 * @returns 
 */

const useNodeTypesOnStage: () => string[] = (): string[] => {

  const nodes   : NodesOnStage        = useNodesOnStage(),
        types   : Set<string>         = new Set()

  // Collect node types
  const callbackfn: (node: Node) => void = (node: Node): void => {
    if (node.type) {
      types.add(node.type as string)
    }
  }

  // Loop through all nodes
  nodes.forEach( callbackfn )

  // Return set of all node types
  return [...types] as string[]
}

/**
 * Export
 */

export default useNodeTypesOnStage