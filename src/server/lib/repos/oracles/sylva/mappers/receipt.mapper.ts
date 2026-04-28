import IGraphNode from '../../../../../domain/IGraphNode'
import IGraphLink from '../../../../../domain/IGraphLink'
import type { SylvaGovernanceReceipt } from '../types'

const CONSEQUENCE_GROUPS: Record<string, number> = {
  PASS: 20,
  FAIL: 21,
  WARN: 22,
  INFO: 23,
}

const CONSEQUENCE_COLORS: Record<string, string> = {
  PASS: '#00FF00',
  FAIL: '#FF4444',
  WARN: '#FFD700',
  INFO: '#00BFFF',
}

const RECEIPT_TYPE_ICONS: Record<string, string> = {
  execution: 'execution',
  verification: 'verification',
  coherence: 'coherence',
  lifecycle: 'lifecycle',
}

/**
 * receiptToNode
 *
 * Transforms a governance receipt into a graph node.
 * Node size is affected by coherence score when available.
 */
export function receiptToNode(receipt: SylvaGovernanceReceipt): IGraphNode {
  const val = receipt.coherenceScore !== undefined
    ? Math.max(10, Math.min(60, Math.round(receipt.coherenceScore * 60)))
    : 25

  return {
    id: receipt.id,
    group: CONSEQUENCE_GROUPS[receipt.consequence] ?? 20,
    label: `${receipt.receiptType}: ${receipt.consequence}`,
    val,
    desc: [
      `Type: ${receipt.receiptType}`,
      `Consequence: ${receipt.consequence}`,
      `Tier: ${receipt.governanceTier}`,
      receipt.coherenceScore !== undefined
        ? `Coherence: ${(receipt.coherenceScore * 100).toFixed(0)}%`
        : '',
      receipt.details ?? '',
      `Time: ${receipt.timestamp}`,
    ]
      .filter(Boolean)
      .join('\n'),
    icon: RECEIPT_TYPE_ICONS[receipt.receiptType] ?? '',
    type: 'receipt',
    url: '',
    color: CONSEQUENCE_COLORS[receipt.consequence] ?? '#4682B4',
  }
}

/**
 * receiptToGpaLink
 *
 * Link from a receipt to the GPA that produced it.
 */
export function receiptToGpaLink(receipt: SylvaGovernanceReceipt): IGraphLink {
  return {
    source: receipt.gpaId,
    target: receipt.id,
    label: 'produced',
    val: 1,
    type: 'production',
  }
}

/**
 * receiptToChannelLink
 *
 * Link from a receipt to the channel it governs.
 */
export function receiptToChannelLink(receipt: SylvaGovernanceReceipt): IGraphLink {
  return {
    source: receipt.id,
    target: receipt.channelId,
    label: 'governs',
    val: 1,
    type: 'governance',
  }
}

/**
 * receiptChainLink
 *
 * Link from a parent receipt to a child receipt (receipt chain).
 */
export function receiptChainLink(parentId: string, childId: string): IGraphLink {
  return {
    source: parentId,
    target: childId,
    label: 'precedes',
    val: 1,
    type: 'chain',
  }
}
