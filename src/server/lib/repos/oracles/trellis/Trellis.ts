import Oracle from '../Oracle'
import { constants } from '../../../../constants'
import { TrellisConnectionManager } from './TrellisConnectionManager'
import { TrellisEventBridge } from './TrellisEventBridge'
import { TrellisObservabilityClient } from './services/TrellisObservabilityClient'
import { TrellisAnalyticsService } from './services/TrellisAnalyticsService'
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
import { TrellisSnapshotCache } from './services/TrellisSnapshotCache'
import { diff, diffToGraphData } from './services/TrellisGraphDiff'
import { extractSubgraph } from './services/TrellisSubgraphExtractor'
import { searchGraph, highlightSearchResults } from './services/TrellisGraphSearch'
import { TrellisNodeDetailService } from './services/TrellisNodeDetail'
import { logger } from '../../../logger'
import IEventsGraphCollectionContextRequest from '../../../../domain/IEventsGraphCollectionContextRequest'
import IEventsGraphCollectionContextResponse from '../../../../domain/IEventsGraphCollectionContextResponse'
import IGraphData from '../../../../domain/IGraphData'
import type { AdvancedParams } from './types'

class Trellis extends Oracle {
  private _conn: TrellisConnectionManager
  private _bridge: TrellisEventBridge
  private _observability: TrellisObservabilityClient
  private _analytics: TrellisAnalyticsService
  private _snapshotCache: TrellisSnapshotCache
  private _nodeDetailService: TrellisNodeDetailService

  constructor() {
    const conn = new TrellisConnectionManager()
    const bridge = new TrellisEventBridge(conn)
    const observability = new TrellisObservabilityClient(conn)
    const analytics = new TrellisAnalyticsService(conn, observability)
    super(constants.TRELLIS_COLLECTION_ID, [
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
    this._snapshotCache = new TrellisSnapshotCache()
    this._nodeDetailService = new TrellisNodeDetailService(conn)
    logger.info('Trellis Oracle: initialized with advanced features support (Phase 6)')
  }

  getConnectionManager(): TrellisConnectionManager {
    return this._conn
  }

  getEventBridge(): TrellisEventBridge {
    return this._bridge
  }

  getObservabilityClient(): TrellisObservabilityClient {
    return this._observability
  }

  getAnalyticsService(): TrellisAnalyticsService {
    return this._analytics
  }

  getSnapshotCache(): TrellisSnapshotCache {
    return this._snapshotCache
  }

  getNodeDetailService(): TrellisNodeDetailService {
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

export default new Trellis()
