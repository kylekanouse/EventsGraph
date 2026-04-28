import { describe, it, expect } from 'vitest'
import {
  createNode,
  createLink,
  mergeGraphData,
  removeDuplicatesFromGraphData,
  safeText,
  addNewLinesToWords,
  normalize,
  buildResponse,
  createGraphDataObject,
  createLabelValue,
  createEventData,
  createEventsObject,
  formatNumber,
  formatLabel,
  getSeperator,
  isStreamable,
  transform,
  buildProgressResponse,
} from '../Utils'
import IEventsGraphCollectionContextRequest from '../../domain/IEventsGraphCollectionContextRequest'

// ── createNode ──────────────────────────────────────────────────────

describe('createNode', () => {
  it('produces a valid IGraphNode with all fields', () => {
    const node = createNode('id-1', 'Test Label', 10, 'A description', 'icon.png', 'person', 1, 'https://example.com')
    expect(node).toHaveProperty('id', 'id-1')
    expect(node).toHaveProperty('val', 10)
    expect(node).toHaveProperty('type', 'person')
    expect(node).toHaveProperty('url', 'https://example.com')
    expect(node).toHaveProperty('icon', 'icon.png')
    expect(node.group).toBe(1)
  })

  it('applies default values when optional args are omitted', () => {
    const node = createNode('id-2')
    expect(node.id).toBe('id-2')
    expect(node.val).toBe(30) // DEFAULT_NODE_VALUE
    expect(node.desc).toBe('')
    expect(node.icon).toBe('')
    expect(node.type).toBe('')
    expect(node.url).toBe('')
  })

  it('sanitises the label via safeText', () => {
    const node = createNode('id-3', 'Hello <script>alert(1)</script>')
    expect(node.label).not.toContain('<script>')
  })
})

// ── createLink ──────────────────────────────────────────────────────

describe('createLink', () => {
  it('produces a valid IGraphLink', () => {
    const link = createLink('src-1', 'tgt-1', 'relates', 5, 'association')
    expect(link.source).toBe('src-1')
    expect(link.target).toBe('tgt-1')
    expect(link.val).toBe(5)
    expect(link.type).toBe('association')
  })

  it('sanitises the label', () => {
    const link = createLink('s', 't', 'bad<char>')
    expect(link.label).not.toContain('<')
  })

  it('handles missing optional parameters', () => {
    const link = createLink('s', 't')
    expect(link.source).toBe('s')
    expect(link.target).toBe('t')
    expect(link.label).toBe('')
    expect(link.val).toBeUndefined()
    expect(link.type).toBeUndefined()
  })
})

// ── mergeGraphData ──────────────────────────────────────────────────

describe('mergeGraphData', () => {
  it('combines nodes and links from two graph data objects', () => {
    const gd1 = createGraphDataObject(
      [createNode('n1', 'Node 1')],
      [createLink('n1', 'n2')]
    )
    const gd2 = createGraphDataObject(
      [createNode('n2', 'Node 2')],
      [createLink('n2', 'n3')]
    )
    const merged = mergeGraphData(gd1, gd2)
    expect(merged.nodes).toHaveLength(2)
    expect(merged.links).toHaveLength(2)
  })

  it('handles empty graph data', () => {
    const gd1 = createGraphDataObject()
    const gd2 = createGraphDataObject([createNode('n1')])
    const merged = mergeGraphData(gd1, gd2)
    expect(merged.nodes).toHaveLength(1)
    expect(merged.links).toHaveLength(0)
  })
})

// ── removeDuplicatesFromGraphData ───────────────────────────────────

describe('removeDuplicatesFromGraphData', () => {
  it('deduplicates nodes by id', () => {
    const data = createGraphDataObject(
      [createNode('dup', 'A'), createNode('dup', 'B'), createNode('unique', 'C')],
      []
    )
    const result = removeDuplicatesFromGraphData(data)
    expect(result.nodes).toHaveLength(2)
    expect(result.nodes[0].id).toBe('dup')
    expect(result.nodes[1].id).toBe('unique')
  })

  it('deduplicates links by source+target', () => {
    const data = createGraphDataObject(
      [],
      [
        createLink('a', 'b'),
        createLink('a', 'b'),
        createLink('a', 'c'),
      ]
    )
    const result = removeDuplicatesFromGraphData(data)
    expect(result.links).toHaveLength(2)
  })

  it('returns empty arrays when given empty graph data', () => {
    const data = createGraphDataObject()
    const result = removeDuplicatesFromGraphData(data)
    expect(result.nodes).toHaveLength(0)
    expect(result.links).toHaveLength(0)
  })
})

// ── safeText ────────────────────────────────────────────────────────

describe('safeText', () => {
  it('strips unsafe characters', () => {
    const result = safeText('Hello <world> & "friends"')
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
    expect(result).not.toContain('&')
    expect(result).not.toContain('"')
  })

  it('preserves alphanumeric characters and spaces', () => {
    const result = safeText('Hello World 123')
    expect(result).toBe('Hello World 123')
  })

  it('collapses multiple spaces to one', () => {
    const result = safeText('Hello   World')
    expect(result).toBe('Hello World')
  })
})

// ── addNewLinesToWords ──────────────────────────────────────────────

describe('addNewLinesToWords', () => {
  it('returns text unchanged when word count is at or below limit', () => {
    const text = 'one two three'
    expect(addNewLinesToWords(text, 5)).toBe(text)
  })

  it('inserts newlines when word count exceeds limit', () => {
    const text = 'one two three four five six'
    const result = addNewLinesToWords(text, 3)
    expect(result).toContain('\n')
  })

  it('handles single-word text', () => {
    expect(addNewLinesToWords('hello', 3)).toBe('hello')
  })
})

// ── normalize ───────────────────────────────────────────────────────

describe('normalize', () => {
  it('scales value to 0-1 range', () => {
    expect(normalize(50, 100, 0)).toBe(0.5)
    expect(normalize(0, 100, 0)).toBe(0)
    expect(normalize(100, 100, 0)).toBe(1)
  })

  it('clamps values below min to 0', () => {
    expect(normalize(-10, 100, 0)).toBe(0)
  })

  it('clamps values above max to 1', () => {
    expect(normalize(200, 100, 0)).toBe(1)
  })

  it('handles equal min and max gracefully', () => {
    // Division by zero case — produces NaN
    const result = normalize(5, 5, 5)
    expect(result).toBeNaN()
  })
})

// ── buildResponse ───────────────────────────────────────────────────

describe('buildResponse', () => {
  const request: IEventsGraphCollectionContextRequest = {
    collection: 'test-collection',
    context: 'test-context',
    isStream: false,
    params: {},
  }

  it('creates a valid response envelope', () => {
    const graphData = createGraphDataObject()
    const response = buildResponse(request, graphData)
    expect(response.collection).toBe('test-collection')
    expect(response.context).toBe('test-context')
    expect(response.meta).toBeDefined()
    expect(response.meta.status).toBe('completed')
    expect(response.meta.progress).toBe(1)
    expect(response.meta.timeSent).toBeDefined()
    expect(response.id).toBeDefined()
  })

  it('uses provided id when given', () => {
    const response = buildResponse(request, undefined, undefined, undefined, 'custom-id')
    expect(response.id).toBe('custom-id')
  })

  it('handles empty request fields gracefully', () => {
    const emptyRequest = { collection: '', context: '', isStream: false, params: {} } as IEventsGraphCollectionContextRequest
    const response = buildResponse(emptyRequest)
    expect(response.collection).toBe('')
    expect(response.context).toBe('')
  })
})

// ── buildProgressResponse ───────────────────────────────────────────

describe('buildProgressResponse', () => {
  const request: IEventsGraphCollectionContextRequest = {
    collection: 'col',
    context: 'ctx',
    isStream: false,
    params: {},
  }

  it('creates a pending response when progress < 1', () => {
    const response = buildProgressResponse(0.5, request)
    expect(response.meta.status).toBe('pending')
    expect(response.meta.progress).toBe(0.5)
  })

  it('creates a completed response when progress is 1', () => {
    const response = buildProgressResponse(1, request)
    expect(response.meta.status).toBe('completed')
    expect(response.meta.progress).toBe(1)
  })
})

// ── createGraphDataObject ───────────────────────────────────────────

describe('createGraphDataObject', () => {
  it('creates empty graph data by default', () => {
    const gd = createGraphDataObject()
    expect(gd.nodes).toEqual([])
    expect(gd.links).toEqual([])
  })
})

// ── createEventData ─────────────────────────────────────────────────

describe('createEventData', () => {
  it('creates empty event data with defaults', () => {
    const e = createEventData()
    expect(e.category).toBe('')
    expect(e.action).toBe('')
    expect(e.label).toBe('')
    expect(e.val).toBe(0)
  })

  it('populates fields from arguments', () => {
    const e = createEventData('id-1', 'cat', 'act', 'lbl', 42, 'typ', 'src', 'tgt')
    expect(e.id).toBe('id-1')
    expect(e.category).toBe('cat')
    expect(e.action).toBe('act')
    expect(e.label).toBe('lbl')
    expect(e.val).toBe(42)
    expect(e.type).toBe('typ')
    expect(e.source).toBe('src')
    expect(e.target).toBe('tgt')
  })
})

// ── createEventsObject ──────────────────────────────────────────────

describe('createEventsObject', () => {
  it('creates empty events array by default', () => {
    const eo = createEventsObject()
    expect(eo.events).toEqual([])
  })
})

// ── formatNumber ────────────────────────────────────────────────────

describe('formatNumber', () => {
  it('formats a number with locale separators', () => {
    const result = formatNumber(1000)
    // Intl formatting varies by locale; just ensure it returns a string
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

// ── formatLabel ─────────────────────────────────────────────────────

describe('formatLabel', () => {
  it('replaces a standalone underscore with space', () => {
    // The regex \b(?:_)\b matches _ when it stands alone between non-word chars
    expect(formatLabel('hello _ world')).toBe('hello   world')
  })

  it('does not replace underscores between word characters', () => {
    // _ between two word chars is not at a word boundary
    expect(formatLabel('hello_world')).toBe('hello_world')
  })
})

// ── getSeperator ────────────────────────────────────────────────────

describe('getSeperator', () => {
  it('returns the separator string', () => {
    const sep = getSeperator()
    expect(typeof sep).toBe('string')
    expect(sep.length).toBeGreaterThan(0)
  })
})

// ── isStreamable ────────────────────────────────────────────────────

describe('isStreamable', () => {
  it('returns true when object has getDataStream method', () => {
    const obj = { getDataStream: () => {} }
    expect(isStreamable(obj)).toBe(true)
  })

  it('returns false when object lacks getDataStream', () => {
    const obj = { getData: () => {} }
    expect(isStreamable(obj)).toBe(false)
  })
})

// ── transform ───────────────────────────────────────────────────────

describe('transform', () => {
  it('truncates text exceeding word limit with trail', () => {
    const result = transform('one two three four five', 3)
    expect(result).toBe('one two three...')
  })

  it('returns original text when within limit', () => {
    const result = transform('one two', 5)
    expect(result).toBe('one two')
  })

  it('returns empty string for empty input', () => {
    expect(transform('', 5)).toBe('')
  })
})

// ── createLabelValue ────────────────────────────────────────────────

describe('createLabelValue', () => {
  it('returns sanitised label', () => {
    const result = createLabelValue('Hello <World>')
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
  })
})
