# EventsGraph — Codebase Analysis & Recommendations

**Date:** April 14, 2026  
**Last Commit:** July 25, 2023 (~2.7 years ago)  
**Repository:** 56 commits, April 2020 – July 2023  
**Runtime Status:** Server starts and serves client on Node v22 (targets Node 12)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Summary](#2-architecture-summary)
3. [Codebase Metrics](#3-codebase-metrics)
4. [Server-Side Analysis](#4-server-side-analysis)
5. [Client-Side Analysis](#5-client-side-analysis)
6. [Build & Toolchain Analysis](#6-build--toolchain-analysis)
7. [Dependency Health](#7-dependency-health)
8. [Security Audit](#8-security-audit)
9. [Design Patterns & Code Quality](#9-design-patterns--code-quality)
10. [Issues & Technical Debt](#10-issues--technical-debt)
11. [Recommendations](#11-recommendations)
12. [Modernization Roadmap](#12-modernization-roadmap)

---

## 1. Project Overview

EventsGraph is a VR-capable 3D graph data visualization platform built to transform structured event data (Twitter feeds, network operations, etc.) into interactive force-directed graphs viewable in both desktop and VR contexts.

**Core Value Proposition:** Transfer data complexity into pre-existing human domains (visual, physics, sound) to facilitate insight and enhanced interoperability.

**Key Capabilities:**
- Real-time streaming of graph data via Socket.IO
- Twitter API v2 integration (tweet lookup, search, filtered stream, user lookup)
- Mock data sources for development/testing (BasicNetwork, DummyData)
- VR-ready 3D visualization using Three.js + A-Frame + 3D Force Graph VR
- Spatial audio tied to graph events
- Custom navigation system (keyboard + VR controls)
- Pluggable data source architecture via Oracle pattern

---

## 2. Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (React + Three.js)          │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐│
│  │ React UI │  │ EventsGraph  │  │ Observer Pattern    ││
│  │ (HUD,    │  │ (Three.js    │  │ (Uboot pub/sub)    ││
│  │ Controls)│  │  Scene Mgr)  │  │                    ││
│  └────┬─────┘  └──────┬───────┘  └────────────────────┘│
│       │               │                                 │
│       └───────┬───────┘                                 │
│               │ Socket.IO Client                        │
└───────────────┼─────────────────────────────────────────┘
                │
        ┌───────┼───────┐
        │  WebSocket /  │
        │  HTTP         │
        └───────┼───────┘
                │
┌───────────────┼─────────────────────────────────────────┐
│               │          SERVER (Express + TS)           │
│  ┌────────────┴──────────┐                              │
│  │ Socket.IO Handler     │                              │
│  │ (Throttled streaming) │                              │
│  └────────────┬──────────┘                              │
│               │                                         │
│  ┌────────────┴──────────┐                              │
│  │ EventsGraphService    │  (Facade/Singleton)          │
│  └────────────┬──────────┘                              │
│               │                                         │
│  ┌────────────┴──────────┐                              │
│  │ EventsGraphDataRepo   │  (Repository Pattern)        │
│  └────────────┬──────────┘                              │
│               │                                         │
│  ┌────────┬───┴────┬─────────┐                          │
│  │Twitter │Basic   │Dummy    │  (Oracle Pattern)        │
│  │Oracle  │Network │Data     │                          │
│  └───┬────┘Oracle  │Oracle   │                          │
│      │    └────────┘└────────┘                          │
│  ┌───┴────────────────────┐                             │
│  │ Twitter Contexts:      │                             │
│  │ - TweetLookup          │                             │
│  │ - TweetsLookup         │                             │
│  │ - SearchTweets         │                             │
│  │ - UserLookup           │                             │
│  │ - FilteredStream       │                             │
│  └────────────────────────┘                             │
│                                                         │
│  ┌────────────────────┐  ┌──────────────────┐           │
│  │ Express REST API   │  │ MongoDB/Mongoose │           │
│  │ (Minimal routes)   │  │ (Test model only)│           │
│  └────────────────────┘  └──────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

**Communication Model:**
- Primary data flow uses **Socket.IO** (events: `getGraphData`, `getGraphDataStream`, `graphData`, `graphStream`, `closeStream`)
- REST API exists but is mostly placeholder/test routes (`GET /api/graphdata`, CRUD `/api/extra`, `/api/test`)
- No REST endpoints serve graph data — all graph communication is websocket-based

---

## 3. Codebase Metrics

| Metric                     | Value          |
|----------------------------|----------------|
| Total TypeScript LOC       | ~18,500        |
| Server TypeScript files    | 148            |
| Server TypeScript LOC      | ~7,800         |
| Client TypeScript files    | 159            |
| Client TypeScript LOC      | ~10,700        |
| Domain interfaces (server) | 31 files       |
| Domain interfaces (client) | 18+ files      |
| Type definitions (client)  | 45+ `.d.ts`    |
| Data source oracles        | 3 (Twitter, BasicNetwork, DummyData) |
| Twitter contexts           | 5              |
| Twitter entity classes     | 15+            |
| React components           | ~12            |
| Custom React hooks         | 4              |
| Observer implementations   | 11             |
| Command implementations    | 2              |
| Conditional classes        | 8              |
| Total npm dependencies     | 36 production + 32 dev |
| Security vulnerabilities   | 163 (16 critical, 75 high) |
| Outdated packages          | 60+            |

---

## 4. Server-Side Analysis

### 4.1 Entry Point & Express Setup (`src/server/index.ts`)
- Standard Express app with body-parser, static file serving, Socket.IO CORS config
- Routes registered under `/api` prefix
- Default port 8050

### 4.2 Socket.IO Handler (`src/server/socket.ts`)
- Handles `getGraphData` (one-shot) and `getGraphDataStream` (streaming) events
- Implements throttling (10s window) to prevent overwhelming clients during streams
- Rate limiting via `limiter` package
- Stream lifecycle: open → progress updates → close on completion or client disconnect
- JSON request parsing with error handling

### 4.3 Data Source Architecture (Oracle Pattern)

**Layered delegation:**
1. `EventsGraphService` (facade) → `EventsGraphDataRepo` (repository) → `Oracle` (collection) → `Context` (specific operation)

**Oracle implementations:**

| Oracle       | Collection ID    | Contexts                        | Streamable |
|-------------|------------------|---------------------------------|------------|
| Twitter     | `twitter`        | TweetLookup, TweetsLookup, SearchTweets, UserLookup, FilteredStream | Partial    |
| BasicNetwork| `basicnetwork`   | ServicesOperations              | Yes        |
| DummyData   | `dummydata`      | BasicDataBasic                  | No         |

**Ghost Oracle:** Compiled output contains `OlyCloud.js` in `server/lib/repos/oracles/olycloud/` with no corresponding TypeScript source — likely deleted from source but still present in compiled output.

### 4.4 Twitter Integration (Most Complex Subsystem)
- Uses `twitter-v2` npm package with bearer token auth
- 5 context implementations for different Twitter API v2 endpoints
- Rich entity model: Tweet, User, Media, PublicMetrics, ContextAnnotation, Hashtag, Mention, URL, Cashtag
- Entity → GraphNode transformation with icon mapping, color coding, and normalized values
- Filtered stream supports rule management and sample-size-limited accumulation
- 50+ environment variables for Twitter configuration

### 4.5 Entity System
- Abstract `Entity` base → `EntityCollection` composite → specialized implementations
- `CollectionAssociation` types control graph topology: `"linear"`, `"central"`, `"none"`
- Utility functions for graph data merging, deduplication, and label formatting

### 4.6 REST API Routes (Minimal)
| Route           | Methods         | Purpose                        |
|----------------|-----------------|--------------------------------|
| `/api/graphdata`| GET            | Placeholder (returns message)  |
| `/api/extra`    | GET, POST, PUT | Username fetch, test CRUD      |
| `/api/test`     | GET, POST, PUT, DELETE | MongoDB test model CRUD |

### 4.7 Database
- MongoDB via Mongoose with singleton connection pattern
- Only one model defined: `Test` with a single `text: string` field
- Connection config hardcoded in `configs.ts` (localhost:27017, collection "test")
- Not used for core graph functionality — all graph data comes from oracles

### 4.8 Middleware
- `checkMethod`: HTTP method validation with 405 responses
- `logger`: Console logging of requests with `console.table` (clears console each time)

---

## 5. Client-Side Analysis

### 5.1 React Layer
- Entry point renders `App` → `EventsGraph` component
- Socket.IO connection initialized in `App`, passed as prop
- HUD (Heads-Up Display) provides control panel UI
- Material UI + Semantic UI for form controls and layout
- Request controls for each data source (Twitter search, stream, lookup; BasicNetwork; DummyData)

### 5.2 3D Visualization Engine
- **Graph.ts**: Wraps `3d-force-graph-vr` (ForceGraphVR) library
  - Force-directed layout with configurable node/link rendering
  - Sprite text labels, color coding by group/type
  - Directional link particles with animated speed
- **EventsGraph.ts** (~890 lines): Central orchestrator
  - Manages Three.js scene, camera, renderer
  - Node interaction (click, hover, focus, activate)
  - VR control rendering (ThreeMeshUI buttons)
  - Cursor management for VR raycasting
  - Audio listener integration
  - Stats.js performance monitoring
  - Stream progress tracking

### 5.3 Entity System (Client-Side)
- Mirrors server entity pattern: `Entity` → `GraphEntity` → `Node`, `Link`
- `Node`: Manages `NodeDisplay` (VR info panel), focus/blur/activation states, navigation indexing
- `Link`: Minimal wrapper with source/target tracking
- `NodeDisplay`: ThreeMeshUI-based VR panel showing node metadata

### 5.4 State Management (Observer Pattern)
Custom pub/sub system using `@uboot/uboot` library:

| Observer                  | Purpose                                          |
|---------------------------|--------------------------------------------------|
| ActiveNodesObserved       | Set<Node> tracking active nodes                 |
| NodeClickedObserved       | Node pointer event filtering                     |
| EntityActiveObserved      | Entity activation state changes                  |
| EntityClickedObserved     | All entity click events                          |
| EntitiesOnStageObserved   | Set of rendered entities                         |
| CommandsObserved          | Command registry and execution                   |
| NodesOnStageObserved      | Map of rendered nodes                            |
| GraphLoadedObserved       | Graph load status and node count                 |
| NavSelectedTypesObserved  | Navigation type filters                          |
| VRControlsClickedObserved | VR button interaction events                     |
| NavigationObserved        | Navigation map for next/prev traversal           |

### 5.5 Command System
- `CommandNext` / `CommandPrev`: Navigate through nodes sequentially
- Keyboard triggers: X (next), Z (prev) with debouncing
- VR triggers: ThreeMeshUI button integration
- Navigation backed by `NavMap` (circular, supports type-based filtering)

### 5.6 Conditional System
8 conditional classes for selective observer filtering:
- Filter by entity ID, active state, focused state, hover state, stage presence, entity type

### 5.7 Audio
- Three.js `PositionalAudio` for spatial sound
- `EventSound` tied to graph events (bee_buzz.ogg)
- Audio caching by URL

### 5.8 Loading System
- SpriteText-based 3D loading indicator with progress percentage and animated dots

---

## 6. Build & Toolchain Analysis

### 6.1 Server Build
- TypeScript → JavaScript via `tsc` using `tsconfig.server.json`
- Targets Node 12 (`@tsconfig/node12`), ES2019, CommonJS modules
- Output to `server/` directory
- Nodemon with `tsc -p tsconfig.server.json && node server` for dev

### 6.2 Client Build
- Webpack 4 with `awesome-typescript-loader` and `babel-loader`
- Entry: `babel-polyfill` + `src/client/index.tsx`
- Output to `dist/` directory
- Dev server on port 3000 with HMR, proxying `/api/**` to localhost:8050
- PostCSS with preset-env and autoprefixer
- CSS: style-loader, css-loader, sass-loader (node-sass), less-loader
- Copies assets, data, and favicon directories
- DefinePlugin injects 20+ environment variables as compile-time constants

### 6.3 Build Concerns

| Issue | Severity | Detail |
|-------|----------|--------|
| `awesome-typescript-loader` | High | Deprecated, unmaintained since 2019. Should be `ts-loader`. |
| `node-sass` | High | Deprecated. Native binary breaks across Node versions. Should be `sass` (Dart Sass). |
| `babel-polyfill` | Medium | Deprecated since Babel 7.4. Should use `core-js/stable` + `regenerator-runtime`. |
| Webpack 4 | Medium | EOL. Webpack 5 has been stable for 5+ years. Many plugins incompatible. |
| `clean-webpack-plugin` v1 | Low | API changed significantly in v3+. |
| `copy-webpack-plugin` v5 | Low | API changed in v6+. |
| `html-webpack-plugin` v3 | Low | Current is v5. |

---

## 7. Dependency Health

### 7.1 Vulnerability Summary

| Severity | Count |
|----------|-------|
| Critical | 16    |
| High     | 75    |
| Moderate | 62    |
| Low      | 10    |
| **Total**| **163** |

### 7.2 Critical Vulnerability Packages (Partial)
- `node-fetch`: Exposure of sensitive info
- `axios` (transitive): SSRF
- `ws`: ReDoS vulnerabilities in multiple copies
- `mongoose` 5.x: Multiple known vulnerabilities
- `express` 4.17.x: Path traversal, open redirect issues
- `body-parser`: Prototype pollution (older versions)

### 7.3 Key Outdated Packages

| Package | Current | Latest | Gap |
|---------|---------|--------|-----|
| `react` / `react-dom` | 17.0.2 | 19.x | 2 major versions |
| `three` | 0.128.0 | 0.183.x | 55 patch releases |
| `express` | 4.17.1 | 5.x | 1 major version |
| `mongoose` | 5.12.8 | 9.x | 4 major versions |
| `typescript` | 4.2.4 | 6.x | 2 major versions |
| `webpack` | 4.46.0 | 5.x | 1 major version |
| `socket.io` | 4.1.1 | 4.8.x | Multiple minor versions |
| `@mui/material` | 5.0.3 | 9.x | 4 major versions |
| `aframe` | 1.2.0 | 1.7.x | Multiple minor versions |
| `3d-force-graph-vr` | 1.35.6 | 3.x | 2 major versions |
| `dotenv` | 9.0.2 | 17.x | 8 major versions |
| `eslint` | 5.16.0 | 10.x | 5 major versions |

### 7.4 Deprecated / Unmaintained Packages
- `awesome-typescript-loader` — No updates since 2019
- `node-sass` — Deprecated in favor of `sass` (Dart Sass)
- `babel-polyfill` — Deprecated since Babel 7.4
- `twitter-v2` — Unclear maintenance status given Twitter/X API changes
- `@material-ui/core` + `@material-ui/icons` — Superseded by `@mui/material` (both are present, creating duplication)
- `babel-eslint` — Replaced by `@babel/eslint-parser`

---

## 8. Security Audit

### 8.1 Server-Side Security Issues

| Issue | Severity | Location | Detail |
|-------|----------|----------|--------|
| No input validation | High | `socket.ts` | Socket requests are JSON-parsed but not schema-validated |
| No rate limiting on API routes | Medium | `route/` | Only socket has throttling; REST routes are unprotected |
| No authentication | High | Entire app | No auth middleware on any route or socket connection |
| No CORS on REST API | Medium | `index.ts` | CORS only configured for Socket.IO, not Express routes |
| Hardcoded MongoDB config | Medium | `configs.ts` | localhost:27017 with empty credentials, no env var override |
| `console.clear()` in logger | Low | `middlewares/logger.ts` | Clears server logs on every request |
| Compiled JS in repo | Medium | `server/` | Compiled output committed to git, can drift from source |

### 8.2 Client-Side Security Issues

| Issue | Severity | Detail |
|-------|----------|--------|
| No CSP headers | Medium | No Content-Security-Policy configured |
| Environment variables as compile-time constants | Low | 20+ values baked into client bundle via DefinePlugin |
| No error boundaries | Medium | Uncaught React errors will crash the entire app |

### 8.3 Environment & Config Security

| Issue | Severity | Detail |
|-------|----------|--------|
| `.env` not in `.gitignore` path pattern | Low | `.env` is ignored but `src/server/.env` relies on the pattern matching |
| `package-lock.json` in `.gitignore` | Medium | Lock files should be committed for reproducible builds |
| Twitter bearer token in `.env` | Expected | Ensure token has minimal scopes |

---

## 9. Design Patterns & Code Quality

### 9.1 Patterns in Use

| Pattern | Usage | Quality |
|---------|-------|---------|
| **Repository** | `EventsGraphDataRepo` | Well-implemented, clean interface |
| **Oracle/Strategy** | Data source abstraction | Well-designed, extensible via new Oracle + Context classes |
| **Facade** | `EventsGraphService` | Thin layer, appropriate for current scope |
| **Observer (Pub/Sub)** | Client state management | Comprehensive but complex; 11 observer types with conditional callbacks |
| **Command** | Navigation (Next/Prev) | Clean implementation, extensible |
| **Composite** | `EntityCollection` extends `Entity` | Effective for graph data aggregation |
| **Singleton** | Service, Repo, DB, TwitterAPI | Heavy use of singletons; limits testability |
| **Template Method** | `Entity`, `EntityCollection`, `Context` abstract classes | Appropriate for hierarchy |

### 9.2 Strengths
- Clean separation between data sources via Oracle pattern — adding a new source is straightforward
- Well-defined domain interfaces (31 server + 18 client + 45 type definitions)
- Entity system provides composable 3D object handling
- Streaming architecture with throttling and progress updates is production-quality design
- VR-ready from day one with ThreeMeshUI and A-Frame integration
- Collection association types (`linear`, `central`, `none`) provide flexible graph topology

### 9.3 Weaknesses
- Heavy singleton usage limits testability and makes dependency injection difficult
- Client state management is complex — 11 observer types with conditional filtering is a lot of indirection
- No test files exist anywhere in the codebase
- Server REST routes are mostly placeholders
- Dual UI framework usage (Material UI + Semantic UI) adds bundle size and inconsistency
- Some large files (EventsGraph.ts ~890 lines) could benefit from decomposition

---

## 10. Issues & Technical Debt

### 10.1 Critical Issues

1. **163 security vulnerabilities** including 16 critical — the application should not be deployed as-is
2. **No tests** — zero test files in the entire codebase
3. **Compiled JS committed to git** — `server/` directory contains stale compiled output (includes deleted `OlyCloud` oracle that no longer has source)
4. **`package-lock.json` gitignored** — dependency resolution is non-reproducible

### 10.2 High-Priority Debt

5. **Deprecated build toolchain** — `awesome-typescript-loader`, `node-sass`, `babel-polyfill`, Webpack 4
6. **Twitter API v2 changes** — The Twitter/X API has undergone significant pricing and access changes since 2023; the `twitter-v2` library and bearer token access may no longer work as expected
7. **No authentication or authorization** — any client can connect via Socket.IO and query any data source
8. **Duplicate UI frameworks** — both `@material-ui/core` (v4) and `@mui/material` (v5) are installed
9. **Node version mismatch** — targets Node 12 but running on Node 22; `node-sass` will break on fresh install
10. **No error boundaries** in React — unhandled errors will white-screen the app

### 10.3 Medium-Priority Debt

11. **Logger clears console** — `console.clear()` in middleware wipes all server logs
12. **Hardcoded MongoDB config** — not configurable via environment variables
13. **No TypeScript strict mode on client** — only server tsconfig has `strict: true`
14. **Socket request validation** — requests are parsed from JSON but not schema-validated
15. **Missing root `.env`** — `/.env.example` references `GRAPH_DATA_URL` but no `.env` exists at root
16. **CSS handling** — three CSS pre-processors (Sass, Less, PostCSS) configured but unclear which is primary

### 10.4 Code TODOs Found in Source
- `@todo: REMOVE reference to socket and bubble up events to parent domain` (eventsGraph.tsx)
- Raycast filtering TODO: create observer for non-graph entities to optimize intersection testing
- Filtered stream rule management code commented out (ContextFilteredStream)

---

## 11. Recommendations

### 11.1 Immediate Actions (Do First)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 1 | Run `npm audit fix` to resolve auto-fixable vulnerabilities | Low | High |
| 2 | Commit `package-lock.json` (remove from `.gitignore`) | Low | Medium |
| 3 | Add `server/` (compiled output) to `.gitignore`, build on deploy | Low | Medium |
| 4 | Clean stale `OlyCloud` compiled artifacts from `server/` | Low | Low |
| 5 | Remove `console.clear()` from logger middleware | Low | Low |
| 6 | Add `.nvmrc` or `engines` field to pin Node version | Low | Medium |

### 11.2 Build Toolchain Modernization

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 7 | Replace `awesome-typescript-loader` with `ts-loader` | Low | High |
| 8 | Replace `node-sass` with `sass` (Dart Sass) | Low | High |
| 9 | Replace `babel-polyfill` with `core-js/stable` | Low | Medium |
| 10 | Upgrade Webpack 4 → 5 (or migrate to Vite) | Medium | High |
| 11 | Replace `babel-eslint` with `@babel/eslint-parser` | Low | Low |
| 12 | Consolidate on one CSS preprocessor | Low | Low |

### 11.3 Dependency Consolidation

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 13 | Remove `@material-ui/core` + `@material-ui/icons`, use only `@mui/material` | Medium | Medium |
| 14 | Evaluate whether both Semantic UI and MUI are needed — pick one | Medium | Medium |
| 15 | Upgrade `mongoose` 5 → 8+ (significant API changes) | Medium | Medium |
| 16 | Upgrade `socket.io` / `socket.io-client` to 4.8.x | Low | Medium |
| 17 | Assess `twitter-v2` viability; consider migrating to official X SDK or alternative | Medium | High |

### 11.4 Security Hardening

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 18 | Add input validation (Zod or Joi) for socket requests | Medium | High |
| 19 | Add authentication middleware (JWT or session-based) | Medium | High |
| 20 | Configure CORS for REST routes | Low | Medium |
| 21 | Add `helmet` middleware for security headers (CSP, HSTS, etc.) | Low | Medium |
| 22 | Move MongoDB config to environment variables | Low | Medium |
| 23 | Add rate limiting to REST routes (`express-rate-limit`) | Low | Medium |

### 11.5 Testing & Quality

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 24 | Set up test framework (Vitest or Jest) | Low | High |
| 25 | Write unit tests for Oracle/Context data transformation layer | Medium | High |
| 26 | Write unit tests for Entity/EntityCollection graph building | Medium | High |
| 27 | Write integration tests for Socket.IO event handling | Medium | Medium |
| 28 | Add React error boundaries to prevent white-screen crashes | Low | Medium |
| 29 | Add ESLint + Prettier configuration (current ESLint is v5, very outdated) | Medium | Medium |
| 30 | Enable `strict: true` in client tsconfig | Low | Medium |

### 11.6 Architecture Improvements

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 31 | Reduce singleton usage; introduce dependency injection container | High | High |
| 32 | Move socket handling out of `eventsGraph.tsx` (existing TODO) | Medium | Medium |
| 33 | Evaluate replacing custom observer system with Zustand, Jotai, or Redux Toolkit for simpler state | High | Medium |
| 34 | Break up `EventsGraph.ts` (890+ lines) into focused modules | Medium | Medium |
| 35 | Add structured logging (Winston or Pino) to replace console.log/table | Medium | Medium |

---

## 12. Modernization Roadmap

### Phase 1: Stabilize (1-2 weeks)
**Goal:** Make the project reliably buildable and installable on current Node versions.

- [ ] Add `.nvmrc` with Node 18 or 20 LTS
- [ ] Replace `awesome-typescript-loader` → `ts-loader`
- [ ] Replace `node-sass` → `sass`
- [ ] Replace `babel-polyfill` → `core-js/stable`
- [ ] Run `npm audit fix`
- [ ] Commit `package-lock.json`
- [ ] Add `server/` to `.gitignore`; rebuild from source
- [ ] Clean stale OlyCloud artifacts
- [ ] Verify full build (`npm run build` + `npm run server`) works on target Node

### Phase 2: Secure & Test (2-4 weeks)
**Goal:** Establish basic security and test coverage.

- [ ] Add `helmet` middleware
- [ ] Add socket request validation (Zod)
- [ ] Add authentication mechanism
- [ ] Configure CORS for all routes
- [ ] Set up Vitest/Jest
- [ ] Write tests for Oracle data transformation (Twitter entity → Graph node)
- [ ] Write tests for EntityCollection graph building
- [ ] Write tests for Socket.IO event handling
- [ ] Add React error boundaries
- [ ] Enable TypeScript strict mode on client

### Phase 3: Modernize Build (2-4 weeks)
**Goal:** Bring build toolchain to current standards.

- [ ] Migrate Webpack 4 → Vite (or Webpack 5)
- [ ] Upgrade TypeScript to 5.x
- [ ] Upgrade ESLint to 9.x with flat config
- [ ] Consolidate UI frameworks (MUI only or Semantic only)
- [ ] Replace `@material-ui/*` with `@mui/*` exclusively
- [ ] Upgrade `socket.io` to latest 4.x

### Phase 4: Upgrade Dependencies (2-4 weeks)
**Goal:** Bring all major dependencies to current versions.

- [ ] Upgrade React 17 → 18 (or 19 if stable)
- [ ] Upgrade Three.js 0.128 → latest
- [ ] Upgrade `3d-force-graph-vr` 1.x → 3.x (breaking changes expected)
- [ ] Upgrade `mongoose` 5 → 8+
- [ ] Upgrade `express` 4 → 5
- [ ] Assess Twitter/X API situation and update or replace `twitter-v2`
- [ ] Upgrade `aframe` 1.2 → 1.7

### Phase 5: Architecture (Ongoing)
**Goal:** Reduce complexity and improve maintainability.

- [ ] Introduce dependency injection
- [ ] Decompose `EventsGraph.ts`
- [ ] Evaluate observer pattern simplification
- [ ] Add structured logging
- [ ] Implement proper REST API for graph data (complement socket-based approach)
- [ ] Add CI/CD pipeline (GitHub Actions)
- [ ] Add Docker configuration for consistent development environments

---

*Generated by codebase analysis on April 14, 2026*
