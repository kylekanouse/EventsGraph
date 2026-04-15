// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

let mockMode: InteractionMode = 'scene-focus'
vi.mock('../InteractionModeManager', () => ({
  default: {
    get mode() { return mockMode },
  }
}))

import FocusManager from '../FocusManager'

describe('FocusManager', () => {
  beforeEach(() => {
    mockMode = 'scene-focus'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have restoreSceneFocus', () => {
    expect(typeof FocusManager.restoreSceneFocus).toBe('function')
  })

  it('should have attachGlobalFocusGuard', () => {
    expect(typeof FocusManager.attachGlobalFocusGuard).toBe('function')
  })

  it('should have patchAFrameKeyCapture', () => {
    expect(typeof FocusManager.patchAFrameKeyCapture).toBe('function')
  })

  it('should NOT have patchSpriteRaycast (removed in Phase 3)', () => {
    expect((FocusManager as any).patchSpriteRaycast).toBeUndefined()
  })

  it('should NOT have debug (removed in Phase 3)', () => {
    expect((FocusManager as any).debug).toBeUndefined()
  })

  // ---- Mode-Gated Behavior Tests ----

  describe('Mode-Gated Behavior', () => {
    it('restoreSceneFocus is no-op in HUD mode', () => {
      const btn = document.createElement('button')
      document.body.appendChild(btn)
      btn.focus()

      mockMode = 'hud'
      FocusManager.restoreSceneFocus()

      // Active element should remain on button (blur not triggered)
      expect(document.activeElement).toBe(btn)
      document.body.removeChild(btn)
    })

    it('restoreSceneFocus works in scene-focus mode', () => {
      const btn = document.createElement('button')
      document.body.appendChild(btn)
      btn.focus()
      expect(document.activeElement).toBe(btn)

      mockMode = 'scene-focus'
      FocusManager.restoreSceneFocus()

      // Immediate blur should run synchronously
      expect(document.activeElement).toBe(document.body)
      document.body.removeChild(btn)
    })

    it('focus guard does not auto-blur in HUD mode', () => {
      vi.useFakeTimers()

      const hud = document.createElement('div')
      hud.id = 'hud'
      const btn = document.createElement('button')
      hud.appendChild(btn)
      document.body.appendChild(hud)

      mockMode = 'hud'
      FocusManager.attachGlobalFocusGuard()

      btn.focus()
      const focusinEvent = new FocusEvent('focusin', { bubbles: true })
      btn.dispatchEvent(focusinEvent)

      vi.advanceTimersByTime(400)

      // Button should retain focus in HUD mode
      expect(document.activeElement).toBe(btn)

      document.body.removeChild(hud)
      vi.useRealTimers()
    })

    it('focus guard auto-blurs in scene-focus mode', () => {
      vi.useFakeTimers()

      const hud = document.createElement('div')
      hud.id = 'hud'
      const btn = document.createElement('button')
      hud.appendChild(btn)
      document.body.appendChild(hud)

      mockMode = 'scene-focus'
      FocusManager.attachGlobalFocusGuard()

      btn.focus()
      const focusinEvent = new FocusEvent('focusin', { bubbles: true })
      btn.dispatchEvent(focusinEvent)

      // Advance past the 100ms and 350ms setTimeout timers
      vi.advanceTimersByTime(400)

      // Focus should be returned to body
      expect(document.activeElement).toBe(document.body)

      document.body.removeChild(hud)
      vi.useRealTimers()
    })
  })
})
