import IGraphNode from '../../../../../domain/IGraphNode'
import IGraphLink from '../../../../../domain/IGraphLink'
import type { SylvaFilesystemNode } from '../types'

const FS_TYPE_GROUPS: Record<string, number> = {
  directory: 35,
  file: 36,
}

const FS_TYPE_COLORS: Record<string, string> = {
  directory: '#FFD700',
  file: '#4682B4',
}

/**
 * fsNodeToGraphNode
 *
 * Transforms a filesystem entry into a graph node.
 * Directories are larger than files.
 */
export function fsNodeToGraphNode(fsNode: SylvaFilesystemNode): IGraphNode {
  return {
    id: fsNode.id,
    group: FS_TYPE_GROUPS[fsNode.type] ?? 35,
    label: fsNode.name,
    val: fsNode.type === 'directory' ? 35 : 15 + Math.min(25, (fsNode.size || 0) / 10000),
    desc: [
      `Path: ${fsNode.path}`,
      `Type: ${fsNode.type}`,
      fsNode.size !== undefined ? `Size: ${formatBytes(fsNode.size)}` : '',
      fsNode.mimeType ?? '',
      fsNode.channelId ? `Channel: ${fsNode.channelId}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    icon: '',
    type: fsNode.type,
    url: '',
    color: FS_TYPE_COLORS[fsNode.type] ?? '#4682B4',
  }
}

/**
 * fsParentChildLink
 *
 * Creates a link from a parent directory to a child entry.
 */
export function fsParentChildLink(parentId: string, childId: string): IGraphLink {
  return {
    source: parentId,
    target: childId,
    label: 'contains',
    val: 1,
    type: 'contains',
  }
}

/**
 * flattenFsTree
 *
 * Recursively flattens a filesystem tree into arrays of nodes and links.
 */
export function flattenFsTree(
  root: SylvaFilesystemNode,
): { nodes: IGraphNode[]; links: IGraphLink[] } {
  const nodes: IGraphNode[] = []
  const links: IGraphLink[] = []

  function walk(node: SylvaFilesystemNode) {
    nodes.push(fsNodeToGraphNode(node))

    if (node.children) {
      for (const child of node.children) {
        links.push(fsParentChildLink(node.id, child.id))
        walk(child)
      }
    }
  }

  walk(root)
  return { nodes, links }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
