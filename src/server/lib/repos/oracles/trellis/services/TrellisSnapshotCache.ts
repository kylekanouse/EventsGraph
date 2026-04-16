import IGraphData from '../../../../../domain/IGraphData'

export interface Snapshot {
  contextId: string
  timestamp: number
  graphData: IGraphData
}

/**
 * TrellisSnapshotCache
 *
 * Stores the N most recent graph snapshots per context.
 * Used by the diff engine to compute changes between requests.
 */
export class TrellisSnapshotCache {
  private _cache: Map<string, Snapshot[]> = new Map()
  private _maxSnapshotsPerContext: number
  private _maxAge: number // milliseconds

  constructor(maxSnapshotsPerContext: number = 10, maxAge: number = 3600_000) {
    this._maxSnapshotsPerContext = maxSnapshotsPerContext
    this._maxAge = maxAge
  }

  /**
   * store
   *
   * Stores a graph snapshot for a context.
   * Evicts oldest snapshots if limit exceeded.
   */
  store(contextId: string, graphData: IGraphData): Snapshot {
    if (!this._cache.has(contextId)) {
      this._cache.set(contextId, [])
    }

    const snapshots = this._cache.get(contextId)!
    const snapshot: Snapshot = {
      contextId,
      timestamp: Date.now(),
      graphData: this._deepCopy(graphData),
    }

    snapshots.push(snapshot)

    // Evict old snapshots
    this._evict(contextId)

    return snapshot
  }

  /**
   * getLatest
   *
   * Returns the most recent snapshot for a context.
   */
  getLatest(contextId: string): Snapshot | null {
    const snapshots = this._cache.get(contextId)
    if (!snapshots || snapshots.length === 0) return null
    return snapshots[snapshots.length - 1]
  }

  /**
   * getPrevious
   *
   * Returns the second-most-recent snapshot (the one before the latest).
   * Used for diffing current vs. previous.
   */
  getPrevious(contextId: string): Snapshot | null {
    const snapshots = this._cache.get(contextId)
    if (!snapshots || snapshots.length < 2) return null
    return snapshots[snapshots.length - 2]
  }

  /**
   * getByTimestamp
   *
   * Returns the snapshot closest to the requested timestamp.
   * Used for time-travel queries.
   */
  getByTimestamp(contextId: string, timestamp: number): Snapshot | null {
    const snapshots = this._cache.get(contextId)
    if (!snapshots || snapshots.length === 0) return null

    let closest = snapshots[0]
    let minDiff = Math.abs(snapshots[0].timestamp - timestamp)

    for (const snap of snapshots) {
      const diff = Math.abs(snap.timestamp - timestamp)
      if (diff < minDiff) {
        minDiff = diff
        closest = snap
      }
    }

    return closest
  }

  /**
   * getHistory
   *
   * Returns all stored snapshots for a context, ordered by timestamp.
   */
  getHistory(contextId: string): Snapshot[] {
    return this._cache.get(contextId) || []
  }

  /**
   * clear
   *
   * Clears all snapshots for a context (or all contexts).
   */
  clear(contextId?: string): void {
    if (contextId) {
      this._cache.delete(contextId)
    } else {
      this._cache.clear()
    }
  }

  // --- Private ---

  private _evict(contextId: string): void {
    const snapshots = this._cache.get(contextId)!
    const now = Date.now()

    // Remove expired snapshots
    const filtered = snapshots.filter((s) => now - s.timestamp < this._maxAge)

    // Trim to max size
    while (filtered.length > this._maxSnapshotsPerContext) {
      filtered.shift()
    }

    this._cache.set(contextId, filtered)
  }

  private _deepCopy(graphData: IGraphData): IGraphData {
    return {
      nodes: graphData.nodes.map((n: any) => ({ ...n })),
      links: graphData.links.map((l: any) => ({ ...l })),
    }
  }
}
