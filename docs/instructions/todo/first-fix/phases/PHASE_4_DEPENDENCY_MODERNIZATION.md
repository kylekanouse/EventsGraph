# Phase 4 — Dependency Modernization

**Parent Document:** [SOLUTIONS_ARCHITECTURE.md](../SOLUTIONS_ARCHITECTURE.md)  
**Companion Document:** [CODEBASE_ANALYSIS.md](../CODEBASE_ANALYSIS.md)  
**Prerequisite:** [Phase 3 — Test Infrastructure](./PHASE_3_TEST_INFRASTRUCTURE.md) completed and verified.  
**Objective:** Upgrade major dependencies. This is the highest-risk phase — do one group at a time with verification between each.

---

## Guiding Principles (Apply to All Phases)

1. **No regressions.** Every phase ends with a working server + client. Validate with runtime tests before proceeding.
2. **Incremental delivery.** Each phase is independently committable and deployable.
3. **Minimal blast radius.** Group related changes; avoid mixing build changes with logic changes.
4. **Preserve architecture strengths.** The Oracle pattern, Entity system, and streaming model are well-designed. Modernize tooling around them, not through them.
5. **One problem at a time.** Do not combine dependency upgrades with refactors. Upgrade first, refactor second.

---

## Prerequisites

- Phase 3 completed (Vitest running, foundational tests passing, strict mode enabled)
- All existing tests pass before starting each sub-task

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Three.js upgrade breaks rendering | High | High | Upgrade Three.js and 3d-force-graph-vr together. Test with DummyData oracle first. |
| Twitter API no longer works | High | Medium | Isolate Twitter oracle. Test separately. Have fallback plan to disable. |
| Webpack → Vite migration breaks HMR | Medium | Medium | Migrate config incrementally. Verify DefinePlugin → import.meta.env migration. |
| React 17 → 18 breaks observers | Low | Medium | Observer pattern is decoupled from React lifecycle. Low risk. |
| `@uboot/uboot` unavailable | Medium | High | Package is small. Fork or inline if needed. |

---

## Tasks

### 4.1 Upgrade Socket.IO (Low Risk)

```bash
npm install socket.io@^4.8.0 socket.io-client@^4.8.0
```

API is backward-compatible within 4.x. Verify websocket connections work.

**Verify:** Start server, open client, confirm socket events fire and streaming works.

### 4.2 Upgrade TypeScript (Low Risk)

```bash
npm install --save-dev typescript@^5.7.0
npm uninstall @tsconfig/node12
```

Update both tsconfig files:
- Remove `extends: "@tsconfig/node12/tsconfig.json"`
- Set `target: "ES2022"` (or `"ES2020"` for broader compat)
- Set `module: "commonjs"` (server) / keep existing (client)
- Add `moduleResolution: "node"`

Rebuild and fix any new strict errors.

**Verify:** `npx tsc -p tsconfig.server.json` and `npm run build` both succeed.

### 4.3 Consolidate UI Frameworks (Medium Risk)

**Step 1 — Audit component usage:**

Determine which components use which UI library:
```
@material-ui/core (v4): Which components?
@material-ui/icons (v4): Which components?
@mui/material (v5): Which components?
semantic-ui-react: Which components?
```

**Step 2 — Migrate all `@material-ui/*` imports to `@mui/material`:**

```typescript
// Before
import { TextField } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'

// After
import { TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
```

**Step 3 — Remove old packages:**

```bash
npm uninstall @material-ui/core @material-ui/icons
npm install @mui/icons-material
```

**Step 4 — Evaluate Semantic UI usage.** If only `EGCircularButton` uses it, replace with MUI `IconButton` and remove `semantic-ui-react` + `semantic-ui-css`.

**Verify:** All components render correctly with MUI v5 only.

### 4.4 Upgrade Mongoose (Medium Risk)

```bash
npm install mongoose@^8.0.0
npm uninstall @types/mongoose  # Types are built-in since mongoose 6
```

Key breaking changes from 5 → 8:
- `mongoose.connect()` no longer needs `useNewUrlParser` / `useUnifiedTopology`
- Model typing changes (use `HydratedDocument<T>` instead of `Document & T`)
- `mongoose.set('strictQuery', true)` may be needed

Update `src/server/dbConfigs.ts` accordingly.

**Verify:** Server starts, test routes work with MongoDB.

### 4.5 Migrate Webpack → Vite (Medium-High Risk)

This is the largest single change. Do it after all other dependency changes in this phase are stable.

**Install:**

```bash
npm install --save-dev vite @vitejs/plugin-react
npm uninstall webpack webpack-cli webpack-dev-server html-webpack-plugin \
  clean-webpack-plugin copy-webpack-plugin mini-css-extract-plugin \
  babel-loader ts-loader source-map-loader style-loader css-loader \
  url-loader file-loader postcss-loader postcss-preset-env \
  sass-loader @babel/core @babel/preset-env @babel/preset-react \
  @babel/plugin-proposal-class-properties @babel/eslint-parser \
  core-js regenerator-runtime
```

**File:** `vite.config.ts` (new, replaces `webpack.config.js`)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'src/client',
  publicDir: '../../public',
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8050',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:8050',
        ws: true,
      },
    },
  },
  define: {
    // Migrate DefinePlugin constants to Vite define
    // Alternatively, migrate to import.meta.env with VITE_ prefix
  },
})
```

**Environment Variable Migration:**

The current webpack setup injects 30+ constants via `DefinePlugin`. Vite uses `import.meta.env` with `VITE_` prefix.

**Strategy — Create a compatibility layer:**

```typescript
// src/client/env.ts (new file)
export const ENV = {
  API_SERVICE_URL: import.meta.env.VITE_API_SERVICE_URL || '',
  WS_SERVICE_URL: import.meta.env.VITE_WS_SERVICE_URL || '',
  // ... map all __VARIABLE__ constants to VITE_ env vars
} as const
```

Replace all `__VARIABLE__` references in client code with `ENV.VARIABLE` imports.

**Update npm scripts:**
```json
"build": "vite build",
"client": "vite",
"dev": "concurrently \"nodemon\" \"vite\"",
```

Delete `webpack.config.js`.

**Verify:** Client builds and serves, dev mode works with HMR.

### 4.6 Upgrade React 17 → 18 (Low-Medium Risk)

```bash
npm install react@^18.0.0 react-dom@^18.0.0
npm install --save-dev @types/react@^18.0.0 @types/react-dom@^18.0.0
```

Update `src/client/index.tsx`:

```typescript
// Before (React 17)
import ReactDOM from 'react-dom'
ReactDOM.render(<App />, document.getElementById('root'))

// After (React 18)
import { createRoot } from 'react-dom/client'
const root = createRoot(document.getElementById('root')!)
root.render(<App />)
```

The custom observer pattern is decoupled from React internals, so hooks like `useActiveNodes` should work unchanged with React 18's concurrent features.

**Verify:** App renders, hooks work, no console warnings.

### 4.7 Upgrade Three.js + 3D Force Graph (High Risk)

This must be done together since `3d-force-graph-vr` depends on a compatible Three.js version.

```bash
npm install three@^0.170.0 3d-force-graph-vr@^3.0.0
npm install --save-dev @types/three@^0.170.0
```

**Known breaking changes:**
- `THREE.Geometry` removed → use `THREE.BufferGeometry`
- `THREE.Face3` removed
- Material property changes
- `THREE.Math` → `THREE.MathUtils`
- `ForceGraphVR` API changes in v3 (check release notes)

**Migration approach:**
1. Update imports and fix compilation errors
2. Test with DummyData oracle (simplest data)
3. Test with BasicNetwork oracle (streaming)
4. Test node/link rendering
5. Test VR controls (ThreeMeshUI)

**Files most likely affected:**

| File | Reason |
|------|--------|
| `src/client/lib/Graph.ts` | ForceGraphVR wrapper |
| `src/client/lib/Utils.ts` | Three.js geometry/material creation |
| `src/client/lib/EventsGraph.ts` | Scene management |
| `src/client/lib/VRControlsUI.ts` | ThreeMeshUI integration |
| `src/client/lib/VRPanel.ts` | Three.js Object3D usage |
| `src/client/lib/NodeDisplay.ts` | Box3 usage |
| `src/client/lib/Sound.ts` | PositionalAudio |
| `src/client/lib/Cursor.ts` | A-Frame cursor |

**Verify:** 3D graph renders nodes and links, VR controls visible and interactive, audio plays on graph events.

### 4.8 Assess Twitter/X API (Variable Risk)

**Investigation needed:**
1. Check if `twitter-v2` npm package is still maintained
2. Check current X API pricing tiers (free tier may be read-only with limits)
3. Check if bearer token auth still works for the endpoints used
4. Test each context independently:
   - `ContextTweetLookup` — GET /tweets/:id
   - `ContextTweetsLookup` — GET /tweets
   - `ContextSearchTweets` — GET /tweets/search/recent
   - `ContextUserLookup` — GET /users/by/username/:username
   - `ContextFilteredStream` — GET /tweets/search/stream

**If Twitter API is no longer viable:**
- Keep the Oracle implementation for reference/testing with mock data
- Add a mock context that returns canned Twitter-format data
- Document the API status in README

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `vite.config.ts` | Create | Vite configuration |
| `webpack.config.js` | Delete | Replaced by Vite |
| `src/client/env.ts` | Create | Environment variable compatibility layer |
| `src/client/index.tsx` | Modify | React 18 `createRoot` |
| `src/client/components/app.tsx` | Modify | Updated imports |
| `src/client/lib/Graph.ts` | Modify | Three.js + ForceGraph API updates |
| `src/client/lib/Utils.ts` | Modify | BufferGeometry migration |
| `src/client/lib/EventsGraph.ts` | Modify | Three.js API updates |
| `src/server/dbConfigs.ts` | Modify | Mongoose 8 API |
| `tsconfig.json` | Modify | TS 5 target |
| `tsconfig.server.json` | Modify | TS 5 target |

---

## Dependency Changes Summary

### Production Dependencies

| Package | Current | Target | Action |
|---------|---------|--------|--------|
| `@emotion/react` | 11.4.1 | 11.14+ | Upgrade (minor) |
| `@emotion/styled` | 11.3.0 | 11.14+ | Upgrade (minor) |
| `@material-ui/core` | 4.12.3 | — | **Remove** |
| `@material-ui/icons` | 4.11.2 | — | **Remove** |
| `@mui/material` | 5.0.3 | 5.18+ | Upgrade (minor) |
| `@mui/icons-material` | — | 5.18+ | **Add** |
| `@seregpie/three.text-sprite` | 3.2.0 | Assess | Check Three.js compat |
| `@types/react` | 16.x | 18.x | Upgrade (major) |
| `@types/react-dom` | 16.x | 18.x | Upgrade (major) |
| `3d-force-graph-vr` | 1.35.6 | 3.x | Upgrade (major) |
| `immutable` | rc.12 | 5.x | Upgrade (major) |
| `mongoose` | 5.12.8 | 8.x | Upgrade (major) |
| `react` | 17.0.2 | 18.x | Upgrade (major) |
| `react-dom` | 17.0.2 | 18.x | Upgrade (major) |
| `semantic-ui-css` | 2.4.1 | — | **Remove** (if consolidating) |
| `semantic-ui-react` | 2.0.3 | — | **Remove** (if consolidating) |
| `socket.io` | 4.1.1 | 4.8+ | Upgrade (minor) |
| `socket.io-client` | 4.1.1 | 4.8+ | Upgrade (minor) |
| `three` | 0.128.0 | 0.170+ | Upgrade (major) |
| `three-mesh-ui` | 5.1.0 | 6.x | Upgrade (major) |
| `three-spritetext` | 1.6.2 | 1.10+ | Upgrade (minor) |
| `troika-three-text` | 0.42.0 | 0.52+ | Upgrade (minor) |
| `twitter-v2` | 1.1.0 | Assess | Check viability |

### Dev Dependencies

| Package | Current | Target | Action |
|---------|---------|--------|--------|
| `typescript` | 4.2.4 | 5.x | Upgrade (major) |
| `webpack` | 4.46.0 | — | **Remove** → Vite |
| `webpack-cli` | 3.3.12 | — | **Remove** |
| `webpack-dev-server` | 3.11.2 | — | **Remove** |
| `vite` | — | ^6.0.0 | **Add** |
| `@vitejs/plugin-react` | — | latest | **Add** |
| All webpack loaders/plugins | various | — | **Remove** |

---

## Verification Checkpoint

```
- [ ] Socket.IO: WebSocket connections work, streaming works
- [ ] TypeScript: Both tsconfigs compile cleanly with TS 5.x
- [ ] UI: All components render with MUI v5 only (no @material-ui references)
- [ ] Mongoose: Server starts, test routes work with MongoDB
- [ ] Vite: Client builds and serves, dev mode works with HMR
- [ ] React 18: App renders, hooks work, no console warnings
- [ ] Three.js: 3D graph renders nodes and links correctly
- [ ] Three.js: VR controls visible and interactive
- [ ] Three.js: Audio plays on graph events
- [ ] Three.js: Loading animation displays during data fetch
- [ ] DummyData oracle: End-to-end works
- [ ] BasicNetwork oracle: Streaming works
- [ ] Twitter oracle: Tested or documented as non-functional
- [ ] All Phase 3 tests still pass
```

### Quick Smoke Test

```bash
npm test
# Expected: All tests pass

npm run build
# Expected: Vite produces dist/ with index.html

npm run server
# Expected: "App listening on 8050"

open http://localhost:8050
# Expected: 3D graph renders, interactions work, no console errors
```

---

## Next Phase

Proceed to [Phase 5 — Architecture Refinement](./PHASE_5_ARCHITECTURE_REFINEMENT.md) after all checkpoints pass.
