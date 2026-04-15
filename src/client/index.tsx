import 'aframe'
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
