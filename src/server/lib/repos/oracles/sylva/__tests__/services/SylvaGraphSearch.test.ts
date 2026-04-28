import { describe, it, expect } from 'vitest'
import { searchGraph, highlightSearchResults } from '../../services/SylvaGraphSearch'

describe('SylvaGraphSearch', () => {
  const graph = {
    nodes: [
      { id: 'gpa-1', label: 'Agent Alpha', val: 20, type: 'agent', desc: 'Primary automation agent', group: 1, color: '#fff', icon: '', url: '' },
      { id: 'ch-1', label: 'Channel Beta', val: 15, type: 'channel', desc: 'Standard communication channel', group: 2, color: '#aaa', icon: '', url: '' },
      { id: 'p-1', label: 'Human Gamma', val: 10, type: 'human', desc: 'Team lead for operations', group: 3, color: '#bbb', icon: '', url: '' },
      { id: 'r-1', label: 'Receipt Delta', val: 12, type: 'receipt', desc: 'Execution receipt for compliance', group: 4, color: '#ccc', icon: '', url: '' },
    ],
    links: [
      { source: 'gpa-1', target: 'ch-1' },
      { source: 'p-1', target: 'ch-1' },
    ],
  } as any

  describe('searchGraph', () => {
    it('should find nodes by exact ID match', () => {
      const results = searchGraph(graph, 'gpa-1')
      expect(results).toHaveLength(1)
      expect(results[0].node.id).toBe('gpa-1')
      expect(results[0].matchField).toBe('id')
      expect(results[0].relevance).toBe(1.0)
    })

    it('should find nodes by label (partial match)', () => {
      const results = searchGraph(graph, 'Alpha')
      expect(results).toHaveLength(1)
      expect(results[0].node.id).toBe('gpa-1')
      expect(results[0].matchField).toBe('label')
    })

    it('should find nodes by type', () => {
      // Use a graph where type doesn't appear in label/id/desc
      const typeGraph = {
        nodes: [
          { id: 'x-1', label: 'Foo Bar', val: 10, type: 'webhook', desc: 'Some node', group: 1, color: '#fff', icon: '', url: '' },
        ],
        links: [],
      } as any
      const results = searchGraph(typeGraph, 'webhook')
      expect(results).toHaveLength(1)
      expect(results[0].matchField).toBe('type')
      expect(results[0].relevance).toBe(0.6)
    })

    it('should find nodes by description', () => {
      const results = searchGraph(graph, 'compliance')
      expect(results).toHaveLength(1)
      expect(results[0].node.id).toBe('r-1')
      expect(results[0].matchField).toBe('desc')
    })

    it('should be case insensitive', () => {
      const results = searchGraph(graph, 'AGENT ALPHA')
      expect(results.length).toBeGreaterThanOrEqual(1)
    })

    it('should return empty for empty query', () => {
      expect(searchGraph(graph, '')).toHaveLength(0)
      expect(searchGraph(graph, '  ')).toHaveLength(0)
    })

    it('should return empty for no matches', () => {
      expect(searchGraph(graph, 'zzzznonexistent')).toHaveLength(0)
    })

    it('should respect maxResults', () => {
      const results = searchGraph(graph, 'a', 2)
      expect(results.length).toBeLessThanOrEqual(2)
    })

    it('should sort results by relevance descending', () => {
      // Search for 'channel' which could match type and label
      const results = searchGraph(graph, 'channel')
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].relevance).toBeGreaterThanOrEqual(results[i].relevance)
      }
    })

    it('should give higher relevance to exact label match than partial', () => {
      const exactGraph = {
        nodes: [
          { id: '1', label: 'agent', val: 10, type: 'foo', desc: '', group: 1, color: '', icon: '', url: '' },
          { id: '2', label: 'agent manager', val: 10, type: 'foo', desc: '', group: 1, color: '', icon: '', url: '' },
        ],
        links: [],
      } as any

      const results = searchGraph(exactGraph, 'agent')
      expect(results[0].node.id).toBe('1')
      expect(results[0].relevance).toBeGreaterThan(results[1].relevance)
    })
  })

  describe('highlightSearchResults', () => {
    it('should highlight matching nodes with magenta color', () => {
      const results = searchGraph(graph, 'Alpha')
      const highlighted = highlightSearchResults(graph, results)

      const matchNode = highlighted.nodes.find((n: any) => n.id === 'gpa-1')
      expect(matchNode.color).toBe('#FF00FF')
    })

    it('should enlarge matching nodes', () => {
      const results = searchGraph(graph, 'Alpha')
      const highlighted = highlightSearchResults(graph, results)

      const matchNode = highlighted.nodes.find((n: any) => n.id === 'gpa-1')
      expect(matchNode.val).toBe(20 * 1.5)
    })

    it('should dim non-matching nodes', () => {
      const results = searchGraph(graph, 'Alpha')
      const highlighted = highlightSearchResults(graph, results)

      const otherNode = highlighted.nodes.find((n: any) => n.id === 'ch-1')
      expect(otherNode.val).toBe(15 * 0.5)
    })

    it('should preserve links unchanged', () => {
      const results = searchGraph(graph, 'Alpha')
      const highlighted = highlightSearchResults(graph, results)

      expect(highlighted.links).toEqual(graph.links)
    })

    it('should handle empty results (no matches)', () => {
      const highlighted = highlightSearchResults(graph, [])

      // All nodes should be dimmed
      for (const node of highlighted.nodes) {
        expect((node as any).val).toBeLessThan(20)
      }
    })
  })
})
