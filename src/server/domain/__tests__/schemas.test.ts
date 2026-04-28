import { describe, it, expect } from 'vitest'
import { GraphDataRequestSchema } from '../schemas'

describe('GraphDataRequestSchema', () => {

  // ── Valid requests ────────────────────────────────────────────

  it('passes with all required fields present', () => {
    const result = GraphDataRequestSchema.safeParse({
      collection: 'twitter',
      context: 'tweet-lookup',
      isStream: false,
      params: { query: 'hello' },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.collection).toBe('twitter')
      expect(result.data.context).toBe('tweet-lookup')
      expect(result.data.isStream).toBe(false)
      expect(result.data.params).toEqual({ query: 'hello' })
    }
  })

  it('applies defaults for optional fields', () => {
    const result = GraphDataRequestSchema.safeParse({
      collection: 'dummydata',
      context: 'dummydata-basic',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isStream).toBe(false)
      expect(result.data.params).toEqual({})
    }
  })

  // ── Missing collection field ──────────────────────────────────

  it('fails when collection is missing', () => {
    const result = GraphDataRequestSchema.safeParse({
      context: 'some-context',
    })
    expect(result.success).toBe(false)
  })

  // ── Empty string collection ───────────────────────────────────

  it('fails when collection is an empty string', () => {
    const result = GraphDataRequestSchema.safeParse({
      collection: '',
      context: 'some-context',
    })
    expect(result.success).toBe(false)
  })

  // ── Missing context ───────────────────────────────────────────

  it('fails when context is missing', () => {
    const result = GraphDataRequestSchema.safeParse({
      collection: 'twitter',
    })
    expect(result.success).toBe(false)
  })

  // ── Invalid isStream type ─────────────────────────────────────

  it('fails when isStream is not a boolean', () => {
    const result = GraphDataRequestSchema.safeParse({
      collection: 'twitter',
      context: 'tweet-lookup',
      isStream: 'yes',
    })
    expect(result.success).toBe(false)
  })

  // ── Collection max length ───────────────────────────────────

  it('fails when collection exceeds max length', () => {
    const result = GraphDataRequestSchema.safeParse({
      collection: 'a'.repeat(101),
      context: 'ctx',
    })
    expect(result.success).toBe(false)
  })

  // ── Context max length ────────────────────────────────────────

  it('fails when context exceeds max length', () => {
    const result = GraphDataRequestSchema.safeParse({
      collection: 'twitter',
      context: 'b'.repeat(101),
    })
    expect(result.success).toBe(false)
  })

  // ── Invalid params type ───────────────────────────────────────

  it('fails when params is not an object', () => {
    const result = GraphDataRequestSchema.safeParse({
      collection: 'twitter',
      context: 'tweet-lookup',
      params: 'not-an-object',
    })
    expect(result.success).toBe(false)
  })

  // ── Null collection ───────────────────────────────────────────

  it('fails when collection is null', () => {
    const result = GraphDataRequestSchema.safeParse({
      collection: null,
      context: 'ctx',
    })
    expect(result.success).toBe(false)
  })

  // ── Number as collection ──────────────────────────────────────

  it('fails when collection is a number', () => {
    const result = GraphDataRequestSchema.safeParse({
      collection: 123,
      context: 'ctx',
    })
    expect(result.success).toBe(false)
  })
})
