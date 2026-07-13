import { describe, it, expect } from 'vitest'
import EventsGraphDataRepo from '../../repos/EventsGraphDataRepo'

// The repo is exported as a singleton with Twitter, BasicNetwork, DummyData pre-registered.

describe('EventsGraphDataRepo', () => {

  // ── getCollectionIDs ──────────────────────────────────────────

  describe('getCollectionIDs', () => {
    it('returns all registered collection IDs', () => {
      const ids = EventsGraphDataRepo.getCollectionIDs()
      expect(Array.isArray(ids)).toBe(true)
      expect(ids.length).toBeGreaterThanOrEqual(3)
      expect(ids).toContain('twitter')
      expect(ids).toContain('basicnetwork')
      expect(ids).toContain('dummydata')
    })
  })

  // ── findCollectionByID ────────────────────────────────────────

  describe('findCollectionByID', () => {
    it('returns correct oracle for known ID', () => {
      const collection = EventsGraphDataRepo.findCollectionByID('twitter')
      expect(collection).toBeDefined()
      expect(collection!.getID()).toBe('twitter')
    })

    it('returns correct oracle for basicnetwork', () => {
      const collection = EventsGraphDataRepo.findCollectionByID('basicnetwork')
      expect(collection).toBeDefined()
      expect(collection!.getID()).toBe('basicnetwork')
    })

    it('returns correct oracle for dummydata', () => {
      const collection = EventsGraphDataRepo.findCollectionByID('dummydata')
      expect(collection).toBeDefined()
      expect(collection!.getID()).toBe('dummydata')
    })

    it('returns undefined for unknown ID', () => {
      const collection = EventsGraphDataRepo.findCollectionByID('nonexistent')
      expect(collection).toBeUndefined()
    })
  })

  // ── getData ───────────────────────────────────────────────────

  describe('getData', () => {
    it('rejects when collection is not found', async () => {
      const request = {
        collection: 'unknown-collection',
        context: 'some-context',
        isStream: false,
        params: {},
      }
      await expect(EventsGraphDataRepo.getData(request)).rejects.toBeDefined()
    })

    it('delegates to correct collection (dummydata)', async () => {
      const request = {
        collection: 'dummydata',
        context: 'dummydata-basic',
        isStream: false,
        params: {},
      }
      // DummyData should resolve without throwing (it has a valid context)
      const response = await EventsGraphDataRepo.getData(request)
      expect(response).toBeDefined()
      expect(response.collection).toBe('dummydata')
      expect(response.meta).toBeDefined()
    })
  })

  // ── getDataStream ─────────────────────────────────────────────

  describe('getDataStream', () => {
    it('calls error callback when collection is not found', () => {
      const request = {
        collection: 'nonexistent',
        context: 'ctx',
        isStream: true,
        params: {},
      }

      let capturedError: Error | undefined
      EventsGraphDataRepo.getDataStream(request, (err: Error | null) => {
        if (err) capturedError = err
      })

      expect(capturedError).toBeDefined()
      expect(capturedError!.message).toContain('Unable to find collection')
    })

    it('calls error callback when collection exists but context stream is unavailable', () => {
      const request = {
        collection: 'dummydata',
        context: 'dummydata-basic',
        isStream: true,
        params: {},
      }

      let capturedError: Error | undefined
      EventsGraphDataRepo.getDataStream(request, (err: Error | null) => {
        if (err) capturedError = err
      })

      // Should produce an error — either not streamable or context stream not found
      expect(capturedError).toBeDefined()
      expect(capturedError).toBeInstanceOf(Error)
    })
  })
})
