/**
 * FocusManager
 *
 * Ensures document.activeElement returns to document.body after HUD interactions,
 * which is required for A-Frame's shouldCaptureKeyEvent to permit WASD navigation.
 */

import InteractionModeManager from './InteractionModeManager'

declare const AFRAME: any

export default class FocusManager {

  /**
   * restoreSceneFocus
   *
   * Blurs the current active element and returns focus to document.body.
   * Uses requestAnimationFrame to run after MUI's async focus restoration.
   */
  static restoreSceneFocus(): void {
    if (InteractionModeManager.mode !== 'scene-focus') { return }

    if (document.activeElement && document.activeElement !== document.body) {
      (document.activeElement as HTMLElement).blur()
    }

    requestAnimationFrame(() => {
      if (document.activeElement && document.activeElement !== document.body) {
        (document.activeElement as HTMLElement).blur()
      }
      document.body.focus()
    })

    // Backup: catch any MUI async focus restoration that fires after rAF
    setTimeout(() => {
      if (document.activeElement && document.activeElement !== document.body) {
        (document.activeElement as HTMLElement).blur()
        document.body.focus()
      }
    }, 50)
  }

  /**
   * attachGlobalFocusGuard
   *
   * Installs a global focusin listener that monitors when focus lands on
   * HUD elements and schedules a focus restore if the scene should be active.
   */
  static attachGlobalFocusGuard(): void {
    document.addEventListener('focusin', (event: FocusEvent) => {
      const target = event.target as HTMLElement
      if (!target) return

      const insideHud = target.closest('#hud') !== null
      const modalOpen = document.querySelector('.MuiModal-root') !== null

      // Only auto-restore focus in scene-focus mode
      if (insideHud && !modalOpen && InteractionModeManager.mode === 'scene-focus') {
        setTimeout(() => {
          const active = document.activeElement as HTMLElement
          if (active && active.closest('#hud') && !document.querySelector('.MuiModal-root')) {
            active.blur()
            document.body.focus()
          }
        }, 100)
      }

      // Staggered check — also gated by mode
      if (insideHud && InteractionModeManager.mode === 'scene-focus') {
        setTimeout(() => {
          const active = document.activeElement as HTMLElement
          if (active && active.closest('#hud') && !document.querySelector('.MuiModal-root')) {
            active.blur()
            document.body.focus()
          }
        }, 350)
      }
    })
  }

  /**
   * patchAFrameKeyCapture
   *
   * Overrides A-Frame's shouldCaptureKeyEvent to use a permissive check.
   * Instead of requiring document.activeElement === document.body (which fails
   * when MUI async focus management leaves focus on HUD elements), this check
   * blocks WASD only when the user is in a form field or a modal is open.
   */
  static patchAFrameKeyCapture(): void {
    const WASD_KEYS = new Set([
      'KeyW', 'KeyA', 'KeyS', 'KeyD',
      'ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'
    ])

    // Install a capture-phase keydown listener that runs BEFORE A-Frame's
    // bubble-phase listener. A-Frame's wasd-controls captures shouldCaptureKeyEvent
    // as a closure variable at module load time, so patching AFRAME.utils has no
    // effect. Instead, we ensure document.activeElement === document.body BEFORE
    // A-Frame's onKeyDown fires, so shouldCaptureKeyEvent returns true.
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.metaKey) return
      if (!WASD_KEYS.has(e.code)) return

      const active = document.activeElement as HTMLElement
      if (!active || active === document.body) return

      // Don't interfere with actual form input
      const tag = active.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      // Don't interfere when a modal is open (user is in a dropdown/dialog)
      if (document.querySelector('.MuiModal-root')) return

      // Blur the HUD element so A-Frame sees document.body as activeElement
      active.blur()
      document.body.focus()
    }, true) // true = capture phase, runs before bubble-phase listeners
  }

}
