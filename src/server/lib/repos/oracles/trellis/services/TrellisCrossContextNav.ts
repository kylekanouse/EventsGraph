/**
 * CrossContextLink
 *
 * Describes how to navigate from the current context
 * to a related context for a specific entity.
 */
export interface CrossContextLink {
  entityId: string
  entityLabel: string
  targetContext: string
  targetParams: Record<string, string>
  description: string
}

/**
 * getCrossContextLinks
 *
 * Given a node ID and its type, returns a list of contexts
 * where this entity can be explored in more detail.
 */
export function getCrossContextLinks(
  nodeId: string,
  nodeType: string,
  nodeLabel: string,
): CrossContextLink[] {
  const links: CrossContextLink[] = []

  switch (nodeType) {
    case 'agent':
    case 'service':
    case 'fleet-gpa':
      links.push({
        entityId: nodeId,
        entityLabel: nodeLabel,
        targetContext: 'agent-topology',
        targetParams: { highlightId: nodeId },
        description: 'View in agent topology',
      })
      links.push({
        entityId: nodeId,
        entityLabel: nodeLabel,
        targetContext: 'execution-tree',
        targetParams: { gpaId: nodeId },
        description: 'View execution history',
      })
      links.push({
        entityId: nodeId,
        entityLabel: nodeLabel,
        targetContext: 'governance-receipt-chain',
        targetParams: { gpaId: nodeId },
        description: 'View governance receipts',
      })
      break

    case 'channel':
    case 'compliance-channel':
      links.push({
        entityId: nodeId,
        entityLabel: nodeLabel,
        targetContext: 'channel-network',
        targetParams: { highlightId: nodeId },
        description: 'View in channel network',
      })
      links.push({
        entityId: nodeId,
        entityLabel: nodeLabel,
        targetContext: 'governance-receipt-chain',
        targetParams: { channelId: nodeId },
        description: 'View channel receipts',
      })
      links.push({
        entityId: nodeId,
        entityLabel: nodeLabel,
        targetContext: 'filesystem-tree',
        targetParams: { channelId: nodeId },
        description: 'View channel filesystem',
      })
      break

    case 'receipt':
      links.push({
        entityId: nodeId,
        entityLabel: nodeLabel,
        targetContext: 'governance-receipt-chain',
        targetParams: {},
        description: 'View in receipt chain',
      })
      break

    case 'federation-peer':
      links.push({
        entityId: nodeId,
        entityLabel: nodeLabel,
        targetContext: 'federation-mesh',
        targetParams: {},
        description: 'View in federation mesh',
      })
      break
  }

  return links
}
