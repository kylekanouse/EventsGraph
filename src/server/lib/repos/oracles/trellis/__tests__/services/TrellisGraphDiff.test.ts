import { describe, it, expect } from 'vitest'
import { diff, diffToGraphData } from '../../services/TrellisGraphDiff'

describe('TrellisGraphDiff', () => {
  describe('diff', () => {
    it('should detect added nodes', () => {
      const old = { nodes: [{ id: 'n1', label: 'A', val: 10, group: 1, color: '#fff', desc: '', type: 'a' }], links: [] } as any
      const now = {
        nodes: [
          { id: 'n1', label: 'A', val: 10, group: 1, color: '#fff', desc: '', type: 'a' },
          { id: 'n2', label: 'B', val: 10, group: 1, color: '#fff', desc: '', type: 'b' },
        ],
        links: [],
      } as any

      const result = diff(old, now)
      expect(result.addedNodes).toHaveLength(1)
      expect(result.addedNodes[0].id).toBe('n2')
      expect(result.summary.nodesAdded).toBe(1)
    })

    it('should detect removed nodes', () => {
      const old = {
        nodes: [
          { id: 'n1', label: 'A', val: 10, group: 1, color: '#fff', desc: '', type: 'a' },
          { id: 'n2', label: 'B', val: 10, group: 1, color: '#fff', desc: '', type: 'b' },
        ],
        links: [],
      } as any
      const now = { nodes: [{ id: 'n1', label: 'A', val: 10, group: 1, color: '#fff', desc: '', type: 'a' }], links: [] } as any

      const result = diff(old, now)
      expect(result.removedNodes).toHaveLength(1)
      expect(result.removedNodes[0].id).toBe('n2')
      expect(result.summary.nodesRemoved).toBe(1)
    })

    it('should detect modified nodes', () => {
      const old = { nodes: [{ id: 'n1', label: 'Old', val: 10, group: 1, color: '#fff', desc: '', type: 'a' }], links: [] } as any
      const now = { nodes: [{ id: 'n1', label: 'New', val: 10, group: 1, color: '#fff', desc: '', type: 'a' }], links: [] } as any

      const result = diff(old, now)
      expect(result.modifiedNodes).toHaveLength(1)
      expect(result.modifiedNodes[0].changes).toContain('label')
      expect(result.summary.nodesModified).toBe(1)
    })

    it('should detect multiple property changes on a node', () => {
      const old = { nodes: [{ id: 'n1', label: 'Old', val: 10, group: 1, color: '#fff', desc: 'old desc', type: 'a' }], links: [] } as any
      const now = { nodes: [{ id: 'n1', label: 'New', val: 20, group: 1, color: '#fff', desc: 'new desc', type: 'a' }], links: [] } as any

      const result = diff(old, now)
      expect(result.modifiedNodes).toHaveLength(1)
      expect(result.modifiedNodes[0].changes).toContain('label')
      expect(result.modifiedNodes[0].changes).toContain('val')
      expect(result.modifiedNodes[0].changes).toContain('desc')
    })

    it('should detect added and removed links', () => {
      const old = { nodes: [], links: [{ source: 'a', target: 'b', label: 'x', val: 1, type: 'link' }] } as any
      const now = { nodes: [], links: [{ source: 'a', target: 'c', label: 'y', val: 1, type: 'link' }] } as any

      const result = diff(old, now)
      expect(result.addedLinks).toHaveLength(1)
      expect(result.removedLinks).toHaveLength(1)
      expect(result.summary.linksAdded).toBe(1)
      expect(result.summary.linksRemoved).toBe(1)
    })

    it('should detect modified links', () => {
      const old = { nodes: [], links: [{ source: 'a', target: 'b', label: 'old', val: 1, type: 'link' }] } as any
      const now = { nodes: [], links: [{ source: 'a', target: 'b', label: 'new', val: 1, type: 'link' }] } as any

      const result = diff(old, now)
      expect(result.modifiedLinks).toHaveLength(1)
      expect(result.modifiedLinks[0].changes).toContain('label')
    })

    it('should report zero changes for identical graphs', () => {
      const graph = { nodes: [{ id: 'n1', label: 'A', val: 10, group: 1, color: '#fff', desc: '', type: 'a' }], links: [] } as any
      const result = diff(graph, graph)
      expect(result.summary.totalChanges).toBe(0)
    })

    it('should handle empty graphs', () => {
      const empty = { nodes: [], links: [] } as any
      const result = diff(empty, empty)
      expect(result.summary.totalChanges).toBe(0)
    })

    it('should compute correct totalChanges', () => {
      const old = {
        nodes: [
          { id: 'n1', label: 'A', val: 10, group: 1, color: '#fff', desc: '', type: 'a' },
          { id: 'n2', label: 'B', val: 10, group: 1, color: '#fff', desc: '', type: 'b' },
        ],
        links: [{ source: 'n1', target: 'n2', label: '', val: 1, type: '' }],
      } as any
      const now = {
        nodes: [
          { id: 'n1', label: 'A-modified', val: 10, group: 1, color: '#fff', desc: '', type: 'a' },
          { id: 'n3', label: 'C', val: 10, group: 1, color: '#fff', desc: '', type: 'c' },
        ],
        links: [{ source: 'n1', target: 'n3', label: '', val: 1, type: '' }],
      } as any

      const result = diff(old, now)
      // n2 removed, n3 added, n1 modified, old link removed, new link added
      expect(result.summary.totalChanges).toBe(5)
    })
  })

  describe('diffToGraphData', () => {
    it('should annotate added nodes with green color', () => {
      const old = { nodes: [], links: [] } as any
      const now = { nodes: [{ id: 'n1', label: 'A', type: 'test', color: '#000', val: 20 }], links: [] } as any

      const diffResult = diff(old, now)
      const annotated = diffToGraphData(now, diffResult)

      expect(annotated.nodes[0].color).toBe('#00FF00')
      expect(annotated.nodes[0].type).toBe('added-test')
    })

    it('should annotate removed nodes with red color', () => {
      const old = { nodes: [{ id: 'n1', label: 'A', type: 'test', color: '#000', val: 20, group: 1, desc: '', icon: '', url: '' }], links: [] } as any
      const now = { nodes: [], links: [] } as any

      const diffResult = diff(old, now)
      const annotated = diffToGraphData(now, diffResult)

      expect(annotated.nodes).toHaveLength(1)
      expect(annotated.nodes[0].color).toBe('#FF4444')
      expect(annotated.nodes[0].type).toBe('removed-test')
    })

    it('should annotate modified nodes with amber color', () => {
      const old = { nodes: [{ id: 'n1', label: 'Old', type: 'test', color: '#000', val: 20, group: 1, desc: '' }], links: [] } as any
      const now = { nodes: [{ id: 'n1', label: 'New', type: 'test', color: '#000', val: 20, group: 1, desc: '' }], links: [] } as any

      const diffResult = diff(old, now)
      const annotated = diffToGraphData(now, diffResult)

      expect(annotated.nodes[0].color).toBe('#FFD700')
      expect(annotated.nodes[0].type).toBe('modified-test')
    })

    it('should include removed links in output', () => {
      const old = { nodes: [], links: [{ source: 'a', target: 'b', type: 'edge' }] } as any
      const now = { nodes: [], links: [] } as any

      const diffResult = diff(old, now)
      const annotated = diffToGraphData(now, diffResult)

      expect(annotated.links).toHaveLength(1)
      expect(annotated.links[0].type).toBe('removed-edge')
    })

    it('should annotate added links', () => {
      const old = { nodes: [], links: [] } as any
      const now = { nodes: [], links: [{ source: 'a', target: 'b', type: 'edge' }] } as any

      const diffResult = diff(old, now)
      const annotated = diffToGraphData(now, diffResult)

      expect(annotated.links[0].type).toBe('added-edge')
    })
  })
})
