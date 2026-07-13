import { describe, it, expect } from 'vitest'
import { extractSubgraph } from '../../services/SylvaSubgraphExtractor'

describe('SylvaSubgraphExtractor', () => {
  const graph = {
    nodes: [
      { id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' },
    ],
    links: [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
      { source: 'c', target: 'd' },
      { source: 'd', target: 'e' },
    ],
  } as any

  it('should extract nodes within depth 1', () => {
    const sub = extractSubgraph(graph, 'a', 1)
    expect(sub.nodes.map((n: any) => n.id).sort()).toEqual(['a', 'b'])
  })

  it('should extract nodes within depth 2', () => {
    const sub = extractSubgraph(graph, 'a', 2)
    expect(sub.nodes.map((n: any) => n.id).sort()).toEqual(['a', 'b', 'c'])
  })

  it('should return only root at depth 0', () => {
    const sub = extractSubgraph(graph, 'a', 0)
    expect(sub.nodes).toHaveLength(1)
    expect(sub.nodes[0].id).toBe('a')
  })

  it('should return empty graph for negative depth', () => {
    const sub = extractSubgraph(graph, 'a', -1)
    expect(sub.nodes).toHaveLength(0)
    expect(sub.links).toHaveLength(0)
  })

  it('should include only links between extracted nodes', () => {
    const sub = extractSubgraph(graph, 'a', 1)
    expect(sub.links).toHaveLength(1)
    expect(sub.links[0].source).toBe('a')
    expect(sub.links[0].target).toBe('b')
  })

  it('should handle non-existent rootId', () => {
    const sub = extractSubgraph(graph, 'nonexistent', 2)
    expect(sub.nodes).toHaveLength(0)
    expect(sub.links).toHaveLength(0)
  })

  it('should traverse in both directions (undirected)', () => {
    const sub = extractSubgraph(graph, 'c', 1)
    expect(sub.nodes.map((n: any) => n.id).sort()).toEqual(['b', 'c', 'd'])
  })

  it('should handle cycles', () => {
    const cyclicGraph = {
      nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      links: [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
        { source: 'c', target: 'a' },
      ],
    } as any

    const sub = extractSubgraph(cyclicGraph, 'a', 1)
    expect(sub.nodes.map((n: any) => n.id).sort()).toEqual(['a', 'b', 'c'])
  })

  it('should handle disconnected nodes', () => {
    const disconnectedGraph = {
      nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      links: [{ source: 'a', target: 'b' }],
    } as any

    const sub = extractSubgraph(disconnectedGraph, 'a', 5)
    expect(sub.nodes.map((n: any) => n.id).sort()).toEqual(['a', 'b'])
    // c is disconnected and should not appear
  })

  it('should extract full chain with sufficient depth', () => {
    const sub = extractSubgraph(graph, 'a', 10)
    expect(sub.nodes).toHaveLength(5)
    expect(sub.links).toHaveLength(4)
  })

  it('should handle empty graph', () => {
    const empty = { nodes: [], links: [] } as any
    const sub = extractSubgraph(empty, 'a', 2)
    expect(sub.nodes).toHaveLength(0)
    expect(sub.links).toHaveLength(0)
  })
})
