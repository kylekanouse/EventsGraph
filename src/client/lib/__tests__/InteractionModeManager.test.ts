// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import InteractionModeManager from '../InteractionModeManager'

describe('InteractionModeManager', () => {
  let root: HTMLElement

  beforeEach(() => {
    root = document.createElement('div')
    root.className = 'events-graph-app'
    document.body.appendChild(root)

    // Stub pointer lock API on the document and canvas
    Object.defineProperty(document, 'pointerLockElement', {
      value: null,
      writable: true,
      configurable: true,
    })
    document.exitPointerLock = vi.fn(() => {
      ;(document as any).pointerLockElement = null
      document.dispatchEvent(new Event('pointerlockchange'))
    })

    InteractionModeManager.init(root)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    if (root.parentNode) {
      document.body.removeChild(root)
    }
  })

  // ---- State Transition Tests ----

  describe('State Transitions', () => {
    it('default mode is scene-focus', () => {
      expect(InteractionModeManager.mode).toBe('scene-focus')
    })

    it('init sets data-mode attribute', () => {
      expect(root.dataset.mode).toBe('scene-focus')
    })

    it('enterHudMode switches to hud', () => {
      InteractionModeManager.enterHudMode()
      expect(InteractionModeManager.mode).toBe('hud')
      expect(root.dataset.mode).toBe('hud')
    })

    it('enterSceneFocus switches back', () => {
      InteractionModeManager.enterHudMode()
      InteractionModeManager.enterSceneFocus()
      expect(InteractionModeManager.mode).toBe('scene-focus')
      expect(root.dataset.mode).toBe('scene-focus')
    })

    it('toggle from scene-focus to hud', () => {
      InteractionModeManager.toggle()
      expect(InteractionModeManager.mode).toBe('hud')
    })

    it('toggle from hud to scene-focus', () => {
      InteractionModeManager.enterHudMode()
      InteractionModeManager.toggle()
      expect(InteractionModeManager.mode).toBe('scene-focus')
    })

    it('double toggle returns to original', () => {
      InteractionModeManager.toggle()
      InteractionModeManager.toggle()
      expect(InteractionModeManager.mode).toBe('scene-focus')
    })
  })

  // ---- Idempotency Tests ----

  describe('Idempotency', () => {
    it('enterHudMode is idempotent', () => {
      const cb = vi.fn()
      InteractionModeManager.onModeChange(cb)
      InteractionModeManager.enterHudMode()
      InteractionModeManager.enterHudMode()
      expect(cb).toHaveBeenCalledTimes(1)
      InteractionModeManager.offModeChange(cb)
    })

    it('enterSceneFocus is idempotent', () => {
      const cb = vi.fn()
      InteractionModeManager.onModeChange(cb)
      InteractionModeManager.enterSceneFocus()
      expect(cb).not.toHaveBeenCalled()
      InteractionModeManager.offModeChange(cb)
    })
  })

  // ---- Listener Tests ----

  describe('Listeners', () => {
    it('onModeChange fires with correct mode', () => {
      const cb = vi.fn()
      InteractionModeManager.onModeChange(cb)
      InteractionModeManager.enterHudMode()
      expect(cb).toHaveBeenCalledWith('hud')
      InteractionModeManager.offModeChange(cb)
    })

    it('onModeChange fires on each transition', () => {
      const cb = vi.fn()
      InteractionModeManager.onModeChange(cb)
      InteractionModeManager.toggle()
      InteractionModeManager.toggle()
      expect(cb).toHaveBeenCalledTimes(2)
      expect(cb).toHaveBeenNthCalledWith(1, 'hud')
      expect(cb).toHaveBeenNthCalledWith(2, 'scene-focus')
      InteractionModeManager.offModeChange(cb)
    })

    it('offModeChange removes listener', () => {
      const cb = vi.fn()
      InteractionModeManager.onModeChange(cb)
      InteractionModeManager.offModeChange(cb)
      InteractionModeManager.toggle()
      expect(cb).not.toHaveBeenCalled()
    })

    it('multiple listeners all fire', () => {
      const cb1 = vi.fn()
      const cb2 = vi.fn()
      const cb3 = vi.fn()
      InteractionModeManager.onModeChange(cb1)
      InteractionModeManager.onModeChange(cb2)
      InteractionModeManager.onModeChange(cb3)
      InteractionModeManager.toggle()
      expect(cb1).toHaveBeenCalledTimes(1)
      expect(cb2).toHaveBeenCalledTimes(1)
      expect(cb3).toHaveBeenCalledTimes(1)
      InteractionModeManager.offModeChange(cb1)
      InteractionModeManager.offModeChange(cb2)
      InteractionModeManager.offModeChange(cb3)
    })
  })

  // ---- Edge Case Tests ----

  describe('Edge Cases', () => {
    it('graceful no-op without init', () => {
      ;(InteractionModeManager as any)._rootElement = null
      expect(() => InteractionModeManager.toggle()).not.toThrow()
      expect(InteractionModeManager.mode).toBe('hud')
    })

    it('Escape with modal open does not toggle', () => {
      const modal = document.createElement('div')
      modal.className = 'MuiModal-root'
      document.body.appendChild(modal)

      const event = new KeyboardEvent('keydown', { code: 'Escape', bubbles: true })
      document.dispatchEvent(event)

      expect(InteractionModeManager.mode).toBe('scene-focus')
      document.body.removeChild(modal)
    })

    it('Escape with INPUT focused does not toggle', () => {
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      const event = new KeyboardEvent('keydown', { code: 'Escape', bubbles: true })
      document.dispatchEvent(event)

      expect(InteractionModeManager.mode).toBe('scene-focus')
      document.body.removeChild(input)
    })

    it('Escape with TEXTAREA focused does not toggle', () => {
      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      textarea.focus()

      const event = new KeyboardEvent('keydown', { code: 'Escape', bubbles: true })
      document.dispatchEvent(event)

      expect(InteractionModeManager.mode).toBe('scene-focus')
      document.body.removeChild(textarea)
    })

    it('Escape with SELECT focused does not toggle', () => {
      const select = document.createElement('select')
      document.body.appendChild(select)
      select.focus()

      const event = new KeyboardEvent('keydown', { code: 'Escape', bubbles: true })
      document.dispatchEvent(event)

      expect(InteractionModeManager.mode).toBe('scene-focus')
      document.body.removeChild(select)
    })
  })

  // ---- Debounce Tests ----

  describe('Debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      // Flush any pending debounce timers so isActive resets before restoring real timers
      vi.advanceTimersByTime(300)
      vi.useRealTimers()
    })

    it('rapid toggles debounced at 200ms', () => {
      const debouncedToggle = (InteractionModeManager as any)._debouncedToggle

      // First call fires immediately (leading-edge debounce)
      debouncedToggle()
      expect(InteractionModeManager.mode).toBe('hud')

      // Subsequent calls within 200ms are no-ops
      debouncedToggle()
      debouncedToggle()
      debouncedToggle()
      debouncedToggle()
      expect(InteractionModeManager.mode).toBe('hud')
    })

    it('toggle fires again after debounce window', () => {
      const debouncedToggle = (InteractionModeManager as any)._debouncedToggle

      // Clear any lingering debounce state from prior tests
      vi.advanceTimersByTime(250)

      debouncedToggle()
      expect(InteractionModeManager.mode).toBe('hud')

      // Advance past the 200ms debounce window
      vi.advanceTimersByTime(250)

      debouncedToggle()
      expect(InteractionModeManager.mode).toBe('scene-focus')
    })
  })

  // ---- VR Bypass Tests ----

  describe('VR Bypass', () => {
    function mockVRActive(active: boolean): void {
      const scene = document.createElement('a-scene') as any
      scene.renderer = { xr: { isPresenting: active } }
      vi.spyOn(document, 'querySelector').mockImplementation((selector: string) => {
        if (selector === 'a-scene') return scene
        if (selector === 'a-scene [cursor]') return null
        return null
      })
    }

    it('toggle is no-op when VR active', () => {
      mockVRActive(true)
      InteractionModeManager.toggle()
      expect(InteractionModeManager.mode).toBe('scene-focus')
    })

    it('enterHudMode is no-op when VR active', () => {
      mockVRActive(true)
      InteractionModeManager.enterHudMode()
      expect(InteractionModeManager.mode).toBe('scene-focus')
    })

    it('enterSceneFocus is no-op when VR active', () => {
      // First switch to hud with VR inactive
      mockVRActive(false)
      InteractionModeManager.enterHudMode()
      expect(InteractionModeManager.mode).toBe('hud')

      // Now mock VR active
      mockVRActive(true)
      InteractionModeManager.enterSceneFocus()
      expect(InteractionModeManager.mode).toBe('hud')
    })
  })

  // ---- Pointer Lock & Canvas Engagement Tests ----

  describe('Pointer Lock', () => {
    let canvas: HTMLCanvasElement
    let scene: HTMLElement

    beforeEach(() => {
      scene = document.createElement('a-scene')
      canvas = document.createElement('canvas')
      scene.appendChild(canvas)
      document.body.appendChild(scene)
    })

    afterEach(() => {
      if (scene.parentNode) {
        document.body.removeChild(scene)
      }
    })

    it('exits pointer lock when entering HUD mode', () => {
      ;(document as any).pointerLockElement = canvas
      InteractionModeManager.enterHudMode()
      expect(document.exitPointerLock).toHaveBeenCalled()
    })

    it('does not call exitPointerLock when pointer lock is already released', () => {
      ;(document as any).pointerLockElement = null
      InteractionModeManager.enterHudMode()
      expect(document.exitPointerLock).not.toHaveBeenCalled()
    })

    it('transitions to HUD when pointer lock is lost externally', () => {
      ;(document as any).pointerLockElement = canvas

      // Simulate browser exiting pointer lock (e.g. user pressed Escape)
      ;(document as any).pointerLockElement = null
      document.dispatchEvent(new Event('pointerlockchange'))

      expect(InteractionModeManager.mode).toBe('hud')
    })

    it('canvas mousedown in HUD mode enters scene-focus', () => {
      InteractionModeManager.enterHudMode()

      // Simulate mousedown on canvas (capture phase listener)
      const mousedown = new MouseEvent('mousedown', { bubbles: true })
      Object.defineProperty(mousedown, 'target', { value: canvas })
      document.dispatchEvent(mousedown)

      expect(InteractionModeManager.mode).toBe('scene-focus')
    })

    it('canvas mousedown in scene-focus is a no-op', () => {
      const cb = vi.fn()
      InteractionModeManager.onModeChange(cb)

      const mousedown = new MouseEvent('mousedown', { bubbles: true })
      Object.defineProperty(mousedown, 'target', { value: canvas })
      document.dispatchEvent(mousedown)

      expect(cb).not.toHaveBeenCalled()
      InteractionModeManager.offModeChange(cb)
    })

    it('Escape in scene-focus without pointer lock enters HUD', () => {
      // scene-focus, no pointer lock
      ;(document as any).pointerLockElement = null

      const event = new KeyboardEvent('keydown', { code: 'Escape', bubbles: true })
      document.dispatchEvent(event)

      expect(InteractionModeManager.mode).toBe('hud')
    })

    it('Escape in scene-focus with pointer lock is no-op (browser handles)', () => {
      // scene-focus with pointer lock active
      ;(document as any).pointerLockElement = canvas

      const event = new KeyboardEvent('keydown', { code: 'Escape', bubbles: true })
      document.dispatchEvent(event)

      // Our handler is a no-op; browser would exit pointer lock and pointerlockchange fires
      expect(InteractionModeManager.mode).toBe('scene-focus')
    })

    it('Escape in HUD mode is a no-op', () => {
      InteractionModeManager.enterHudMode()

      const event = new KeyboardEvent('keydown', { code: 'Escape', bubbles: true })
      document.dispatchEvent(event)

      expect(InteractionModeManager.mode).toBe('hud')
    })

    it('entering scene-focus does not request pointer lock itself', () => {
      canvas.requestPointerLock = vi.fn()
      InteractionModeManager.enterHudMode()
      InteractionModeManager.enterSceneFocus()
      expect(canvas.requestPointerLock).not.toHaveBeenCalled()
    })
  })
})
