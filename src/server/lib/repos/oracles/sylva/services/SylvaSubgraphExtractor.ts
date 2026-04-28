import IGraphData from '../../../../../domain/IGraphData'

/**
 * extractSubgraph
 *
 * Performs a depth-limited BFS from `rootId` and returns only the
 * nodes and links within `depth` hops.
 *
 * @param graph - Full graph data
 * @param rootId - Starting node ID
 * @param depth - Maximum hops from root (default: 2)
 * @returns Subgraph containing only reachable nodes within depth
 */
export function extractSubgraph(
  graph: IGraphData,
  rootId: string,
  depth: number = 2,
): IGraphData {
  if (depth < 0) return { nodes: [], links: [] }

  // Build adjacency list (undirected for graph traversal)
  const adjacency = new Map<string, Set<string>>()
  for (const link of graph.links) {
    const src = typeof link.source === 'string' ? link.source : (link.source as any).id
    const tgt = typeof link.target === 'string' ? link.target : (link.target as any).id

    if (!adjacency.has(src)) adjacency.set(src, new Set())
    if (!adjacency.has(tgt)) adjacency.set(tgt, new Set())
    adjacency.get(src)!.add(tgt)
    adjacency.get(tgt)!.add(src)
  }

  // BFS
  const visited = new Set<string>()
  const queue: { id: string; level: number }[] = [{ id: rootId, level: 0 }]
  visited.add(rootId)

  while (queue.length > 0) {
    const { id, level } = queue.shift()!

    if (level < depth) {
      const neighbors = adjacency.get(id) || new Set()
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push({ id: neighbor, level: level + 1 })
        }
      }
    }
  }

  // Filter nodes and links to only those in the visited set
  const nodes = graph.nodes.filter((n: any) => visited.has(n.id))
  const links = graph.links.filter((l: any) => {
    const src = typeof l.source === 'string' ? l.source : (l.source as any).id
    const tgt = typeof l.target === 'string' ? l.target : (l.target as any).id
    return visited.has(src) && visited.has(tgt)
  })

  return { nodes, links }
}
