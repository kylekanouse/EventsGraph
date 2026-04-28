import IGraphNode from '../../../../../domain/IGraphNode'
import IGraphLink from '../../../../../domain/IGraphLink'
import type { SylvaCoherenceDataPoint } from '../types'

const TRAJECTORY_COLORS: Record<string, string> = {
  improving: '#00FF00',
  stable: '#FFD700',
  declining: '#FF4444',
}

const ENTITY_TYPE_GROUPS: Record<string, number> = {
  gpa: 25,
  channel: 26,
  participant: 27,
}

/**
 * coherenceToNode
 *
 * Transforms a coherence data point into a graph node.
 * Node size reflects coherence score; color reflects trajectory.
 */
export function coherenceToNode(dataPoint: SylvaCoherenceDataPoint): IGraphNode {
  const scorePct = Math.round(dataPoint.coherenceScore * 100)

  return {
    id: dataPoint.entityId,
    group: ENTITY_TYPE_GROUPS[dataPoint.entityType] ?? 25,
    label: `${dataPoint.entityName} (${scorePct}%)`,
    val: Math.max(10, Math.min(70, scorePct * 0.7)),
    desc: [
      `Entity: ${dataPoint.entityName}`,
      `Type: ${dataPoint.entityType}`,
      `Coherence: ${scorePct}%`,
      `Trajectory: ${dataPoint.trajectory}`,
      `Measurements: ${dataPoint.measurementCount}`,
      `Last: ${dataPoint.lastMeasuredAt}`,
    ].join('\n'),
    icon: '',
    type: `coherence-${dataPoint.entityType}`,
    url: '',
    color: TRAJECTORY_COLORS[dataPoint.trajectory] ?? '#FFD700',
  }
}

/**
 * coherenceProximityLinks
 *
 * Creates links between entities with similar coherence scores.
 * Entities within the threshold of each other are linked.
 */
export function coherenceProximityLinks(
  dataPoints: SylvaCoherenceDataPoint[],
  threshold: number = 0.1,
): IGraphLink[] {
  const links: IGraphLink[] = []

  for (let i = 0; i < dataPoints.length; i++) {
    for (let j = i + 1; j < dataPoints.length; j++) {
      const diff = Math.abs(dataPoints[i].coherenceScore - dataPoints[j].coherenceScore)
      if (diff <= threshold) {
        links.push({
          source: dataPoints[i].entityId,
          target: dataPoints[j].entityId,
          label: `Δ${(diff * 100).toFixed(0)}%`,
          val: Math.max(1, Math.round((1 - diff / threshold) * 5)),
          type: 'coherence-proximity',
        })
      }
    }
  }

  return links
}
