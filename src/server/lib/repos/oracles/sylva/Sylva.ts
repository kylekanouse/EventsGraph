import Oracle from '../Oracle'
import { constants } from '../../../../constants'
import { SylvaConnectionManager } from './SylvaConnectionManager'
import { SylvaEventBridge } from './SylvaEventBridge'
import { SylvaObservabilityClient } from './services/SylvaObservabilityClient'
import { SylvaAnalyticsService } from './services/SylvaAnalyticsService'
// Phase 1 contexts
import ContextAgentTopology from './contexts/ContextAgentTopology'
import ContextChannelNetwork from './contexts/ContextChannelNetwork'
import ContextInstanceOverview from './contexts/ContextInstanceOverview'
// Phase 3 contexts
import ContextGovernanceReceiptChain from './contexts/ContextGovernanceReceiptChain'
import ContextExecutionTree from './contexts/ContextExecutionTree'
import ContextCrossChannelKnowledge from './contexts/ContextCrossChannelKnowledge'
import ContextFilesystemTree from './contexts/ContextFilesystemTree'
import ContextFederationMesh from './contexts/ContextFederationMesh'
import ContextCoherenceLandscape from './contexts/ContextCoherenceLandscape'
// Phase 4 contexts
import ContextExecutionTrends from './contexts/ContextExecutionTrends'
import ContextComplianceOverview from './contexts/ContextComplianceOverview'
import ContextFleetHealth from './contexts/ContextFleetHealth'
import ContextViolationNetwork from './contexts/ContextViolationNetwork'
import ContextCoherenceHeatmap from './contexts/ContextCoherenceHeatmap'
// Phase 6 advanced features
import { SylvaSnapshotCache } from './services/SylvaSnapshotCache'
import { diff, diffToGraphData } from './services/SylvaGraphDiff'
import { extractSubgraph } from './services/SylvaSubgraphExtractor'
import { searchGraph, highlightSearchResults } from './services/SylvaGraphSearch'
import { SylvaNodeDetailService } from './services/SylvaNodeDetail'
import { logger } from '../../../logger'
import IEventsGraphCollectionContextRequest from '../../../../domain/IEventsGraphCollectionContextRequest'
import IEventsGraphCollectionContextResponse from '../../../../domain/IEventsGraphCollectionContextResponse'
import IGraphData from '../../../../domain/IGraphData'
import type { AdvancedParams } from './types'

class Sylva extends Oracle {
  private _conn: SylvaConnectionManager
  private _bridge: SylvaEventBridge
  private _observability: SylvaObservabilityClient
  private _analytics: SylvaAnalyticsService
  private _snapshotCache: SylvaSnapshotCache
  private _nodeDetailService: SylvaNodeDetailService

  constructor() {
    const conn = new SylvaConnectionManager()
    const bridge = new SylvaEventBridge(conn)
    const observability = new SylvaObservabilityClient(conn)
    const analytics = new SylvaAnalyticsService(conn, observability)
    super(constants.SYLVA_COLLECTION_ID, [
      // Entity contexts (Phases 1 + 3)
      new ContextAgentTopology(conn, bridge),
      new ContextChannelNetwork(conn, bridge),
      new ContextInstanceOverview(conn, bridge),
      new ContextGovernanceReceiptChain(conn, bridge),
      new ContextExecutionTree(conn),
      new ContextCrossChannelKnowledge(conn, bridge),
      new ContextFilesystemTree(conn, bridge),
      new ContextFederationMesh(conn, bridge),
      new ContextCoherenceLandscape(conn, bridge),
      // Analytical contexts (Phase 4 + 5 observability)
      new ContextExecutionTrends(analytics),
      new ContextComplianceOverview(analytics),
      new ContextFleetHealth(analytics, bridge),
      new ContextViolationNetwork(analytics),
      new ContextCoherenceHeatmap(analytics, bridge),
    ])
    this._conn = conn
    this._bridge = bridge
    this._observability = observability
    this._analytics = analytics
    this._snapshotCache = new SylvaSnapshotCache()
    this._nodeDetailService = new SylvaNodeDetailService(conn)
    logger.info('Sylva Oracle: initialized with advanced features support (Phase 6)')
  }

  getConnectionManager(): SylvaConnectionManager {
    return this._conn
  }

  getEventBridge(): SylvaEventBridge {
    return this._bridge
  }

  getObservabilityClient(): SylvaObservabilityClient {
    return this._observability
  }

  getAnalyticsService(): SylvaAnalyticsService {
    return this._analytics
  }

  getSnapshotCache(): SylvaSnapshotCache {
    return this._snapshotCache
  }

  getNodeDetailService(): SylvaNodeDetailService {
    return this._nodeDetailService
  }

  /**
   * getData
   *
   * Overrides base Oracle getData to apply advanced features as
   * post-processing on the graph data returned by contexts.
   * Advanced features are opt-in via request.params.
   */
  public async getData(
    request: IEventsGraphCollectionContextRequest,
  ): Promise<IEventsGraphCollectionContextResponse> {
    // Get base response from the context
    const response = await super.getData(request)

    // Apply advanced features based on params
    const params = request.params as AdvancedParams | undefined
    if (response.graphData && params) {
      let graphData = response.graphData as IGraphData

      // Store snapshot for future diffs
      this._snapshotCache.store(request.context, graphData)

      // Diff mode
      if (params.diff) {
        const previous = this._snapshotCache.getPrevious(request.context)
        if (previous) {
          const diffResult = diff(previous.graphData, graphData)
          graphData = diffToGraphData(graphData, diffResult)
        }
      }

      // Time-travel diff
      if (params.diffTimestamp) {
        const historical = this._snapshotCache.getByTimestamp(
          request.context,
          params.diffTimestamp,
        )
        if (historical) {
          const diffResult = diff(historical.graphData, graphData)
          graphData = diffToGraphData(graphData, diffResult)
        }
      }

      // Subgraph extraction
      if (params.subgraph) {
        graphData = extractSubgraph(
          graphData,
          params.subgraph.rootId,
          params.subgraph.depth,
        )
      }

      // Search highlighting
      if (params.search) {
        const results = searchGraph(graphData, params.search)
        graphData = highlightSearchResults(graphData, results)
      }

      response.graphData = graphData
    }

    return response
  }
}

export default new Sylva()
