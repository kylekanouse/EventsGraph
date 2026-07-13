import { SylvaConnectionManager } from '../SylvaConnectionManager'
import { logger } from '../../../../logger'
import type {
  ObservabilityFeatures,
  ObservabilityExecutionSummary,
  ObservabilityComplianceSummary,
  ObservabilityFleetHealth,
  ObservabilityViolationSummary,
  ObservabilityCoherenceSummary,
} from '../types'

const ENDPOINTS = {
  executionSummary: '/api/observability/executions/summary',
  complianceSummary: '/api/observability/compliance/summary',
  fleetHealth: '/api/observability/fleet/health',
  violationSummary: '/api/observability/violations/summary',
  coherenceSummary: '/api/observability/coherence/summary',
} as const

type EndpointKey = keyof typeof ENDPOINTS

export class SylvaObservabilityClient {
  private _conn: SylvaConnectionManager
  private _features: ObservabilityFeatures | null = null
  private _probePromise: Promise<ObservabilityFeatures> | null = null

  constructor(conn: SylvaConnectionManager) {
    this._conn = conn
  }

  async probeFeatures(): Promise<ObservabilityFeatures> {
    if (this._probePromise) return this._probePromise
    if (this._features) return this._features

    this._probePromise = this._doProbe()
    this._features = await this._probePromise
    this._probePromise = null

    logger.info({ features: this._features }, 'Sylva observability: feature detection complete')
    return this._features
  }

  async getFeatures(): Promise<ObservabilityFeatures> {
    if (this._features) return this._features
    return this.probeFeatures()
  }

  async isAvailable(feature: EndpointKey): Promise<boolean> {
    const features = await this.getFeatures()
    return features[feature]
  }

  resetFeatures(): void {
    this._features = null
    this._probePromise = null
  }

  // --- Endpoint wrappers ---

  async getExecutionSummary(params?: {
    timeRange?: string
    bucketSize?: string
  }): Promise<ObservabilityExecutionSummary | null> {
    return this._fetchIfAvailable('executionSummary', params)
  }

  async getComplianceSummary(): Promise<ObservabilityComplianceSummary | null> {
    return this._fetchIfAvailable('complianceSummary')
  }

  async getFleetHealth(): Promise<ObservabilityFleetHealth | null> {
    return this._fetchIfAvailable('fleetHealth')
  }

  async getViolationSummary(): Promise<ObservabilityViolationSummary | null> {
    return this._fetchIfAvailable('violationSummary')
  }

  async getCoherenceSummary(): Promise<ObservabilityCoherenceSummary | null> {
    return this._fetchIfAvailable('coherenceSummary')
  }

  // --- Private ---

  private async _doProbe(): Promise<ObservabilityFeatures> {
    const features: ObservabilityFeatures = {
      executionSummary: false,
      complianceSummary: false,
      fleetHealth: false,
      violationSummary: false,
      coherenceSummary: false,
    }

    const probes = Object.entries(ENDPOINTS).map(async ([key, path]) => {
      try {
        const res = await this._conn.fetch(path, { method: 'HEAD' })
        features[key as EndpointKey] = res.ok
      } catch {
        features[key as EndpointKey] = false
      }
    })

    await Promise.all(probes)
    return features
  }

  private async _fetchIfAvailable<T>(
    feature: EndpointKey,
    params?: Record<string, string | undefined>,
  ): Promise<T | null> {
    const available = await this.isAvailable(feature)
    if (!available) return null

    const path = ENDPOINTS[feature]
    const queryParams = new URLSearchParams()
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) queryParams.set(k, v)
      }
    }
    const queryString = queryParams.toString()
    const fullPath = queryString ? `${path}?${queryString}` : path

    try {
      const res = await this._conn.fetch(fullPath)
      if (!res.ok) {
        logger.warn({ status: res.status, path: fullPath }, 'Observability endpoint returned error')
        return null
      }
      return (await res.json()) as T
    } catch (err) {
      logger.warn({ err, path: fullPath }, 'Observability endpoint fetch failed')
      return null
    }
  }
}
