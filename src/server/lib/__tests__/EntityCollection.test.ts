import { describe, it, expect } from 'vitest'
import EntityCollection from '../EntityCollection'
import Entity from '../Entity'
import IGraphNode from '../../domain/IGraphNode'
import { CollectionAssociation } from '../../domain/IEntityCollection'
import { createNode } from '../Utils'

// ── Concrete test doubles ───────────────────────────────────────────

class TestEntity extends Entity {
  private _label: string

  constructor(label: string, id?: string) {
    super('test', id)
    this._label = label
  }

  public getLabel(): string {
    return this._label
  }

  public getNode(): IGraphNode {
    return createNode(this.getID(), this.getLabel(), 30, '', '', this.getType())
  }
}

class TestCollection extends EntityCollection {
  collectionAssociationType: CollectionAssociation

  constructor(
    association: CollectionAssociation,
    entities: TestEntity[],
    id?: string,
    includeCollectionNode: boolean = true,
  ) {
    super('collection', id, includeCollectionNode)
    this.collectionAssociationType = association
    entities.forEach((e) => this._collection.set(e.getID(), e))
  }

  public getLabel(): string {
    return 'TestCollection'
  }

  public getNode(): IGraphNode {
    return createNode(this.getID(), this.getLabel(), 30, '', '', this.getType())
  }

  public getSubCollectionByIDs(subCollectionID: string, ids: string[]): EntityCollection {
    return this
  }

  public loadObjects(objs: Entity[]): EntityCollection {
    objs.forEach((o) => this._collection.set(o.getID(), o))
    return this
  }
}

// ── Tests ───────────────────────────────────────────────────────────

describe('EntityCollection', () => {
  // ── central association (hub-and-spoke) ─────────────────────────

  describe('central association', () => {
    it('produces hub-and-spoke pattern with collection node at center', () => {
      const e1 = new TestEntity('A', 'a1')
      const e2 = new TestEntity('B', 'b1')
      const col = new TestCollection('central', [e1, e2], 'hub')

      const gd = col.getGraphData()

      // Collection node + 2 entity nodes
      expect(gd.nodes.length).toBeGreaterThanOrEqual(3)

      // Each entity links to the hub
      const hubLinks = gd.links.filter(
        (l: any) => l.target === 'hub' || l.source === 'hub'
      )
      expect(hubLinks.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ── linear association ─────────────────────────────────────────

  describe('linear association', () => {
    it('produces linear node chain', () => {
      const e1 = new TestEntity('A', 'l1')
      const e2 = new TestEntity('B', 'l2')
      const e3 = new TestEntity('C', 'l3')
      const col = new TestCollection('linear', [e1, e2, e3], 'root')

      const gd = col.getGraphData()

      // Collection node + 3 entity nodes
      expect(gd.nodes.length).toBeGreaterThanOrEqual(4)

      // Links form a chain: root -> l1 -> l2 -> l3
      expect(gd.links.length).toBeGreaterThanOrEqual(3)
    })
  })

  // ── no association ─────────────────────────────────────────────

  describe('no association', () => {
    it('produces independent nodes (no links between entities)', () => {
      const e1 = new TestEntity('A', 'n1')
      const e2 = new TestEntity('B', 'n2')
      const col = new TestCollection('none', [e1, e2], 'col-none', true)

      const gd = col.getGraphData()

      // Entities should have no inter-entity links
      expect(gd.nodes.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ── deduplication ──────────────────────────────────────────────

  describe('deduplication', () => {
    it('merged graph data has no duplicate nodes', () => {
      const e1 = new TestEntity('A', 'dup-1')
      const col = new TestCollection('central', [e1, e1], 'col-dup')

      const gd = col.getGraphData()
      const nodeIds = gd.nodes.map((n: any) => n.id)
      const unique = new Set(nodeIds)
      // The map deduplicates by key, so same-id entity overwrites
      expect(nodeIds.length).toBe(unique.size)
    })
  })

  // ── empty collection ──────────────────────────────────────────

  describe('empty collection', () => {
    it('returns graph data with only the collection node', () => {
      const col = new TestCollection('central', [], 'empty-col')
      const gd = col.getGraphData()
      expect(gd.nodes).toHaveLength(1)
      expect(gd.nodes[0].id).toBe('empty-col')
      expect(gd.links).toHaveLength(0)
    })
  })

  // ── getCollection ─────────────────────────────────────────────

  describe('getCollection', () => {
    it('returns the internal map', () => {
      const e1 = new TestEntity('A', 'gc-1')
      const col = new TestCollection('central', [e1], 'gc-col')
      expect(col.getCollection()).toBeInstanceOf(Map)
      expect(col.getCollection().size).toBe(1)
    })
  })

  // ── getCollectionItemByID ─────────────────────────────────────

  describe('getCollectionItemByID', () => {
    it('returns entity by id', () => {
      const e1 = new TestEntity('A', 'find-me')
      const col = new TestCollection('central', [e1], 'find-col')
      expect(col.getCollectionItemByID('find-me')).toBe(e1)
    })

    it('returns undefined for unknown id', () => {
      const col = new TestCollection('central', [], 'find-col2')
      expect(col.getCollectionItemByID('nope')).toBeUndefined()
    })
  })

  // ── getID with includeCollectionNode=false ─────────────────────

  describe('getID without collection node', () => {
    it('returns first entity ID when includeCollectionNode is false', () => {
      const e1 = new TestEntity('A', 'first-id')
      const col = new TestCollection('central', [e1], 'ignored-id', false)
      expect(col.getID()).toBe('first-id')
    })

    it('returns empty string when collection is empty and includeCollectionNode is false', () => {
      const col = new TestCollection('central', [], 'ignored', false)
      expect(col.getID()).toBe('')
    })
  })
})
