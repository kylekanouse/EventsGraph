import { describe, it, expect } from 'vitest'
import {
  fsNodeToGraphNode,
  fsParentChildLink,
  flattenFsTree,
} from '../../mappers/filesystem.mapper'
import type { SylvaFilesystemNode } from '../../types'

describe('filesystem.mapper', () => {
  const mockDir: SylvaFilesystemNode = {
    id: 'dir-001',
    name: 'documents',
    path: '/documents',
    type: 'directory',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  }

  const mockFile: SylvaFilesystemNode = {
    id: 'file-001',
    name: 'report.pdf',
    path: '/documents/report.pdf',
    type: 'file',
    size: 51200,
    mimeType: 'application/pdf',
    channelId: 'ch-001',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  }

  describe('fsNodeToGraphNode', () => {
    it('should produce a valid node for a directory', () => {
      const node = fsNodeToGraphNode(mockDir)
      expect(node.id).toBe('dir-001')
      expect(node.label).toBe('documents')
      expect(node.type).toBe('directory')
      expect(node.color).toBe('#FFD700')
      expect(node.group).toBe(35)
      expect(node.val).toBe(35)
    })

    it('should produce a valid node for a file', () => {
      const node = fsNodeToGraphNode(mockFile)
      expect(node.id).toBe('file-001')
      expect(node.label).toBe('report.pdf')
      expect(node.type).toBe('file')
      expect(node.color).toBe('#4682B4')
      expect(node.group).toBe(36)
    })

    it('should scale file val by size', () => {
      const node = fsNodeToGraphNode(mockFile)
      // 15 + min(25, 51200/10000) = 15 + 5.12 = 20.12
      expect(node.val).toBeGreaterThan(15)
      expect(node.val).toBeLessThanOrEqual(40)
    })

    it('should include size in description formatted as KB', () => {
      const node = fsNodeToGraphNode(mockFile)
      expect(node.desc).toContain('Size: 50.0 KB')
    })

    it('should include channel reference in description', () => {
      const node = fsNodeToGraphNode(mockFile)
      expect(node.desc).toContain('Channel: ch-001')
    })

    it('should format bytes correctly', () => {
      const smallFile = { ...mockFile, size: 500 }
      expect(fsNodeToGraphNode(smallFile).desc).toContain('Size: 500 B')

      const largeFile = { ...mockFile, size: 2 * 1024 * 1024 }
      expect(fsNodeToGraphNode(largeFile).desc).toContain('Size: 2.0 MB')
    })
  })

  describe('fsParentChildLink', () => {
    it('should create a contains link', () => {
      const link = fsParentChildLink('dir-001', 'file-001')
      expect(link.source).toBe('dir-001')
      expect(link.target).toBe('file-001')
      expect(link.label).toBe('contains')
      expect(link.type).toBe('contains')
    })
  })

  describe('flattenFsTree', () => {
    it('should flatten a single-level tree', () => {
      const root: SylvaFilesystemNode = {
        ...mockDir,
        children: [mockFile],
      }
      const { nodes, links } = flattenFsTree(root)
      expect(nodes).toHaveLength(2)
      expect(links).toHaveLength(1)
      expect(links[0].source).toBe('dir-001')
      expect(links[0].target).toBe('file-001')
    })

    it('should flatten a multi-level tree', () => {
      const subDir: SylvaFilesystemNode = {
        id: 'dir-002',
        name: 'sub',
        path: '/documents/sub',
        type: 'directory',
        children: [mockFile],
        createdAt: '2025-06-01T00:00:00Z',
        updatedAt: '2025-06-01T00:00:00Z',
      }
      const root: SylvaFilesystemNode = {
        ...mockDir,
        children: [subDir],
      }
      const { nodes, links } = flattenFsTree(root)
      expect(nodes).toHaveLength(3) // root + subDir + file
      expect(links).toHaveLength(2) // root→subDir + subDir→file
    })

    it('should handle a leaf node with no children', () => {
      const { nodes, links } = flattenFsTree(mockDir)
      expect(nodes).toHaveLength(1)
      expect(links).toHaveLength(0)
    })
  })
})
