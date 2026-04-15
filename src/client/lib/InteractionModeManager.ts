import { debounce } from './Utils'

export default class InteractionModeManager {
  private static _mode: InteractionMode = 'scene-focus'
  private static _rootElement: HTMLElement | null = null
  private static _listeners: Set<(mode: InteractionMode) => void> = new Set()
  private static _debouncedToggle: Function = debounce(() => {
    InteractionModeManager.toggle()
  }, 200)

  static get mode(): InteractionMode {
    return InteractionModeManager._mode
  }

  static init(rootElement: HTMLElement): void {
    InteractionModeManager._mode = 'scene-focus'
    InteractionModeManager._rootElement = rootElement
    InteractionModeManager._listeners = new Set()
    InteractionModeManager._setDataAttribute()
    InteractionModeManager._bindEscapeKey()
    InteractionModeManager._bindCanvasMouseDown()
    InteractionModeManager._bindPointerLockChange()

    // Reset to Scene Focus when exiting VR
    const scene = document.querySelector('a-scene')
    if (scene) {
      scene.addEventListener('exit-vr', () => {
        InteractionModeManager.enterSceneFocus()
      })
    }
  }

  static enterSceneFocus(): void {
    if (InteractionModeManager._isVRActive()) { return }
    if (InteractionModeManager._mode === 'scene-focus') return
    InteractionModeManager._mode = 'scene-focus'
    InteractionModeManager._applyMode()
  }

  static enterHudMode(): void {
    if (InteractionModeManager._isVRActive()) { return }
    if (InteractionModeManager._mode === 'hud') return
    InteractionModeManager._mode = 'hud'
    InteractionModeManager._applyMode()
  }

  static toggle(): void {
    if (InteractionModeManager._isVRActive()) { return }
    if (InteractionModeManager._mode === 'scene-focus') {
      InteractionModeManager.enterHudMode()
    } else {
      InteractionModeManager.enterSceneFocus()
    }
  }

  static onModeChange(cb: (mode: InteractionMode) => void): void {
    InteractionModeManager._listeners.add(cb)
  }

  static offModeChange(cb: (mode: InteractionMode) => void): void {
    InteractionModeManager._listeners.delete(cb)
  }

  private static _applyMode(): void {
    InteractionModeManager._setDataAttribute()
    InteractionModeManager._toggleForceGraphCursor(InteractionModeManager._mode === 'hud')
    InteractionModeManager._listeners.forEach(cb => cb(InteractionModeManager._mode))

    // Exit pointer lock when entering HUD mode.
    // Entering scene-focus does NOT request pointer lock here — A-Frame's
    // look-controls (with pointerLockEnabled=true) will request it on the
    // next mousedown inside the canvas.
    if (InteractionModeManager._mode === 'hud' && document.pointerLockElement) {
      document.exitPointerLock()
    }
  }

  private static _setDataAttribute(): void {
    if (!InteractionModeManager._rootElement) return
    InteractionModeManager._rootElement.dataset.mode = InteractionModeManager._mode
  }

  /**
   * _bindPointerLockChange
   *
   * @description Listens for browser pointerlockchange events.
   *   When pointer lock is lost while in scene-focus (e.g. browser Escape handling),
   *   automatically transitions to HUD mode.
   * @private
   */
  private static _bindPointerLockChange(): void {
    document.addEventListener('pointerlockchange', () => {
      if (!document.pointerLockElement && InteractionModeManager._mode === 'scene-focus') {
        InteractionModeManager.enterHudMode()
      }
    })
  }

  /**
   * _bindEscapeKey
   *
   * @description Handles Escape when in scene-focus without pointer lock
   *   (e.g. initial page load before the user clicks the canvas).
   *   When pointer lock IS active, the browser itself exits pointer lock on
   *   Escape and the pointerlockchange handler transitions to HUD.
   *   Guards against: open MUI modals, active form fields.
   * @private
   */
  private static _bindEscapeKey(): void {
    document.addEventListener('keydown', (e: KeyboardEvent): void => {
      if (e.code !== 'Escape') { return }

      // Guard: do not toggle if a modal is open (Escape should close the modal instead)
      if (document.querySelector('.MuiModal-root')) { return }

      // Guard: do not toggle if user is typing in a form field
      const active = document.activeElement as HTMLElement
      if (active) {
        const tag = active.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') { return }
      }

      // Only act when in scene-focus without pointer lock.
      // With pointer lock active, the browser handles Escape by exiting
      // pointer lock and our pointerlockchange listener enters HUD mode.
      if (InteractionModeManager._mode === 'scene-focus' && !document.pointerLockElement) {
        InteractionModeManager.enterHudMode()
      }
    })
  }

  /**
   * _bindCanvasMouseDown
   *
   * @description Uses capture-phase mousedown so the mode switch (and
   *   look-controls re-enable) occurs BEFORE A-Frame's bubble-phase
   *   mousedown handler, which requests pointer lock when
   *   pointerLockEnabled is true. This single click both enters
   *   scene-focus AND acquires pointer lock.
   * @private
   */
  private static _bindCanvasMouseDown(): void {
    document.addEventListener('mousedown', (e: MouseEvent): void => {
      const target = e.target as HTMLElement
      if (!target) { return }

      const isCanvas = target.tagName === 'CANVAS' && target.closest('a-scene') !== null

      if (isCanvas && InteractionModeManager._mode === 'hud') {
        InteractionModeManager.enterSceneFocus()
      }
    }, true) // capture phase — runs before A-Frame's bubble-phase listener
  }

  /**
   * _isVRActive
   *
   * @description Checks if WebXR VR presentation is active
   * @returns {boolean}
   * @private
   */
  private static _isVRActive(): boolean {
    const scene = document.querySelector('a-scene') as any
    if (!scene || !scene.renderer) { return false }
    return scene.renderer.xr?.isPresenting === true
  }

  /**
   * _toggleForceGraphCursor
   *
   * @description Shows or hides the ForceGraphVR mouse cursor entity
   * @param {boolean} visible
   * @private
   */
  private static _toggleForceGraphCursor(visible: boolean): void {
    const mouseCursor = document.querySelector('a-scene [cursor]') as HTMLElement
    if (!mouseCursor) { return }

    // Avoid hiding the a-cursor we created (it has color="lavender")
    if (mouseCursor.getAttribute('color') === 'lavender') { return }

    mouseCursor.setAttribute('visible', String(visible))
  }
}
