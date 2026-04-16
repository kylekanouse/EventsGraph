import IGraphNode from '../../../../../domain/IGraphNode'
import IGraphLink from '../../../../../domain/IGraphLink'
import IGraphData from '../../../../../domain/IGraphData'

/**
 * DiffResult
 *
 * Describes the differences between two graph states.
 */
export interface DiffResult {
  addedNodes: IGraphNode[]
  removedNodes: IGraphNode[]
  modifiedNodes: { node: IGraphNode; changes: string[] }[]
  addedLinks: IGraphLink[]
  removedLinks: IGraphLink[]
  modifiedLinks: { link: IGraphLink; changes: string[] }[]
  summary: {
    nodesAdded: number
    nodesRemoved: number
    nodesModified: number
    linksAdded: number
    linksRemoved: number
    linksModified: number
    totalChanges: number
  }
}

/**
 * diff
 *
 * Computes the structural difference between two IGraphData snapshots.
 *
 * @param oldGraph - Previous graph state
 * @param newGraph - Current graph state
 * @returns DiffResult with added, removed, and modified elements
 */
export function diff(oldGraph: IGraphData, newGraph: IGraphData): DiffResult {
  // Index nodes by ID for O(1) lookup
  const oldNodeMap = new Map(oldGraph.nodes.map((n: any) => [n.id, n]))
  const newNodeMap = new Map(newGraph.nodes.map((n: any) => [n.id, n]))

  // Added nodes: in new but not in old
  const addedNodes = newGraph.nodes.filter((n: any) => !oldNodeMap.has(n.id))

  // Removed nodes: in old but not in new
  const removedNodes = oldGraph.nodes.filter((n: any) => !newNodeMap.has(n.id))

  // Modified nodes: in both, but with different properties
  const modifiedNodes: { node: IGraphNode; changes: string[] }[] = []
  for (const [id, newNode] of newNodeMap) {
    const oldNode = oldNodeMap.get(id)
    if (oldNode) {
      const changes = _diffNode(oldNode as IGraphNode, newNode as IGraphNode)
      if (changes.length > 0) {
        modifiedNodes.push({ node: newNode as IGraphNode, changes })
      }
    }
  }

  // Index links by source+target for comparison
  const linkKey = (l: IGraphLink) => `${l.source}→${l.target}`
  const oldLinkMap = new Map(oldGraph.links.map((l: any) => [linkKey(l), l]))
  const newLinkMap = new Map(newGraph.links.map((l: any) => [linkKey(l), l]))

  const addedLinks = newGraph.links.filter((l: any) => !oldLinkMap.has(linkKey(l)))
  const removedLinks = oldGraph.links.filter((l: any) => !newLinkMap.has(linkKey(l)))

  const modifiedLinks: { link: IGraphLink; changes: string[] }[] = []
  for (const [key, newLink] of newLinkMap) {
    const oldLink = oldLinkMap.get(key)
    if (oldLink) {
      const changes = _diffLink(oldLink as IGraphLink, newLink as IGraphLink)
      if (changes.length > 0) {
        modifiedLinks.push({ link: newLink as IGraphLink, changes })
      }
    }
  }

  return {
    addedNodes,
    removedNodes,
    modifiedNodes,
    addedLinks,
    removedLinks,
    modifiedLinks,
    summary: {
      nodesAdded: addedNodes.length,
      nodesRemoved: removedNodes.length,
      nodesModified: modifiedNodes.length,
      linksAdded: addedLinks.length,
      linksRemoved: removedLinks.length,
      linksModified: modifiedLinks.length,
      totalChanges:
        addedNodes.length + removedNodes.length + modifiedNodes.length +
        addedLinks.length + removedLinks.length + modifiedLinks.length,
    },
  }
}

/**
 * diffToGraphData
 *
 * Converts a DiffResult into an IGraphData where nodes and links
 * are annotated with diff status via color coding and type prefixes.
 *
 * - Added nodes: green (#00FF00), type prefixed with "added-"
 * - Removed nodes: red (#FF4444), type prefixed with "removed-"
 * - Modified nodes: amber (#FFD700), type prefixed with "modified-"
 * - Unchanged nodes: original color
 */
export function diffToGraphData(
  currentGraph: IGraphData,
  diffResult: DiffResult,
): IGraphData {
  const addedIds = new Set(diffResult.addedNodes.map((n) => n.id))
  const modifiedIds = new Set(diffResult.modifiedNodes.map((m) => m.node.id))

  // Annotate current graph nodes
  const annotatedNodes = currentGraph.nodes.map((node: any) => {
    if (addedIds.has(node.id)) {
      return { ...node, color: '#00FF00', type: `added-${node.type}` }
    }
    if (modifiedIds.has(node.id)) {
      const changes = diffResult.modifiedNodes.find((m) => m.node.id === node.id)?.changes || []
      return {
        ...node,
        color: '#FFD700',
        type: `modified-${node.type}`,
        desc: `${node.desc}\n\nChanges: ${changes.join(', ')}`,
      }
    }
    return node
  })

  // Add removed nodes (so they're visible in the diff view)
  const removedAnnotatedNodes = diffResult.removedNodes.map((node) => ({
    ...node,
    color: '#FF4444',
    type: `removed-${node.type}`,
    val: Math.max(5, node.val * 0.5),
  }))

  // Annotate links similarly
  const addedLinkKeys = new Set(diffResult.addedLinks.map((l) => `${l.source}→${l.target}`))

  const annotatedLinks = currentGraph.links.map((link: any) => {
    const key = `${link.source}→${link.target}`
    if (addedLinkKeys.has(key)) {
      return { ...link, type: `added-${link.type || 'link'}` }
    }
    return link
  })

  const removedAnnotatedLinks = diffResult.removedLinks.map((link) => ({
    ...link,
    type: `removed-${link.type || 'link'}`,
  }))

  return {
    nodes: [...annotatedNodes, ...removedAnnotatedNodes],
    links: [...annotatedLinks, ...removedAnnotatedLinks],
  }
}

// --- Private helpers ---

function _diffNode(old: IGraphNode, now: IGraphNode): string[] {
  const changes: string[] = []
  if (old.label !== now.label) changes.push('label')
  if (old.val !== now.val) changes.push('val')
  if (old.group !== now.group) changes.push('group')
  if (old.color !== now.color) changes.push('color')
  if (old.desc !== now.desc) changes.push('desc')
  if (old.type !== now.type) changes.push('type')
  return changes
}

function _diffLink(old: IGraphLink, now: IGraphLink): string[] {
  const changes: string[] = []
  if (old.label !== now.label) changes.push('label')
  if (old.val !== now.val) changes.push('val')
  if (old.type !== now.type) changes.push('type')
  return changes
}
