import IGraphNode from '../../../../../domain/IGraphNode'
import IGraphLink from '../../../../../domain/IGraphLink'
import IGraphData from '../../../../../domain/IGraphData'
import { SylvaConnectionManager } from '../SylvaConnectionManager'
import { SylvaObservabilityClient } from './SylvaObservabilityClient'
import { logger } from '../../../../logger'
import type {
  SylvaGPA,
  SylvaGPAListResponse,
  SylvaGovernanceReceipt,
  SylvaReceiptListResponse,
  SylvaExecution,
  SylvaExecutionListResponse,
  SylvaCoherenceDataPoint,
  SylvaCoherenceListResponse,
  ObservabilityExecutionSummary,
  ObservabilityComplianceSummary,
  ObservabilityFleetHealth,
  ObservabilityViolationSummary,
  ObservabilityCoherenceSummary,
} from '../types'

/**
 * Simple in-memory cache with TTL.
 * Analytics data is relatively expensive to compute
 * and doesn't change per-second.
 */
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

export class SylvaAnalyticsService {
  private _conn: SylvaConnectionManager
  private _observability: SylvaObservabilityClient
  private _cache: Map<string, CacheEntry<unknown>> = new Map()
  private _defaultTTL = 30_000 // 30 seconds

  constructor(conn: SylvaConnectionManager, observability: SylvaObservabilityClient) {
    this._conn = conn
    this._observability = observability
  }

  /**
   * computeExecutionTrends
   *
   * Preferred: GET /api/observability/executions/summary
   * Fallback:  Multi-endpoint aggregation (Phase 4 logic)
   */
  async computeExecutionTrends(params: {
    timeRange?: string  // '1h' | '6h' | '24h' | '7d'
    bucketSize?: string // 'hour' | 'day'
  }): Promise<IGraphData> {
    const cacheKey = `execution-trends-${params.timeRange || '24h'}-${params.bucketSize || 'hour'}`
    const cached = this._getFromCache<IGraphData>(cacheKey)
    if (cached) return cached

    const obsSummary = await this._observability.getExecutionSummary({
      timeRange: params.timeRange,
      bucketSize: params.bucketSize,
    })

    let result: IGraphData

    if (obsSummary) {
      result = this._transformObsExecutionSummary(obsSummary)
      logger.debug('computeExecutionTrends: using observability endpoint')
    } else {
      result = await this._computeExecutionTrendsFallback(params)
      logger.debug('computeExecutionTrends: using fallback aggregation')
    }

    this._setCache(cacheKey, result)
    return result
  }

  private async _computeExecutionTrendsFallback(params: {
    timeRange?: string
    bucketSize?: string
  }): Promise<IGraphData> {

    // Fetch all GPAs and their executions
    const gpasRes = await this._conn.fetch('/api/gpa')
    if (!gpasRes.ok) throw new Error(`GPA fetch failed: ${gpasRes.status}`)
    const gpas = ((await gpasRes.json()) as SylvaGPAListResponse).items || []

    // Fetch recent executions for each GPA
    const executionsByGpa = new Map<string, SylvaExecution[]>()
    for (const gpa of gpas) {
      try {
        const res = await this._conn.fetch(
          `/api/gpa/${encodeURIComponent(gpa.id)}/executions?limit=100&sort=desc`,
        )
        if (res.ok) {
          const data = (await res.json()) as SylvaExecutionListResponse
          executionsByGpa.set(gpa.id, data.items || [])
        }
      } catch {
        /* continue */
      }
    }

    // Time-bucket the executions
    const allExecutions = [...executionsByGpa.values()].flat()
    const bucketMs = params.bucketSize === 'day' ? 86400000 : 3600000

    const buckets = new Map<number, { count: number; passes: number; fails: number; totalDuration: number }>()
    for (const exec of allExecutions) {
      const time = Math.floor(new Date(exec.startedAt).getTime() / bucketMs) * bucketMs
      if (!buckets.has(time)) {
        buckets.set(time, { count: 0, passes: 0, fails: 0, totalDuration: 0 })
      }
      const bucket = buckets.get(time)!
      bucket.count++
      if (exec.consequence === 'PASS') bucket.passes++
      if (exec.consequence === 'FAIL') bucket.fails++
      if (exec.completedAt) {
        bucket.totalDuration += new Date(exec.completedAt).getTime() - new Date(exec.startedAt).getTime()
      }
    }

    // Build graph
    const nodes: IGraphNode[] = []
    const links: IGraphLink[] = []

    const sortedTimes = [...buckets.keys()].sort()
    for (let i = 0; i < sortedTimes.length; i++) {
      const time = sortedTimes[i]
      const bucket = buckets.get(time)!
      const passRate = bucket.count > 0 ? bucket.passes / bucket.count : 0
      const avgDuration = bucket.count > 0 ? bucket.totalDuration / bucket.count : 0

      nodes.push({
        id: `bucket-${time}`,
        group: passRate > 0.8 ? 1 : passRate > 0.5 ? 2 : 3,
        label: new Date(time).toISOString().slice(0, 13),
        val: Math.max(10, Math.min(60, bucket.count * 3)),
        desc: [
          `Executions: ${bucket.count}`,
          `Pass rate: ${(passRate * 100).toFixed(0)}%`,
          `Avg duration: ${Math.round(avgDuration)}ms`,
        ].join('\n'),
        icon: '',
        type: 'time-bucket',
        url: '',
        color: passRate > 0.8 ? '#00FF00' : passRate > 0.5 ? '#FFD700' : '#FF4444',
      })

      // Sequential time links
      if (i > 0) {
        links.push({
          source: `bucket-${sortedTimes[i - 1]}`,
          target: `bucket-${time}`,
          label: '',
          val: 1,
          type: 'timeline',
        })
      }
    }

    const result = { nodes, links }
    return result
  }

  /**
   * computeComplianceCoverage
   *
   * Preferred: GET /api/observability/compliance/summary
   * Fallback:  Channel + receipt aggregation (Phase 4 logic)
   */
  async computeComplianceCoverage(): Promise<IGraphData> {
    const cacheKey = 'compliance-coverage'
    const cached = this._getFromCache<IGraphData>(cacheKey)
    if (cached) return cached

    const obsSummary = await this._observability.getComplianceSummary()
    let result: IGraphData

    if (obsSummary) {
      result = this._transformObsComplianceSummary(obsSummary)
      logger.debug('computeComplianceCoverage: using observability endpoint')
    } else {
      result = await this._computeComplianceCoverageFallback()
      logger.debug('computeComplianceCoverage: using fallback aggregation')
    }

    this._setCache(cacheKey, result)
    return result
  }

  private async _computeComplianceCoverageFallback(): Promise<IGraphData> {

    const [channelsRes, receiptsRes] = await Promise.all([
      this._conn.fetch('/api/channels'),
      this._conn.fetch('/api/governance/receipts?limit=500'),
    ])

    if (!channelsRes.ok) throw new Error(`Channels fetch failed: ${channelsRes.status}`)
    if (!receiptsRes.ok) throw new Error(`Receipts fetch failed: ${receiptsRes.status}`)

    const channels = ((await channelsRes.json()) as { items: { id: string; name: string }[] }).items || []
    const receipts = ((await receiptsRes.json()) as SylvaReceiptListResponse).items || []

    // Count receipts per channel
    const receiptsByChannel = new Map<string, SylvaGovernanceReceipt[]>()
    for (const receipt of receipts) {
      if (!receiptsByChannel.has(receipt.channelId)) {
        receiptsByChannel.set(receipt.channelId, [])
      }
      receiptsByChannel.get(receipt.channelId)!.push(receipt)
    }

    // Build compliance nodes
    const nodes: IGraphNode[] = channels.map((ch) => {
      const channelReceipts = receiptsByChannel.get(ch.id) || []
      const passCount = channelReceipts.filter((r) => r.consequence === 'PASS').length
      const totalCount = channelReceipts.length
      const passRate = totalCount > 0 ? passCount / totalCount : 0
      const coverageColor = passRate > 0.9 ? '#00FF00' : passRate > 0.7 ? '#FFD700' : passRate > 0.5 ? '#FF8C00' : '#FF4444'

      return {
        id: ch.id,
        group: passRate > 0.9 ? 1 : passRate > 0.7 ? 2 : 3,
        label: `${ch.name} (${(passRate * 100).toFixed(0)}%)`,
        val: Math.max(15, Math.min(70, passRate * 70)),
        desc: [
          `Channel: ${ch.name}`,
          `Total receipts: ${totalCount}`,
          `Pass rate: ${(passRate * 100).toFixed(0)}%`,
          `PASS: ${passCount}, FAIL: ${totalCount - passCount}`,
        ].join('\n'),
        icon: '',
        type: 'compliance-channel',
        url: '',
        color: coverageColor,
      } as IGraphNode
    })

    // Link channels with similar compliance levels
    const links: IGraphLink[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].group === nodes[j].group) {
          links.push({
            source: nodes[i].id,
            target: nodes[j].id,
            label: '',
            val: 1,
            type: 'compliance-cluster',
          })
        }
      }
    }

    const result = { nodes, links }
    return result
  }

  /**
   * computeFleetHealth
   *
   * Preferred: GET /api/observability/fleet/health
   * Fallback:  GPA + coherence aggregation (Phase 4 logic)
   */
  async computeFleetHealth(): Promise<IGraphData> {
    const obsHealth = await this._observability.getFleetHealth()

    if (obsHealth) {
      logger.debug('computeFleetHealth: using observability endpoint')
      return this._transformObsFleetHealth(obsHealth)
    }

    logger.debug('computeFleetHealth: using fallback aggregation')
    return this._computeFleetHealthFallback()
  }

  private async _computeFleetHealthFallback(): Promise<IGraphData> {
    const [gpasRes, coherenceRes] = await Promise.all([
      this._conn.fetch('/api/gpa'),
      this._conn.fetch('/api/governance/coherence'),
    ])

    if (!gpasRes.ok) throw new Error(`GPA fetch failed: ${gpasRes.status}`)

    const gpas = ((await gpasRes.json()) as SylvaGPAListResponse).items || []
    const coherenceData = coherenceRes.ok
      ? ((await coherenceRes.json()) as SylvaCoherenceListResponse).items || []
      : []

    // Build coherence lookup
    const coherenceMap = new Map<string, number>()
    for (const dp of coherenceData) {
      if (dp.entityType === 'gpa') {
        coherenceMap.set(dp.entityId, dp.coherenceScore)
      }
    }

    // Compute health score for each GPA
    const nodes: IGraphNode[] = gpas.map((gpa) => {
      const budgetPct = gpa.executionBudgetTotal > 0
        ? (gpa.executionBudgetTotal - gpa.executionBudgetUsed) / gpa.executionBudgetTotal
        : 0
      const coherence = coherenceMap.get(gpa.id) ?? 0.5
      const isRunning = gpa.status === 'running' || gpa.status === 'deployed'

      // Health score: weighted average of budget, coherence, and status
      const healthScore = (budgetPct * 0.3 + coherence * 0.4 + (isRunning ? 1 : 0) * 0.3)
      const healthPct = Math.round(healthScore * 100)

      let healthColor: string
      let healthGroup: number
      if (healthScore > 0.8) { healthColor = '#00FF00'; healthGroup = 1 }
      else if (healthScore > 0.6) { healthColor = '#FFD700'; healthGroup = 2 }
      else if (healthScore > 0.4) { healthColor = '#FF8C00'; healthGroup = 3 }
      else { healthColor = '#FF4444'; healthGroup = 4 }

      return {
        id: gpa.id,
        group: healthGroup,
        label: `${gpa.name} (${healthPct}%)`,
        val: Math.max(15, healthPct * 0.7),
        desc: [
          `Status: ${gpa.status}`,
          `Health: ${healthPct}%`,
          `Budget remaining: ${(budgetPct * 100).toFixed(0)}%`,
          `Coherence: ${(coherence * 100).toFixed(0)}%`,
          `Role: ${gpa.agentRole ?? 'default'}`,
        ].join('\n'),
        icon: '',
        type: 'fleet-gpa',
        url: '',
        color: healthColor,
      } as IGraphNode
    })

    // Cluster links: connect GPAs in the same health group
    const links: IGraphLink[] = []
    const groups = new Map<number, string[]>()
    for (const node of nodes) {
      if (!groups.has(node.group)) groups.set(node.group, [])
      groups.get(node.group)!.push(node.id)
    }
    for (const [, ids] of groups) {
      for (let i = 0; i < ids.length - 1; i++) {
        links.push({
          source: ids[i],
          target: ids[i + 1],
          label: '',
          val: 1,
          type: 'health-cluster',
        })
      }
    }

    return { nodes, links }
  }

  /**
   * computeViolationNetwork
   *
   * Preferred: GET /api/observability/violations/summary
   * Fallback:  FAIL receipt aggregation (Phase 4 logic)
   */
  async computeViolationNetwork(): Promise<IGraphData> {
    const cacheKey = 'violation-network'
    const cached = this._getFromCache<IGraphData>(cacheKey)
    if (cached) return cached

    const obsSummary = await this._observability.getViolationSummary()
    let result: IGraphData

    if (obsSummary) {
      result = this._transformObsViolationSummary(obsSummary)
      logger.debug('computeViolationNetwork: using observability endpoint')
    } else {
      result = await this._computeViolationNetworkFallback()
      logger.debug('computeViolationNetwork: using fallback aggregation')
    }

    this._setCache(cacheKey, result)
    return result
  }

  private async _computeViolationNetworkFallback(): Promise<IGraphData> {

    const receiptsRes = await this._conn.fetch(
      '/api/governance/receipts?consequence=FAIL&limit=500',
    )
    if (!receiptsRes.ok) throw new Error(`Receipts fetch failed: ${receiptsRes.status}`)

    const receipts = ((await receiptsRes.json()) as SylvaReceiptListResponse).items || []
    const violations = receipts.filter((r) => r.consequence === 'FAIL')

    // Count violations per GPA→Channel pair
    const pairCounts = new Map<string, number>()
    const gpaSet = new Set<string>()
    const channelSet = new Set<string>()

    for (const v of violations) {
      const key = `${v.gpaId}\u2192${v.channelId}`
      pairCounts.set(key, (pairCounts.get(key) || 0) + 1)
      gpaSet.add(v.gpaId)
      channelSet.add(v.channelId)
    }

    // Build GPA nodes (left side)
    const gpaNodes: IGraphNode[] = [...gpaSet].map((gpaId) => {
      const gpaViolations = violations.filter((v) => v.gpaId === gpaId).length
      return {
        id: gpaId,
        group: 1,
        label: `GPA ${gpaId.slice(0, 8)}`,
        val: Math.max(15, Math.min(50, gpaViolations * 5)),
        desc: `Violations: ${gpaViolations}`,
        icon: '',
        type: 'violator-gpa',
        url: '',
        color: '#FF4444',
      } as IGraphNode
    })

    // Build channel nodes (right side)
    const channelNodes: IGraphNode[] = [...channelSet].map((channelId) => {
      const chViolations = violations.filter((v) => v.channelId === channelId).length
      return {
        id: channelId,
        group: 2,
        label: `Channel ${channelId.slice(0, 8)}`,
        val: Math.max(15, Math.min(50, chViolations * 5)),
        desc: `Violations: ${chViolations}`,
        icon: '',
        type: 'violated-channel',
        url: '',
        color: '#FF8C00',
      } as IGraphNode
    })

    // Build violation links
    const links: IGraphLink[] = []
    for (const [key, count] of pairCounts) {
      const [source, target] = key.split('\u2192')
      links.push({
        source,
        target,
        label: `${count} violation${count > 1 ? 's' : ''}`,
        val: Math.min(count, 10),
        type: 'violation',
      })
    }

    const result = { nodes: [...gpaNodes, ...channelNodes], links }
    return result
  }

  /**
   * computeCoherenceHeatmap
   *
   * Preferred: GET /api/observability/coherence/summary
   * Fallback:  Coherence data aggregation (Phase 4 logic)
   */
  async computeCoherenceHeatmap(): Promise<IGraphData> {
    const obsSummary = await this._observability.getCoherenceSummary()

    if (obsSummary) {
      logger.debug('computeCoherenceHeatmap: using observability endpoint')
      return this._transformObsCoherenceSummary(obsSummary)
    }

    logger.debug('computeCoherenceHeatmap: using fallback aggregation')
    return this._computeCoherenceHeatmapFallback()
  }

  private async _computeCoherenceHeatmapFallback(): Promise<IGraphData> {
    const res = await this._conn.fetch('/api/governance/coherence')
    if (!res.ok) throw new Error(`Coherence fetch failed: ${res.status}`)

    const data = ((await res.json()) as SylvaCoherenceListResponse).items || []

    // Bucket by score ranges: [0-0.2), [0.2-0.4), [0.4-0.6), [0.6-0.8), [0.8-1.0]
    const bucketRanges = [
      { min: 0.0, max: 0.2, label: '0-20%', color: '#FF4444', group: 5 },
      { min: 0.2, max: 0.4, label: '20-40%', color: '#FF8C00', group: 4 },
      { min: 0.4, max: 0.6, label: '40-60%', color: '#FFD700', group: 3 },
      { min: 0.6, max: 0.8, label: '60-80%', color: '#00BFFF', group: 2 },
      { min: 0.8, max: 1.01, label: '80-100%', color: '#00FF00', group: 1 },
    ]

    const nodes: IGraphNode[] = []
    const links: IGraphLink[] = []

    // Create bucket root nodes
    const bucketNodeIds: string[] = []
    for (const range of bucketRanges) {
      const bucketEntities = data.filter(
        (dp) => dp.coherenceScore >= range.min && dp.coherenceScore < range.max,
      )

      const bucketId = `bucket-${range.label}`
      bucketNodeIds.push(bucketId)

      nodes.push({
        id: bucketId,
        group: range.group,
        label: `${range.label} (${bucketEntities.length})`,
        val: 40,
        desc: `${bucketEntities.length} entities in range ${range.label}`,
        icon: '',
        type: 'coherence-bucket',
        url: '',
        color: range.color,
      })

      // Add entity nodes connected to their bucket
      for (const dp of bucketEntities) {
        nodes.push({
          id: dp.entityId,
          group: range.group,
          label: dp.entityName,
          val: Math.max(10, dp.coherenceScore * 50),
          desc: [
            `Type: ${dp.entityType}`,
            `Score: ${(dp.coherenceScore * 100).toFixed(0)}%`,
            `Trajectory: ${dp.trajectory}`,
          ].join('\n'),
          icon: '',
          type: `heatmap-${dp.entityType}`,
          url: '',
          color: range.color,
        })

        links.push({
          source: bucketId,
          target: dp.entityId,
          label: '',
          val: 1,
          type: 'bucket-member',
        })
      }
    }

    // Link buckets sequentially for visual ordering
    for (let i = 0; i < bucketNodeIds.length - 1; i++) {
      links.push({
        source: bucketNodeIds[i],
        target: bucketNodeIds[i + 1],
        label: '',
        val: 2,
        type: 'bucket-sequence',
      })
    }

    return { nodes, links }
  }

  // --- Observability transformers ---

  private _transformObsExecutionSummary(obs: ObservabilityExecutionSummary): IGraphData {
    const nodes: IGraphNode[] = obs.buckets.map((bucket) => {
      const passRate = bucket.executionCount > 0 ? bucket.passCount / bucket.executionCount : 0
      return {
        id: `bucket-${new Date(bucket.timestamp).getTime()}`,
        group: passRate > 0.8 ? 1 : passRate > 0.5 ? 2 : 3,
        label: bucket.timestamp.slice(0, 13),
        val: Math.max(10, Math.min(60, bucket.executionCount * 3)),
        desc: [
          `Executions: ${bucket.executionCount}`,
          `Pass rate: ${(passRate * 100).toFixed(0)}%`,
          `Avg duration: ${Math.round(bucket.avgDurationMs)}ms`,
          `P95 duration: ${Math.round(bucket.p95DurationMs)}ms`,
        ].join('\n'),
        icon: '',
        type: 'time-bucket',
        url: '',
        color: passRate > 0.8 ? '#00FF00' : passRate > 0.5 ? '#FFD700' : '#FF4444',
      }
    })

    const links: IGraphLink[] = []
    for (let i = 0; i < nodes.length - 1; i++) {
      links.push({
        source: nodes[i].id,
        target: nodes[i + 1].id,
        label: '',
        val: 1,
        type: 'timeline',
      })
    }

    return { nodes, links }
  }

  private _transformObsComplianceSummary(obs: ObservabilityComplianceSummary): IGraphData {
    const gradeColors: Record<string, string> = {
      A: '#00FF00', B: '#00BFFF', C: '#FFD700', D: '#FF8C00', F: '#FF4444',
    }

    const nodes: IGraphNode[] = obs.channels.map((ch) => ({
      id: ch.channelId,
      group: ch.passRate > 0.9 ? 1 : ch.passRate > 0.7 ? 2 : 3,
      label: `${ch.channelName} (${ch.coverageGrade})`,
      val: Math.max(15, Math.min(70, ch.passRate * 70)),
      desc: [
        `Channel: ${ch.channelName}`,
        `Grade: ${ch.coverageGrade}`,
        `Pass rate: ${(ch.passRate * 100).toFixed(0)}%`,
        `Total receipts: ${ch.totalReceipts}`,
        `Tier: ${ch.governanceTier}`,
      ].join('\n'),
      icon: '',
      type: 'compliance-channel',
      url: '',
      color: gradeColors[ch.coverageGrade] ?? '#4682B4',
    }))

    const links: IGraphLink[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].group === nodes[j].group) {
          links.push({
            source: nodes[i].id,
            target: nodes[j].id,
            label: '',
            val: 1,
            type: 'compliance-cluster',
          })
        }
      }
    }

    return { nodes, links }
  }

  private _transformObsFleetHealth(obs: ObservabilityFleetHealth): IGraphData {
    const gradeColors: Record<string, string> = {
      healthy: '#00FF00', warning: '#FFD700', critical: '#FF4444', offline: '#666666',
    }

    const nodes: IGraphNode[] = obs.gpas.map((gpa) => ({
      id: gpa.gpaId,
      group: gpa.healthGrade === 'healthy' ? 1 : gpa.healthGrade === 'warning' ? 2 : gpa.healthGrade === 'critical' ? 3 : 4,
      label: `${gpa.gpaName} (${Math.round(gpa.healthScore * 100)}%)`,
      val: Math.max(15, gpa.healthScore * 70),
      desc: [
        `Status: ${gpa.status}`,
        `Health: ${Math.round(gpa.healthScore * 100)}% (${gpa.healthGrade})`,
        `Budget: ${(gpa.budgetUtilization * 100).toFixed(0)}% used`,
        `Coherence: ${(gpa.coherenceScore * 100).toFixed(0)}%`,
        `Recent pass rate: ${(gpa.recentPassRate * 100).toFixed(0)}%`,
      ].join('\n'),
      icon: '',
      type: 'fleet-gpa',
      url: '',
      color: gradeColors[gpa.healthGrade] ?? '#4682B4',
    }))

    const links: IGraphLink[] = []
    const groups = new Map<number, string[]>()
    for (const node of nodes) {
      if (!groups.has(node.group)) groups.set(node.group, [])
      groups.get(node.group)!.push(node.id)
    }
    for (const [, ids] of groups) {
      for (let i = 0; i < ids.length - 1; i++) {
        links.push({ source: ids[i], target: ids[i + 1], label: '', val: 1, type: 'health-cluster' })
      }
    }

    return { nodes, links }
  }

  private _transformObsViolationSummary(obs: ObservabilityViolationSummary): IGraphData {
    const gpaSet = new Map<string, string>()
    const channelSet = new Map<string, string>()

    for (const v of obs.violations) {
      gpaSet.set(v.gpaId, v.gpaName)
      channelSet.set(v.channelId, v.channelName)
    }

    const gpaNodes: IGraphNode[] = [...gpaSet].map(([id, name]) => {
      const count = obs.violations.filter((v) => v.gpaId === id).reduce((sum, v) => sum + v.violationCount, 0)
      return {
        id, group: 1, label: name, val: Math.max(15, Math.min(50, count * 5)),
        desc: `Violations: ${count}`, icon: '', type: 'violator-gpa', url: '', color: '#FF4444',
      }
    })

    const channelNodes: IGraphNode[] = [...channelSet].map(([id, name]) => {
      const count = obs.violations.filter((v) => v.channelId === id).reduce((sum, v) => sum + v.violationCount, 0)
      return {
        id, group: 2, label: name, val: Math.max(15, Math.min(50, count * 5)),
        desc: `Violations: ${count}`, icon: '', type: 'violated-channel', url: '', color: '#FF8C00',
      }
    })

    const links: IGraphLink[] = obs.violations.map((v) => ({
      source: v.gpaId, target: v.channelId,
      label: `${v.violationCount} violation${v.violationCount > 1 ? 's' : ''}`,
      val: Math.min(v.violationCount, 10), type: 'violation',
    }))

    return { nodes: [...gpaNodes, ...channelNodes], links }
  }

  private _transformObsCoherenceSummary(obs: ObservabilityCoherenceSummary): IGraphData {
    const bucketColors = ['#FF4444', '#FF8C00', '#FFD700', '#00BFFF', '#00FF00']
    const nodes: IGraphNode[] = []
    const links: IGraphLink[] = []
    const bucketNodeIds: string[] = []

    for (let i = 0; i < obs.distribution.length; i++) {
      const dist = obs.distribution[i]
      const bucketId = `bucket-${dist.bucketLabel}`
      bucketNodeIds.push(bucketId)

      const bucketEntities = obs.entities.filter(
        (e) => e.coherenceScore >= dist.min && e.coherenceScore < dist.max + (i === obs.distribution.length - 1 ? 0.01 : 0),
      )

      nodes.push({
        id: bucketId, group: i + 1, label: `${dist.bucketLabel} (${dist.count})`, val: 40,
        desc: `${dist.count} entities`, icon: '', type: 'coherence-bucket', url: '',
        color: bucketColors[i] ?? '#4682B4',
      })

      for (const entity of bucketEntities) {
        nodes.push({
          id: entity.entityId, group: i + 1, label: entity.entityName,
          val: Math.max(10, entity.coherenceScore * 50),
          desc: `Type: ${entity.entityType}\nScore: ${(entity.coherenceScore * 100).toFixed(0)}%\nTrajectory: ${entity.trajectory}`,
          icon: '', type: `heatmap-${entity.entityType}`, url: '',
          color: bucketColors[i] ?? '#4682B4',
        })
        links.push({ source: bucketId, target: entity.entityId, label: '', val: 1, type: 'bucket-member' })
      }
    }

    for (let i = 0; i < bucketNodeIds.length - 1; i++) {
      links.push({ source: bucketNodeIds[i], target: bucketNodeIds[i + 1], label: '', val: 2, type: 'bucket-sequence' })
    }

    return { nodes, links }
  }

  // --- Cache helpers ---

  private _getFromCache<T>(key: string): T | null {
    const entry = this._cache.get(key)
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data as T
    }
    this._cache.delete(key)
    return null
  }

  private _setCache<T>(key: string, data: T, ttl?: number): void {
    this._cache.set(key, {
      data,
      expiresAt: Date.now() + (ttl || this._defaultTTL),
    })
  }
}
