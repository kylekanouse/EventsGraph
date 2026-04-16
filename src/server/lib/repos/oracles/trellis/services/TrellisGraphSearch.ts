import IGraphNode from '../../../../../domain/IGraphNode'
import IGraphData from '../../../../../domain/IGraphData'

/**
 * SearchResult
 */
export interface SearchResult {
  node: IGraphNode
  matchField: 'label' | 'desc' | 'type' | 'id'
  relevance: number // 0-1, higher is more relevant
}

/**
 * searchGraph
 *
 * Performs a case-insensitive text search across node properties.
 * Returns matching nodes sorted by relevance.
 *
 * Relevance scoring:
 * - Exact ID match: 1.0
 * - Label contains query: 0.8
 * - Type exact match: 0.6
 * - Description contains query: 0.4
 */
export function searchGraph(
  graph: IGraphData,
  query: string,
  maxResults: number = 20,
): SearchResult[] {
  if (!query || query.trim().length === 0) return []

  const normalizedQuery = query.toLowerCase().trim()
  const results: SearchResult[] = []

  for (const node of graph.nodes) {
    const n = node as IGraphNode

    // Exact ID match
    if (n.id.toLowerCase() === normalizedQuery) {
      results.push({ node: n, matchField: 'id', relevance: 1.0 })
      continue
    }

    // Label match
    if (n.label && n.label.toLowerCase().includes(normalizedQuery)) {
      const relevance = n.label.toLowerCase() === normalizedQuery ? 0.9 : 0.8
      results.push({ node: n, matchField: 'label', relevance })
      continue
    }

    // Type match
    if (n.type && n.type.toLowerCase() === normalizedQuery) {
      results.push({ node: n, matchField: 'type', relevance: 0.6 })
      continue
    }

    // Description match
    if (n.desc && n.desc.toLowerCase().includes(normalizedQuery)) {
      results.push({ node: n, matchField: 'desc', relevance: 0.4 })
      continue
    }
  }

  // Sort by relevance descending
  results.sort((a, b) => b.relevance - a.relevance)

  return results.slice(0, maxResults)
}

/**
 * highlightSearchResults
 *
 * Takes a full graph and search results, returns a modified graph
 * where matching nodes are highlighted (increased size, distinct color).
 */
export function highlightSearchResults(
  graph: IGraphData,
  results: SearchResult[],
): IGraphData {
  const matchIds = new Set(results.map((r) => r.node.id))

  const nodes = graph.nodes.map((node: any) => {
    if (matchIds.has(node.id)) {
      return {
        ...node,
        color: '#FF00FF', // Magenta highlight
        val: node.val * 1.5, // Enlarged
      }
    }
    return {
      ...node,
      val: node.val * 0.5, // Dim non-matching
    }
  })

  return { nodes, links: graph.links }
}
