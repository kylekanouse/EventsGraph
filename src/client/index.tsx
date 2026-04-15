import 'aframe'
import { Sprite } from 'three'

// Patch: super-three@0.173 Sprite.raycast crashes when raycaster.camera is null
// because A-Frame's cursor component never sets it. Make it bail out safely.
const _origSpriteRaycast = Sprite.prototype.raycast
Sprite.prototype.raycast = function (raycaster, intersects) {
  if (raycaster.camera === null) { return }
  _origSpriteRaycast.call(this, raycaster, intersects)
}

import * as React from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/app'
import { ErrorBoundary } from './components/ErrorBoundary'

/**
 * Main app DOM render
 */

const root = createRoot(document.getElementById('root')!)
root.render(
  <ErrorBoundary><App /></ErrorBoundary>
)
