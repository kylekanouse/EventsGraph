# EventsGraph — Solutions Architecture & Implementation Strategy

**Date:** April 14, 2026  
**Companion Document:** [CODEBASE_ANALYSIS.md](./CODEBASE_ANALYSIS.md)  
**Objective:** Stabilize, secure, and modernize the EventsGraph codebase through a series of incremental, testable phases without breaking existing functionality.

---

## Table of Contents

1. [Guiding Principles](#1-guiding-principles)
2. [Target Architecture](#2-target-architecture)
3. [Constraints & Risk Assessment](#3-constraints--risk-assessment)
4. [Phase 0 — Pre-Flight (Foundation)](#4-phase-0--pre-flight-foundation)
5. [Phase 1 — Stabilize Build Toolchain](#5-phase-1--stabilize-build-toolchain)
6. [Phase 2 — Security Hardening](#6-phase-2--security-hardening)
7. [Phase 3 — Test Infrastructure](#7-phase-3--test-infrastructure)
8. [Phase 4 — Dependency Modernization](#8-phase-4--dependency-modernization)
9. [Phase 5 — Architecture Refinement](#9-phase-5--architecture-refinement)
10. [Dependency Upgrade Matrix](#10-dependency-upgrade-matrix)
11. [File-Level Change Map](#11-file-level-change-map)
12. [Verification Checkpoints](#12-verification-checkpoints)

---

## 1. Guiding Principles

1. **No regressions.** Every phase ends with a working server + client. Validate with runtime tests before proceeding.
2. **Incremental delivery.** Each phase is independently committable and deployable.
3. **Minimal blast radius.** Group related changes; avoid mixing build changes with logic changes.
4. **Preserve architecture strengths.** The Oracle pattern, Entity system, and streaming model are well-designed. Modernize tooling around them, not through them.
5. **One problem at a time.** Do not combine dependency upgrades with refactors. Upgrade first, refactor second.

---

## 2. Target Architecture

### 2.1 Current vs. Target Stack

| Layer | Current | Target |
|-------|---------|--------|
| **Node Runtime** | v22 (untargeted, runs v12 config) | Node 20 LTS (pinned via `.nvmrc`) |
| **TypeScript** | 4.2.4 | 5.x |
| **Server Framework** | Express 4.17 | Express 4.22+ (stay on 4.x for stability) |
| **Client Bundler** | Webpack 4 + awesome-typescript-loader | Vite 6.x + native TS support |
| **CSS Tooling** | node-sass + less + PostCSS (3 preprocessors) | sass (Dart Sass) + PostCSS only |
| **React** | 17.0.2 | 18.x |
| **Three.js** | 0.128.0 | 0.170+ (compatible with 3d-force-graph-vr 3.x) |
| **3D Force Graph** | 1.35.6 | 3.x |
| **Socket.IO** | 4.1.1 | 4.8.x |
| **Mongoose** | 5.12.8 | 8.x |
| **UI Framework** | Material UI v4 + MUI v5 + Semantic UI | MUI v5 only (remove duplicates) |
| **Security** | None | helmet + CORS + Zod validation + rate limiting |
| **Testing** | None | Vitest (client + server) |
| **Linting** | ESLint 5 + babel-eslint | ESLint 9 + @typescript-eslint + Prettier |

### 2.2 Target Build Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                     BUILD PIPELINE (Target)                   │
│                                                              │
│  SERVER:                                                     │
│  src/server/**/*.ts  ──→  tsc (tsconfig.server.json)         │
│                      ──→  server/**/*.js (gitignored)        │
│                      ──→  node server/                       │
│                                                              │
│  CLIENT:                                                     │
│  src/client/**/*.tsx ──→  Vite (vite.config.ts)              │
│                      ──→  dist/ (gitignored)                 │
│                      ──→  served by Express static           │
│                                                              │
│  DEV MODE:                                                   │
│  Server: nodemon (watch src/server, tsc + restart)           │
│  Client: vite dev server (port 3000, proxy /api → 8050)      │
│  Both:   concurrently runs both                              │
│                                                              │
│  ENV:                                                        │
│  src/server/.env ──→ dotenv (server only)                    │
│  .env            ──→ Vite (client, VITE_ prefix)             │
└──────────────────────────────────────────────────────────────┘
```

### 2.3 Target Server Architecture

```
┌─────────────────────────────────────────────────────┐
│                  EXPRESS APPLICATION                  │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │            MIDDLEWARE STACK                   │    │
│  │  helmet → cors → rateLimiter → bodyParser    │    │
│  │  → logger → routes                          │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌──────────────────┐  ┌────────────────────────┐   │
│  │ Socket.IO        │  │ REST API /api/          │   │
│  │ + Zod validation │  │ + Zod validation        │   │
│  │ + throttling     │  │ + rate limiting         │   │
│  └────────┬─────────┘  └───────────┬────────────┘   │
│           │                        │                │
│  ┌────────┴────────────────────────┴────────────┐   │
│  │          EventsGraphService (Facade)          │   │
│  └────────────────────┬─────────────────────────┘   │
│                       │                             │
│  ┌────────────────────┴─────────────────────────┐   │
│  │          EventsGraphDataRepo (Repository)     │   │
│  └────────┬──────────┬──────────────────────────┘   │
│           │          │                              │
│  ┌────────┴───┐ ┌────┴──────┐ ┌─────────────────┐  │
│  │ Twitter    │ │ Basic     │ │ DummyData       │  │
│  │ Oracle     │ │ Network   │ │ Oracle          │  │
│  └────────────┘ │ Oracle    │ └─────────────────┘  │
│                 └───────────┘                       │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │              MongoDB (Mongoose)              │    │
│  │  Connection config via env vars              │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 3. Constraints & Risk Assessment

### 3.1 Hard Constraints

| Constraint | Detail | Impact |
|-----------|--------|--------|
| `node-sass` binary | Breaks on Node >16. Must be replaced before `npm install` on clean machines. | Blocks Phase 1 |
| `awesome-typescript-loader` | Requires webpack 4. Must be replaced before any webpack upgrade. | Blocks Phase 1 |
| `babel-polyfill` | Imports `regenerator-runtime` globally. Webpack 5 / Vite don't bundle it the same way. | Blocks bundle migration |
| `3d-force-graph-vr` 1.x → 3.x | Major API changes. Node/link rendering callbacks likely changed. | Phase 4, high risk |
| `three` 0.128 → 0.170+ | Geometry → BufferGeometry migration, material API changes, deprecated removed. | Phase 4, high risk |
| Twitter/X API | Bearer token free tier may be eliminated or restricted. `twitter-v2` package status unknown. | Assess in Phase 4 |
| `@uboot/uboot` | Custom pub/sub library. Package status unknown. | Assess, potentially replace |
| Dual MUI versions | `@material-ui/core` v4 and `@mui/material` v5 coexist. Must migrate components one by one. | Phase 4, medium risk |

### 3.2 Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Three.js upgrade breaks rendering | High | High | Upgrade Three.js and 3d-force-graph-vr together. Test with DummyData oracle first. |
| Twitter API no longer works | High | Medium | Isolate Twitter oracle. Test separately. Have fallback plan to disable. |
| Webpack → Vite migration breaks HMR | Medium | Medium | Migrate config incrementally. Verify DefinePlugin → import.meta.env migration. |
| React 17 → 18 breaks observers | Low | Medium | Observer pattern is decoupled from React lifecycle. Low risk. |
| `@uboot/uboot` unavailable | Medium | High | Package is small. Fork or inline if needed. |
| Fresh `npm install` fails on Node 22 | Certain | High | Phase 0 addresses this first. |

---

## 4. Phase 0 — Pre-Flight (Foundation)

**Goal:** Establish a reproducible, clean-installable project baseline on Node 20 LTS.

### 4.0.1 Pin Node Version

Create `.nvmrc`:
```
20
```

Add `engines` field to `package.json`:
```json
"engines": {
  "node": ">=18.0.0 <21.0.0"
}
```

### 4.0.2 Fix `.gitignore`

**Current issues:**
- `package-lock.json` is ignored (non-reproducible builds)
- Compiled `server/` directory is committed (stale artifacts, including deleted OlyCloud oracle)

**Changes to `.gitignore`:**
```diff
- package-lock.json
+ # Compiled server output (build from source)
+ server/
+ !server/.gitkeep
```

### 4.0.3 Clean Stale Artifacts

Remove the entire `server/` compiled directory from git tracking:
```bash
git rm -r --cached server/
```

Remove stale OlyCloud references:
- `server/lib/repos/oracles/OlyCloud.js`
- `server/lib/repos/oracles/OlyCloud.js.map`
- `server/lib/repos/oracles/olycloud/` (entire directory)

### 4.0.4 Generate Fresh Lock File

```bash
rm -rf node_modules
npm install
# Commit the resulting package-lock.json
```

### 4.0.5 Fix Logger Middleware

**File:** `src/server/middlewares/logger.ts`

Remove `console.clear()` call. It wipes all server logs on every incoming request.

### 4.0.6 Move MongoDB Config to Environment Variables

**File:** `src/server/configs.ts`

```typescript
// Before (hardcoded)
export const configs: IConfigs = {
    mongodb: {
        url: 'localhost',
        port: 27017,
        username: '',
        password: '',
        collection: 'test',
    }
}

// After (env-aware)
export const configs: IConfigs = {
    mongodb: {
        url: process.env.MONGODB_URL || 'localhost',
        port: Number(process.env.MONGODB_PORT) || 27017,
        username: process.env.MONGODB_USERNAME || '',
        password: process.env.MONGODB_PASSWORD || '',
        collection: process.env.MONGODB_COLLECTION || 'test',
    }
}
```

Add corresponding entries to `src/server/.env.example`.

### 4.0.7 Rebuild Server from Source

```bash
npx tsc -p tsconfig.server.json
node server/
# Verify: "App listening on 8050"
```

### Phase 0 Verification Checkpoint

```
- [ ] .nvmrc exists with "20"
- [ ] package.json has engines field
- [ ] package-lock.json is committed
- [ ] server/ is gitignored
- [ ] server/ rebuilt from source, server starts
- [ ] OlyCloud artifacts removed
- [ ] Logger no longer clears console
- [ ] MongoDB config reads from env vars
- [ ] npm install succeeds on Node 20 (may fail on node-sass — expected, fixed in Phase 1)
```

---

## 5. Phase 1 — Stabilize Build Toolchain

**Goal:** Replace deprecated/broken build dependencies so `npm install && npm run build && npm run server` works on Node 20.

### 5.1.1 Replace `node-sass` with `sass`

**Files modified:** `package.json`, `webpack.config.js`

```bash
npm uninstall node-sass
npm install --save-dev sass
```

`sass-loader` already supports Dart Sass — no config change needed in webpack. The `sass-loader` option `implementation` defaults to `sass` if `node-sass` is absent.

**Verification:** `npm run build` succeeds. The single `.scss` file (`src/client/styles/eventsgraph.scss`) is trivial CSS — no Sass-specific features used.

### 5.1.2 Replace `awesome-typescript-loader` with `ts-loader`

**Files modified:** `package.json`, `webpack.config.js`

```bash
npm uninstall awesome-typescript-loader
npm install --save-dev ts-loader
```

Update `webpack.config.js`:
```javascript
// Before
{
  test: /\.tsx?$/,
  use: [{ loader: 'awesome-typescript-loader' }],
  exclude: /node_modules/
}

// After
{
  test: /\.tsx?$/,
  use: [{ loader: 'ts-loader' }],
  exclude: /node_modules/
}
```

### 5.1.3 Replace `babel-polyfill` with `core-js`

**Files modified:** `package.json`, `webpack.config.js`

```bash
npm uninstall babel-polyfill
npm install core-js regenerator-runtime
```

Update `webpack.config.js` entry:
```javascript
// Before
entry: ['babel-polyfill', './src/client/index.tsx'],

// After
entry: ['core-js/stable', 'regenerator-runtime/runtime', './src/client/index.tsx'],
```

### 5.1.4 Replace `babel-eslint` with `@babel/eslint-parser`

```bash
npm uninstall babel-eslint
npm install --save-dev @babel/eslint-parser
```

Update any ESLint config referencing `babel-eslint` as parser.

### 5.1.5 Remove `less` and `less-loader`

No `.less` files exist in the source tree. These are dead weight.

```bash
npm uninstall less less-loader
```

Remove the less-loader rule from `webpack.config.js` if present (currently no less rule exists in webpack config, so just the package removal suffices).

### 5.1.6 Verify Full Build Cycle

```bash
npm install                    # Clean install on Node 20
npm run build                  # Webpack production build
npm run server                 # Start server
# Open http://localhost:8050   # Verify client loads
```

### Phase 1 Verification Checkpoint

```
- [ ] npm install succeeds on Node 20 with no native compilation errors
- [ ] npm run build produces dist/ with index.html and js/main.bundle.js
- [ ] npm run server starts on port 8050
- [ ] Client loads in browser, 3D graph renders with DummyData
- [ ] npm run dev works (concurrent server + client dev mode)
- [ ] No console errors related to deprecated packages
```

---

## 6. Phase 2 — Security Hardening

**Goal:** Address the 163 vulnerabilities and add baseline security middleware.

### 6.2.1 Run `npm audit fix`

```bash
npm audit fix
```

This resolves auto-fixable transitive dependency vulnerabilities without breaking changes.

### 6.2.2 Install Security Middleware

```bash
npm install helmet cors express-rate-limit
npm install --save-dev @types/cors
```

### 6.2.3 Apply Security Middleware

**File:** `src/server/index.ts`

```typescript
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

// After app creation, before routes:
app.use(helmet({
  contentSecurityPolicy: false  // Disable CSP initially (Three.js needs inline scripts)
}))

app.use(cors({
  origin: process.env.CLIENT_BASE_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', apiLimiter)
```

### 6.2.4 Add Socket Request Validation

```bash
npm install zod
```

**File:** `src/server/domain/schemas.ts` (new file)

```typescript
import { z } from 'zod'

export const GraphDataRequestSchema = z.object({
  collection: z.string().min(1).max(100),
  context: z.string().min(1).max(100),
  isStream: z.boolean().optional().default(false),
  params: z.record(z.unknown()).optional().default({}),
})

export type ValidatedGraphDataRequest = z.infer<typeof GraphDataRequestSchema>
```

**File:** `src/server/socket.ts` — wrap request parsing:

```typescript
import { GraphDataRequestSchema } from './domain/schemas'

// In socket event handler:
const parseResult = GraphDataRequestSchema.safeParse(JSON.parse(data))
if (!parseResult.success) {
  socket.emit('error', { message: 'Invalid request', errors: parseResult.error.issues })
  return
}
const request = parseResult.data
```

### 6.2.5 Add React Error Boundary

**File:** `src/client/components/ErrorBoundary.tsx` (new file)

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('EventsGraph Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 20, color: '#fff', background: '#333' }}>
        <h2>Something went wrong</h2>
        <p>{this.state.error?.message}</p>
        <button onClick={() => this.setState({ hasError: false })}>Retry</button>
      </div>
    }
    return this.props.children
  }
}
```

Wrap the `App` component:
```typescript
// src/client/index.tsx
ReactDOM.render(
  <ErrorBoundary><App /></ErrorBoundary>,
  document.getElementById('root')
)
```

### Phase 2 Verification Checkpoint

```
- [ ] npm audit shows reduced vulnerability count
- [ ] Server responds with security headers (check with curl -I)
- [ ] CORS headers present on API responses
- [ ] Rate limiting active on /api routes (verify with rapid requests)
- [ ] Invalid socket requests return structured error messages
- [ ] React error boundary catches and displays errors gracefully
- [ ] All existing functionality still works (DummyData, BasicNetwork)
```

---

## 7. Phase 3 — Test Infrastructure

**Goal:** Establish testing framework and write foundational tests for the highest-risk code paths.

### 7.3.1 Install Test Framework

```bash
npm install --save-dev vitest @vitest/coverage-v8
```

**File:** `vitest.config.ts` (new, project root)

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/server/lib/**', 'src/server/domain/**'],
    },
  },
})
```

Add scripts to `package.json`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

### 7.3.2 Priority Test Targets

Tests should cover the data transformation layer first — this is the most complex and most likely to break during upgrades.

#### Test Group 1: Server Utilities (`src/server/lib/Utils.ts`)
```
- createNode() produces valid IGraphNode
- createLink() produces valid IGraphLink
- mergeGraphData() combines nodes and links correctly
- removeDuplicatesFromGraphData() deduplicates by ID
- safeText() strips unsafe characters
- addNewLinesToWords() formats labels correctly
- normalize() scales values to 0-1 range
- buildResponse() creates valid response envelope
```

#### Test Group 2: Entity System (`src/server/lib/Entity.ts`, `EntityCollection.ts`)
```
- Entity.getGraphData() returns node + optional link
- Entity.getLink() creates correct source-target link
- EntityCollection.getGraphData() with linear association
- EntityCollection.getGraphData() with central association
- EntityCollection.getGraphData() with no association
- EntityCollection deduplicates merged graph data
```

#### Test Group 3: Oracle Routing (`src/server/lib/repos/EventsGraphDataRepo.ts`)
```
- findCollectionByID() returns correct oracle
- findCollectionByID() returns undefined for unknown ID
- getData() delegates to correct collection
- getDataStream() delegates to streamable context
- getCollectionIDs() returns all registered collections
```

#### Test Group 4: Socket Request Validation
```
- Valid request passes Zod schema
- Missing collection field fails
- Invalid isStream type fails
- Empty string collection fails
```

### 7.3.3 Enable TypeScript Strict Mode on Client

**File:** `tsconfig.json`

```diff
  "compilerOptions": {
+   "strict": true,
    "allowSyntheticDefaultImports": true,
```

Fix resulting type errors incrementally. Expect errors primarily in:
- Missing null checks
- Implicit `any` types
- Missing return types on callbacks

### Phase 3 Verification Checkpoint

```
- [ ] npm test runs and passes
- [ ] Coverage report generates for src/server/lib/
- [ ] Utils.ts has >80% coverage
- [ ] Entity/EntityCollection have >70% coverage
- [ ] EventsGraphDataRepo routing tests pass
- [ ] Zod validation tests pass
- [ ] Client tsconfig has strict: true (or incremental strict fields)
- [ ] All existing runtime functionality preserved
```

---

## 8. Phase 4 — Dependency Modernization

**Goal:** Upgrade major dependencies. This is the highest-risk phase — do one group at a time with verification between each.

### 8.4.1 Upgrade Socket.IO (Low Risk)

```bash
npm install socket.io@^4.8.0 socket.io-client@^4.8.0
```

API is backward-compatible within 4.x. Verify websocket connections work.

### 8.4.2 Upgrade TypeScript (Low Risk)

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

### 8.4.3 Consolidate UI Frameworks (Medium Risk)

**Step 1:** Audit component usage:
```
@material-ui/core (v4): Used in which components?
@material-ui/icons (v4): Used in which components?
@mui/material (v5): Used in which components?
semantic-ui-react: Used in which components?
```

**Step 2:** Migrate all `@material-ui/*` imports to `@mui/material`:
```typescript
// Before
import { TextField } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'

// After
import { TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
```

**Step 3:** Remove old packages:
```bash
npm uninstall @material-ui/core @material-ui/icons
npm install @mui/icons-material
```

**Step 4:** Evaluate Semantic UI usage. If only `EGCircularButton` uses it, replace with MUI `IconButton` and remove `semantic-ui-react` + `semantic-ui-css`.

### 8.4.4 Upgrade Mongoose (Medium Risk)

```bash
npm install mongoose@^8.0.0
npm uninstall @types/mongoose  # Types are built-in since mongoose 6
```

Key breaking changes from 5 → 8:
- `mongoose.connect()` no longer needs `useNewUrlParser` / `useUnifiedTopology`
- Model typing changes (use `HydratedDocument<T>` instead of `Document & T`)
- `mongoose.set('strictQuery', true)` may be needed

Update `src/server/dbConfigs.ts` accordingly.

### 8.4.5 Migrate Webpack → Vite (Medium-High Risk)

This is the largest single change. Do it after all other dependency changes are stable.

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

**Strategy:** Create a compatibility layer:
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

### 8.4.6 Upgrade React 17 → 18 (Low-Medium Risk)

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

### 8.4.7 Upgrade Three.js + 3D Force Graph (High Risk)

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
- `src/client/lib/Graph.ts` — ForceGraphVR wrapper
- `src/client/lib/Utils.ts` — Three.js geometry/material creation
- `src/client/lib/EventsGraph.ts` — Scene management
- `src/client/lib/VRControlsUI.ts` — ThreeMeshUI integration
- `src/client/lib/VRPanel.ts` — Three.js Object3D usage
- `src/client/lib/NodeDisplay.ts` — Box3 usage
- `src/client/lib/Sound.ts` — PositionalAudio
- `src/client/lib/Cursor.ts` — A-Frame cursor

### 8.4.8 Assess Twitter/X API (Variable Risk)

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

### Phase 4 Verification Checkpoint

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
```

---

## 9. Phase 5 — Architecture Refinement

**Goal:** Reduce complexity and improve maintainability. These are optional improvements, prioritized by impact.

### 9.5.1 Decompose `EventsGraph.ts` (890+ lines)

Split into focused modules:

```
src/client/lib/
  EventsGraph.ts           → Core orchestrator (reduced to ~200 lines)
  SceneManager.ts          → Three.js scene, camera, renderer lifecycle
  NodeInteractionManager.ts → Click, hover, focus, activate handlers
  VRControlManager.ts      → VR button rendering, raycast intersection
  AudioManager.ts          → Audio listener, sound management
  StreamProgressManager.ts → Stream progress tracking, loader updates
```

### 9.5.2 Move Socket Handling Out of Component

Address the existing TODO in `eventsGraph.tsx`:

```
// Current: eventsGraph.tsx directly emits/listens to socket
// Target: Service layer manages socket, component subscribes to data

src/client/lib/
  GraphDataService.ts      → Socket.IO connection, emit/listen, request queue
```

Component becomes:
```typescript
// eventsGraph.tsx
const dataService = new GraphDataService(socket)
dataService.onGraphData((response) => { /* update graph */ })
dataService.onGraphStream((response) => { /* update graph */ })
dataService.requestData(request)
```

### 9.5.3 Add Structured Logging

```bash
npm install pino
npm install --save-dev pino-pretty
```

Replace `console.log`, `console.table`, `console.error` with Pino logger:

```typescript
// src/server/lib/logger.ts
import pino from 'pino'
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty' }
    : undefined,
})
```

### 9.5.4 Add ESLint 9 + Prettier

```bash
npm install --save-dev eslint@^9.0.0 @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser prettier eslint-config-prettier
```

Create `eslint.config.mjs` (flat config format).

```bash
npm uninstall eslint eslint-config-airbnb eslint-config-airbnb-base \
  eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react babel-eslint
```

Add scripts:
```json
"lint": "eslint src/",
"lint:fix": "eslint src/ --fix",
"format": "prettier --write src/"
```

### Phase 5 Verification Checkpoint

```
- [ ] EventsGraph.ts is <300 lines with focused sub-modules
- [ ] Socket handling is in service layer, not in React component
- [ ] Structured logging active (pino output in dev, JSON in prod)
- [ ] ESLint passes on full codebase
- [ ] Prettier formatting applied consistently
- [ ] All tests still pass
- [ ] Full end-to-end functionality preserved
```

---

## 10. Dependency Upgrade Matrix

Complete mapping of all dependency changes across phases:

### Production Dependencies

| Package | Current | Target | Phase | Action |
|---------|---------|--------|-------|--------|
| `@emotion/react` | 11.4.1 | 11.14+ | 4 | Upgrade (minor) |
| `@emotion/styled` | 11.3.0 | 11.14+ | 4 | Upgrade (minor) |
| `@material-ui/core` | 4.12.3 | — | 4 | **Remove** |
| `@material-ui/icons` | 4.11.2 | — | 4 | **Remove** |
| `@mui/material` | 5.0.3 | 5.18+ | 4 | Upgrade (minor) |
| `@mui/icons-material` | — | 5.18+ | 4 | **Add** |
| `@seregpie/three.text-sprite` | 3.2.0 | Assess | 4 | Check Three.js compat |
| `@types/react` | 16.x | 18.x | 4 | Upgrade (major) |
| `@types/react-dom` | 16.x | 18.x | 4 | Upgrade (major) |
| `@types/react-redux` | 7.1.10 | 7.1.34 | 4 | Upgrade (minor) |
| `@uboot/uboot` | 0.1.2 | Assess | 5 | Check availability |
| `3d-force-graph-vr` | 1.35.6 | 3.x | 4 | Upgrade (major) |
| `babel-polyfill` | 6.26.0 | — | 1 | **Remove** → `core-js` |
| `body-parser` | 1.19.0 | 1.20+ | 2 | Upgrade (minor) |
| `dotenv` | 9.0.2 | 16+ | 1 | Upgrade (major) |
| `express` | 4.17.1 | 4.22+ | 2 | Upgrade (minor, stay on 4.x) |
| `immutable` | rc.12 | 5.x | 4 | Upgrade (major) |
| `limiter` | 2.1.0 | 2.1+ | — | Keep |
| `mongoose` | 5.12.8 | 8.x | 4 | Upgrade (major) |
| `react` | 17.0.2 | 18.x | 4 | Upgrade (major) |
| `react-dom` | 17.0.2 | 18.x | 4 | Upgrade (major) |
| `semantic-ui-css` | 2.4.1 | — | 4 | **Remove** (if consolidating) |
| `semantic-ui-react` | 2.0.3 | — | 4 | **Remove** (if consolidating) |
| `socket.io` | 4.1.1 | 4.8+ | 4 | Upgrade (minor) |
| `socket.io-client` | 4.1.1 | 4.8+ | 4 | Upgrade (minor) |
| `stats.js` | 0.17.0 | 0.17+ | — | Keep |
| `three` | 0.128.0 | 0.170+ | 4 | Upgrade (major) |
| `three-mesh-ui` | 5.1.0 | 6.x | 4 | Upgrade (major) |
| `three-spritetext` | 1.6.2 | 1.10+ | 4 | Upgrade (minor) |
| `troika-three-text` | 0.42.0 | 0.52+ | 4 | Upgrade (minor) |
| `twitter-v2` | 1.1.0 | Assess | 4 | Check viability |

### New Production Dependencies

| Package | Version | Phase | Purpose |
|---------|---------|-------|---------|
| `helmet` | ^8.0.0 | 2 | Security headers |
| `cors` | ^2.8.5 | 2 | CORS middleware |
| `express-rate-limit` | ^7.0.0 | 2 | Rate limiting |
| `zod` | ^3.23.0 | 2 | Request validation |
| `core-js` | ^3.39.0 | 1 | Polyfills (replaces babel-polyfill) |
| `regenerator-runtime` | ^0.14.0 | 1 | Async/await polyfill |
| `pino` | ^9.0.0 | 5 | Structured logging |

### Dev Dependencies

| Package | Current | Target | Phase | Action |
|---------|---------|--------|-------|--------|
| `awesome-typescript-loader` | 5.2.1 | — | 1 | **Remove** → `ts-loader` |
| `node-sass` | 6.0.0 | — | 1 | **Remove** → `sass` |
| `babel-eslint` | 10.0.0 | — | 1 | **Remove** |
| `less` | 3.13.1 | — | 1 | **Remove** |
| `less-loader` | 5.0.0 | — | 1 | **Remove** |
| `ts-loader` | — | ^9.5.0 | 1 | **Add** (interim, removed at Vite migration) |
| `sass` | — | latest | 1 | Already installed, remove node-sass |
| `typescript` | 4.2.4 | 5.x | 4 | Upgrade (major) |
| `webpack` | 4.46.0 | — | 4 | **Remove** → Vite |
| `webpack-cli` | 3.3.12 | — | 4 | **Remove** |
| `webpack-dev-server` | 3.11.2 | — | 4 | **Remove** |
| `vite` | — | ^6.0.0 | 4 | **Add** |
| `@vitejs/plugin-react` | — | latest | 4 | **Add** |
| `vitest` | — | ^3.0.0 | 3 | **Add** |
| `eslint` | 5.16.0 | 9.x | 5 | Upgrade (major) |
| `prettier` | — | latest | 5 | **Add** |
| `pino-pretty` | — | latest | 5 | **Add** |

---

## 11. File-Level Change Map

### Phase 0 Files

| File | Action | Description |
|------|--------|-------------|
| `.nvmrc` | Create | Node version pin |
| `.gitignore` | Modify | Add `server/`, remove `package-lock.json` |
| `package.json` | Modify | Add `engines` field |
| `src/server/configs.ts` | Modify | Env var support for MongoDB |
| `src/server/middlewares/logger.ts` | Modify | Remove `console.clear()` |
| `src/server/.env.example` | Modify | Add MongoDB env vars |
| `server/` | Delete from git | Remove tracked compiled output |

### Phase 1 Files

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Swap dependencies |
| `webpack.config.js` | Modify | Replace loader references |

### Phase 2 Files

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add security packages |
| `src/server/index.ts` | Modify | Add middleware stack |
| `src/server/socket.ts` | Modify | Add Zod validation |
| `src/server/domain/schemas.ts` | Create | Zod request schemas |
| `src/client/components/ErrorBoundary.tsx` | Create | React error boundary |
| `src/client/index.tsx` | Modify | Wrap with ErrorBoundary |

### Phase 3 Files

| File | Action | Description |
|------|--------|-------------|
| `vitest.config.ts` | Create | Test configuration |
| `package.json` | Modify | Add test scripts |
| `tsconfig.json` | Modify | Enable strict mode |
| `src/server/lib/__tests__/Utils.test.ts` | Create | Utility tests |
| `src/server/lib/__tests__/Entity.test.ts` | Create | Entity tests |
| `src/server/lib/__tests__/EntityCollection.test.ts` | Create | Collection tests |
| `src/server/lib/repos/__tests__/EventsGraphDataRepo.test.ts` | Create | Repo routing tests |
| `src/server/domain/__tests__/schemas.test.ts` | Create | Validation tests |

### Phase 4 Files

| File | Action | Description |
|------|--------|-------------|
| `vite.config.ts` | Create | Vite configuration |
| `webpack.config.js` | Delete | Replaced by Vite |
| `src/client/env.ts` | Create | Environment variable layer |
| `src/client/index.tsx` | Modify | React 18 createRoot |
| `src/client/components/app.tsx` | Modify | Updated imports |
| `src/client/lib/Graph.ts` | Modify | Three.js + ForceGraph API updates |
| `src/client/lib/Utils.ts` | Modify | BufferGeometry migration |
| `src/client/lib/EventsGraph.ts` | Modify | Three.js API updates |
| `src/server/dbConfigs.ts` | Modify | Mongoose 8 API |
| `tsconfig.json` | Modify | TS 5 target |
| `tsconfig.server.json` | Modify | TS 5 target |

### Phase 5 Files

| File | Action | Description |
|------|--------|-------------|
| `src/client/lib/SceneManager.ts` | Create | Extracted from EventsGraph |
| `src/client/lib/NodeInteractionManager.ts` | Create | Extracted from EventsGraph |
| `src/client/lib/VRControlManager.ts` | Create | Extracted from EventsGraph |
| `src/client/lib/AudioManager.ts` | Create | Extracted from EventsGraph |
| `src/client/lib/GraphDataService.ts` | Create | Socket abstraction |
| `src/server/lib/logger.ts` | Create | Pino logger |
| `eslint.config.mjs` | Create | Flat ESLint config |
| `.prettierrc` | Create | Prettier config |

---

## 12. Verification Checkpoints

### Quick Smoke Test (Run After Every Phase)

```bash
# Server builds and starts
npm run server
# Expected: "App listening on 8050"

# Client builds
npm run build
# Expected: dist/ contains index.html and js/

# Full start
npm start
# Expected: Server on 8050 serving client

# Browser test
open http://localhost:8050
# Expected: 3D graph interface loads without console errors
```

### Full Verification Matrix

| Test | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|------|---------|---------|---------|---------|---------|---------|
| `npm install` succeeds | ⚠️ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `npm run build` succeeds | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Server starts on 8050 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Client loads in browser | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| DummyData oracle works | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| BasicNetwork streaming | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 3D nodes render | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Node click interaction | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| VR controls visible | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Loading animation | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Security headers | — | — | ✓ | ✓ | ✓ | ✓ |
| Rate limiting | — | — | ✓ | ✓ | ✓ | ✓ |
| Input validation | — | — | ✓ | ✓ | ✓ | ✓ |
| Error boundary | — | — | ✓ | ✓ | ✓ | ✓ |
| Unit tests pass | — | — | — | ✓ | ✓ | ✓ |
| `npm audit` <20 vulns | — | — | ✓ | ✓ | ✓ | ✓ |
| ESLint passes | — | — | — | — | — | ✓ |

---

*Generated April 14, 2026. Refer to CODEBASE_ANALYSIS.md for the full current-state assessment.*
