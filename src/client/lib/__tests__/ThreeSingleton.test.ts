import { describe, it, expect } from 'vitest'
import { Sprite, Scene, Camera, Raycaster, Mesh, REVISION } from 'three'

describe('Three.js Singleton', () => {
  it('should export core classes', () => {
    expect(Sprite).toBeDefined()
    expect(Scene).toBeDefined()
    expect(Camera).toBeDefined()
    expect(Raycaster).toBeDefined()
    expect(Mesh).toBeDefined()
  })

  it('should have a consistent revision', () => {
    // super-three / three should report revision >= 170
    expect(parseInt(REVISION)).toBeGreaterThanOrEqual(170)
  })
})
