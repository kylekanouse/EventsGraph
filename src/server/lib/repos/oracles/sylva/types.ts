/**
 * Sylva API Response Types
 *
 * These represent the shapes returned by Sylva REST endpoints.
 * They are consumed by mappers to produce IGraphNode/IGraphLink.
 */

// --- Authentication ---

export interface SylvaAuthResponse {
  token: string
  expiresAt: string
  participantId: string
  workspaceId: string
}

// --- GPA (General Purpose Agent) ---

export interface SylvaGPA {
  id: string
  name: string
  description?: string
  status: 'deployed' | 'running' | 'paused' | 'stopped' | 'expired'
  parentGpaId?: string
  workspaceId: string
  channelId?: string
  agentRole?: string
  scheduleType?: 'event-driven' | 'scheduled' | 'manual'
  runtimeMode?: string
  executionBudgetTotal: number
  executionBudgetUsed: number
  governanceTier?: string
  eigenstate?: string
  createdAt: string
  updatedAt: string
}

export interface SylvaGPAListResponse {
  items: SylvaGPA[]
  total: number
}

// --- Channel ---

export interface SylvaChannel {
  id: string
  name: string
  description?: string
  channelType: 'standard' | 'governed' | 'broadcast' | 'direct'
  topology?: string
  governanceTier: string
  visibility: 'public' | 'private' | 'restricted'
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface SylvaChannelListResponse {
  items: SylvaChannel[]
  total: number
}

// --- Participant ---

export interface SylvaParticipant {
  id: string
  name: string
  participantType: 'human' | 'agent' | 'service' | 'webhook'
  status: 'active' | 'inactive' | 'suspended'
  governanceDepth: number
  workspaceId: string
  did?: string
  createdAt: string
  updatedAt: string
}

export interface SylvaParticipantListResponse {
  items: SylvaParticipant[]
  total: number
}

// --- Channel Membership ---

export interface SylvaChannelMember {
  participantId: string
  channelId: string
  role: string
  joinedAt: string
}

export interface SylvaChannelMembersResponse {
  items: SylvaChannelMember[]
  total: number
}

// --- Workspace ---

export interface SylvaWorkspace {
  id: string
  name: string
  governanceTier: string
  storageUsed: number
  storageQuota: number
}

// --- Instance Overview (composite) ---

export interface SylvaSystemManifest {
  instanceDid: string
  workspaces: SylvaWorkspace[]
  gpaCount: number
  channelCount: number
  participantCount: number
  governanceTier: string
  storageUsed: number
  storageQuota: number
}

// --- Governance Receipt ---

export interface SylvaGovernanceReceipt {
  id: string
  gpaId: string
  channelId: string
  participantId?: string
  receiptType: 'execution' | 'verification' | 'coherence' | 'lifecycle'
  consequence: 'PASS' | 'FAIL' | 'WARN' | 'INFO'
  governanceTier: string
  coherenceScore?: number
  details?: string
  parentReceiptId?: string
  timestamp: string
  createdAt: string
}

export interface SylvaReceiptListResponse {
  items: SylvaGovernanceReceipt[]
  total: number
}

// --- Execution ---

export interface SylvaExecution {
  id: string
  gpaId: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: string
  completedAt?: string
  consequence?: 'PASS' | 'FAIL'
  steps: SylvaExecutionStep[]
}

export interface SylvaExecutionStep {
  id: string
  executionId: string
  stepType: 'guard' | 'action' | 'verification' | 'emit' | 'observe'
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  consequence?: 'PASS' | 'FAIL' | 'SKIP'
  duration?: number
  order: number
  details?: string
}

export interface SylvaExecutionListResponse {
  items: SylvaExecution[]
  total: number
}

// --- Cross-Channel Knowledge ---

export interface SylvaMessageReference {
  id: string
  sourceChannelId: string
  targetChannelId: string
  sourceMessageId: string
  targetMessageId?: string
  referenceType: 'citation' | 'reply' | 'cross-post' | 'governance-binding'
  participantId: string
  timestamp: string
}

export interface SylvaMessageReferenceListResponse {
  items: SylvaMessageReference[]
  total: number
}

// --- Filesystem ---

export interface SylvaFilesystemNode {
  id: string
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  mimeType?: string
  channelId?: string
  parentId?: string
  children?: SylvaFilesystemNode[]
  createdAt: string
  updatedAt: string
}

export interface SylvaFilesystemTreeResponse {
  root: SylvaFilesystemNode
}

// --- Federation ---

export interface SylvaFederationPeer {
  id: string
  instanceDid: string
  name: string
  url: string
  status: 'connected' | 'disconnected' | 'pending' | 'rejected'
  governanceTier: string
  lastSyncAt?: string
  sharedChannels: number
  createdAt: string
}

export interface SylvaFederationPeerListResponse {
  items: SylvaFederationPeer[]
  total: number
}

// --- Coherence ---

export interface SylvaCoherenceDataPoint {
  entityId: string
  entityType: 'gpa' | 'channel' | 'participant'
  entityName: string
  coherenceScore: number
  trajectory: 'improving' | 'stable' | 'declining'
  measurementCount: number
  lastMeasuredAt: string
}

export interface SylvaCoherenceListResponse {
  items: SylvaCoherenceDataPoint[]
  total: number
}

// --- Analytics Types ---

export interface AnalyticsExecutionTrend {
  timeBucket: number       // Unix timestamp of bucket start
  executionCount: number
  passCount: number
  failCount: number
  avgDurationMs: number
}

export interface AnalyticsComplianceEntry {
  channelId: string
  channelName: string
  totalReceipts: number
  passCount: number
  failCount: number
  passRate: number
}

export interface AnalyticsFleetHealthEntry {
  gpaId: string
  gpaName: string
  healthScore: number
  budgetRemaining: number
  coherenceScore: number
  isActive: boolean
}

export interface AnalyticsViolation {
  gpaId: string
  channelId: string
  violationCount: number
  lastViolation: string
}

export interface AnalyticsCoherenceBucket {
  rangeLabel: string
  min: number
  max: number
  entityCount: number
  entities: {
    id: string
    name: string
    type: string
    score: number
    trajectory: string
  }[]
}

// --- Observability API Response Types ---

/**
 * These types represent responses from Sylva /api/observability/* endpoints.
 * These endpoints may not exist on all Sylva instances.
 */

export interface ObservabilityExecutionSummary {
  timeRange: string
  bucketSize: string
  buckets: {
    timestamp: string
    executionCount: number
    passCount: number
    failCount: number
    avgDurationMs: number
    p95DurationMs: number
  }[]
  totals: {
    totalExecutions: number
    totalPasses: number
    totalFails: number
    overallPassRate: number
    avgDurationMs: number
  }
}

export interface ObservabilityComplianceSummary {
  channels: {
    channelId: string
    channelName: string
    governanceTier: string
    totalReceipts: number
    passCount: number
    failCount: number
    warnCount: number
    passRate: number
    lastReceiptAt: string
    coverageGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  }[]
  summary: {
    overallPassRate: number
    totalChannels: number
    compliantChannels: number
    atRiskChannels: number
  }
}

export interface ObservabilityFleetHealth {
  gpas: {
    gpaId: string
    gpaName: string
    status: string
    healthScore: number
    budgetUtilization: number
    coherenceScore: number
    recentPassRate: number
    lastExecutionAt: string
    healthGrade: 'healthy' | 'warning' | 'critical' | 'offline'
  }[]
  summary: {
    totalGpas: number
    healthyCount: number
    warningCount: number
    criticalCount: number
    offlineCount: number
    averageHealthScore: number
  }
}

export interface ObservabilityViolationSummary {
  violations: {
    gpaId: string
    gpaName: string
    channelId: string
    channelName: string
    violationCount: number
    lastViolationAt: string
    violationType: string
  }[]
  summary: {
    totalViolations: number
    uniqueGpas: number
    uniqueChannels: number
    mostViolatedChannel: string
    topViolator: string
  }
}

export interface ObservabilityCoherenceSummary {
  entities: {
    entityId: string
    entityName: string
    entityType: string
    coherenceScore: number
    trajectory: string
    measurementCount: number
    lastMeasuredAt: string
  }[]
  distribution: {
    bucketLabel: string
    min: number
    max: number
    count: number
  }[]
  summary: {
    averageCoherence: number
    medianCoherence: number
    improvingCount: number
    decliningCount: number
    stableCount: number
  }
}

export interface ObservabilityFeatures {
  executionSummary: boolean
  complianceSummary: boolean
  fleetHealth: boolean
  violationSummary: boolean
  coherenceSummary: boolean
}

// --- Advanced Features Types (Phase 6) ---

export interface AdvancedParams {
  /** Diff mode: compare current state to previous snapshot */
  diff?: boolean
  /** Time-travel: compare current state to a specific timestamp */
  diffTimestamp?: number
  /** Subgraph extraction: only return nodes within N hops of rootId */
  subgraph?: {
    rootId: string
    depth: number
  }
  /** Search: filter graph to highlight matching nodes */
  search?: string
  /** Node detail: fetch expanded info for a specific node */
  nodeDetail?: string
  /** Cross-context nav: include navigation metadata */
  crossContextNav?: boolean
}
