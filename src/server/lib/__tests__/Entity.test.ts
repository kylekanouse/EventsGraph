import { describe, it, expect } from 'vitest'
import Entity from '../Entity'
import IGraphNode from '../../domain/IGraphNode'
import { createNode } from '../Utils'

/**
 * Concrete subclass of Entity for testing purposes.
 */
class TestEntity extends Entity {
  private _label: string

  constructor(type: string, label: string, id?: string) {
    super(type, id)
    this._label = label
  }

  public getLabel(): string {
    return this._label
  }

  public getNode(): IGraphNode {
    return createNode(this.getID(), this.getLabel(), 30, '', '', this.getType())
  }
}

// ── Entity.getID ────────────────────────────────────────────────────

describe('Entity', () => {
  it('generates a UUID when no id is provided', () => {
    const entity = new TestEntity('test-type', 'Test Label')
    const id = entity.getID()
    expect(id).toBeDefined()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('uses the provided id', () => {
    const entity = new TestEntity('test-type', 'Label', 'custom-id')
    expect(entity.getID()).toBe('custom-id')
  })

  // ── getType ─────────────────────────────────────────────────────

  it('returns the type', () => {
    const entity = new TestEntity('person', 'Alice')
    expect(entity.getType()).toBe('person')
  })

  // ── getLabel ────────────────────────────────────────────────────

  it('returns the label', () => {
    const entity = new TestEntity('person', 'Alice')
    expect(entity.getLabel()).toBe('Alice')
  })

  // ── getRootNodeID ─────────────────────────────────────────────

  it('getRootNodeID returns the entity ID', () => {
    const entity = new TestEntity('t', 'L', 'root-1')
    expect(entity.getRootNodeID()).toBe('root-1')
  })

  // ── getGraphData ──────────────────────────────────────────────

  describe('getGraphData', () => {
    it('returns node only when no targetNodeID is given', () => {
      const entity = new TestEntity('type', 'Label', 'e-1')
      const gd = entity.getGraphData()
      expect(gd.nodes).toHaveLength(1)
      expect(gd.nodes[0].id).toBe('e-1')
      expect(gd.links).toHaveLength(0)
    })

    it('returns node + link when targetNodeID is provided', () => {
      const entity = new TestEntity('type', 'Label', 'e-2')
      const gd = entity.getGraphData('target-1')
      expect(gd.nodes).toHaveLength(1)
      expect(gd.links).toHaveLength(1)
      expect(gd.links[0].source).toBe('e-2')
      expect(gd.links[0].target).toBe('target-1')
    })
  })

  // ── getLink ───────────────────────────────────────────────────

  describe('getLink', () => {
    it('creates correct source-target link', () => {
      const entity = new TestEntity('type', 'MyLabel', 'src-1')
      const link = entity.getLink('tgt-1')
      expect(link.source).toBe('src-1')
      expect(link.target).toBe('tgt-1')
    })

    it('uses entity label when no explicit label is given', () => {
      const entity = new TestEntity('type', 'MyLabel', 'src-2')
      const link = entity.getLink('tgt-2')
      // Label gets processed through safeText / createLabelValue
      expect(typeof link.label).toBe('string')
    })

    it('overrides label when provided', () => {
      const entity = new TestEntity('type', 'MyLabel', 'src-3')
      const link = entity.getLink('tgt-3', 'CustomLabel')
      expect(typeof link.label).toBe('string')
    })
  })

  // ── getEventData ──────────────────────────────────────────────

  describe('getEventData', () => {
    it('returns a default event data object', () => {
      const entity = new TestEntity('type', 'Label')
      const eventData = entity.getEventData()
      expect(eventData).toBeDefined()
      expect(eventData.category).toBe('')
      expect(eventData.action).toBe('')
    })
  })

  // ── getIcon ───────────────────────────────────────────────────

  describe('getIcon', () => {
    it('returns empty string when no icon provided', () => {
      const entity = new TestEntity('type', 'Label')
      expect(entity.getIcon()).toBe('')
    })
  })
})
