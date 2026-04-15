// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock InteractionModeManager before importing NodeInteractionManager
let mockMode: InteractionMode = 'scene-focus'
vi.mock('../InteractionModeManager', () => ({
  default: {
    get mode() { return mockMode },
  }
}))

// Hoist mock fns so they're accessible inside vi.mock factory
const { mockIntersectObject, mockSetFromCamera } = vi.hoisted(() => ({
  mockIntersectObject: vi.fn().mockReturnValue([]),
  mockSetFromCamera: vi.fn(),
}))

// Mock Raycaster at the three module level
vi.mock('three', () => {
  function MockRaycaster(this: any) {
    this.intersectObject = mockIntersectObject
    this.setFromCamera = mockSetFromCamera
    this.camera = null
  }
  function MockVector2(this: any) {
    this.x = 0
    this.y = 0
  }
  function MockCamera() {}
  return {
    Raycaster: MockRaycaster,
    Vector2: MockVector2,
    Camera: MockCamera,
    Intersection: {},
  }
})

// Mock Cursor
vi.mock('../Cursor', () => {
  function MockCursor(this: any) {
    this.activate = vi.fn()
    this.deactivate = vi.fn()
  }
  return { default: MockCursor }
})

// Mock observers
vi.mock('../observers/EntitiesOnStageObserved', () => ({
  default: {
    objs: new Set(),
    entitiesOnStage: new Map(),
  }
}))

vi.mock('../observers/NodeClickedObserved', () => ({
  default: {
    onUpdate: vi.fn(),
  }
}))

vi.mock('../observers/VRControlsOnStageObserved', () => ({
  default: {
    objsOnStage: new Set(),
  }
}))

import NodeInteractionManager from '../NodeInteractionManager'
import EntitiesOnStageObserved from '../observers/EntitiesOnStageObserved'

describe('NodeInteractionManager — Mode-Gated Behavior', () => {
  let nim: NodeInteractionManager
  const mockCamera = {} as any

  beforeEach(() => {
    mockMode = 'scene-focus'
    mockIntersectObject.mockClear()
    mockSetFromCamera.mockClear()
    nim = new NodeInteractionManager(() => mockCamera)
    nim.init(vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('update()', () => {
    it('does not run raycasting in HUD mode', () => {
      // Provide objects so raycasting would normally run
      const mockObj = { userData: {}, parent: {} }
      ;(EntitiesOnStageObserved.objs as any) = new Set([mockObj])

      mockMode = 'hud'
      nim.update()

      expect(mockSetFromCamera).not.toHaveBeenCalled()
    })

    it('runs raycasting in scene-focus mode', () => {
      const mockObj = { userData: {}, parent: {} }
      ;(EntitiesOnStageObserved.objs as any) = new Set([mockObj])

      mockMode = 'scene-focus'
      nim.update()

      expect(mockSetFromCamera).toHaveBeenCalled()
    })
  })

  describe('_onClick()', () => {
    it('is no-op in HUD mode', () => {
      const mockNode = { onClick: vi.fn(), onHover: vi.fn().mockReturnThis() }
      nim.currentNode = mockNode as any

      mockMode = 'hud'
      const clickEvent = new MouseEvent('click', { bubbles: true })
      document.dispatchEvent(clickEvent)

      expect(mockNode.onClick).not.toHaveBeenCalled()
    })

    it('fires in scene-focus mode', () => {
      const mockNode = { onClick: vi.fn(), onHover: vi.fn().mockReturnThis() }
      nim.currentNode = mockNode as any

      mockMode = 'scene-focus'
      const clickEvent = new MouseEvent('click', { bubbles: true })
      document.dispatchEvent(clickEvent)

      expect(mockNode.onClick).toHaveBeenCalled()
    })
  })
})
