import { describe, it, expect, vi } from 'vitest'

// Mock EventSound to avoid AudioLoader/PositionalAudio requiring WebGL context
vi.mock('../EventSound', () => {
  return {
    default: class MockEventSound {
      constructor() {}
      play() {}
    }
  }
})

import GraphEvent from '../GraphEvent'
import type { AudioListener } from 'three'

describe('GraphEvent', () => {
  it('target getter should return the target value without recursion', () => {
    const listener = {} as AudioListener
    const event = new GraphEvent(
      { source: 'node1', target: 'node2', action: 'test' },
      listener
    )
    expect(event.target).toBe('node2')
  })

  it('source getter should return the source value', () => {
    const listener = {} as AudioListener
    const event = new GraphEvent(
      { source: 'nodeA', target: 'nodeB', action: 'test' },
      listener
    )
    expect(event.source).toBe('nodeA')
  })
})
