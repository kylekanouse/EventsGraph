import { describe, it, expect, beforeEach } from 'vitest'
import { TrellisSnapshotCache } from '../../services/TrellisSnapshotCache'

describe('TrellisSnapshotCache', () => {
  let cache: TrellisSnapshotCache

  beforeEach(() => {
    cache = new TrellisSnapshotCache(5, 60_000)
  })

  it('should store and retrieve latest snapshot', () => {
    const graphData = { nodes: [{ id: 'n1' }], links: [] }
    cache.store('ctx-1', graphData as any)

    const latest = cache.getLatest('ctx-1')
    expect(latest).not.toBeNull()
    expect(latest!.graphData.nodes).toHaveLength(1)
  })

  it('should return null for unknown context', () => {
    expect(cache.getLatest('unknown')).toBeNull()
    expect(cache.getPrevious('unknown')).toBeNull()
  })

  it('should return previous snapshot', () => {
    cache.store('ctx-1', { nodes: [{ id: 'n1' }], links: [] } as any)
    cache.store('ctx-1', { nodes: [{ id: 'n1' }, { id: 'n2' }], links: [] } as any)

    const previous = cache.getPrevious('ctx-1')
    expect(previous).not.toBeNull()
    expect(previous!.graphData.nodes).toHaveLength(1)
  })

  it('should return null for previous when only one snapshot', () => {
    cache.store('ctx-1', { nodes: [{ id: 'n1' }], links: [] } as any)
    expect(cache.getPrevious('ctx-1')).toBeNull()
  })

  it('should evict oldest snapshots when limit reached', () => {
    for (let i = 0; i < 7; i++) {
      cache.store('ctx-1', { nodes: [{ id: `n${i}` }], links: [] } as any)
    }

    const history = cache.getHistory('ctx-1')
    expect(history.length).toBeLessThanOrEqual(5)
  })

  it('should deep copy stored data', () => {
    const graphData = { nodes: [{ id: 'n1', label: 'original' }], links: [] }
    cache.store('ctx-1', graphData as any)

    graphData.nodes[0].label = 'modified'

    const latest = cache.getLatest('ctx-1')
    expect(latest!.graphData.nodes[0].label).toBe('original')
  })

  it('should find closest snapshot by timestamp', () => {
    cache.store('ctx-1', { nodes: [{ id: 'n1' }], links: [] } as any)
    const now = Date.now()
    cache.store('ctx-1', { nodes: [{ id: 'n2' }], links: [] } as any)

    const result = cache.getByTimestamp('ctx-1', now)
    expect(result).not.toBeNull()
  })

  it('should return null for getByTimestamp on unknown context', () => {
    expect(cache.getByTimestamp('unknown', Date.now())).toBeNull()
  })

  it('should return empty array for getHistory on unknown context', () => {
    expect(cache.getHistory('unknown')).toEqual([])
  })

  it('should clear snapshots for a specific context', () => {
    cache.store('ctx-1', { nodes: [{ id: 'n1' }], links: [] } as any)
    cache.store('ctx-2', { nodes: [{ id: 'n2' }], links: [] } as any)

    cache.clear('ctx-1')

    expect(cache.getLatest('ctx-1')).toBeNull()
    expect(cache.getLatest('ctx-2')).not.toBeNull()
  })

  it('should clear all snapshots', () => {
    cache.store('ctx-1', { nodes: [{ id: 'n1' }], links: [] } as any)
    cache.store('ctx-2', { nodes: [{ id: 'n2' }], links: [] } as any)

    cache.clear()

    expect(cache.getLatest('ctx-1')).toBeNull()
    expect(cache.getLatest('ctx-2')).toBeNull()
  })

  it('should isolate snapshots between contexts', () => {
    cache.store('ctx-1', { nodes: [{ id: 'n1' }], links: [] } as any)
    cache.store('ctx-2', { nodes: [{ id: 'n2' }], links: [] } as any)

    const latest1 = cache.getLatest('ctx-1')
    const latest2 = cache.getLatest('ctx-2')

    expect(latest1!.graphData.nodes[0].id).toBe('n1')
    expect(latest2!.graphData.nodes[0].id).toBe('n2')
  })
})
