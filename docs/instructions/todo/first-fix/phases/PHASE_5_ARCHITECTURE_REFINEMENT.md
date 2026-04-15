# Phase 5 — Architecture Refinement

**Parent Document:** [SOLUTIONS_ARCHITECTURE.md](../SOLUTIONS_ARCHITECTURE.md)  
**Companion Document:** [CODEBASE_ANALYSIS.md](../CODEBASE_ANALYSIS.md)  
**Prerequisite:** [Phase 4 — Dependency Modernization](./PHASE_4_DEPENDENCY_MODERNIZATION.md) completed and verified.  
**Objective:** Reduce complexity and improve maintainability. These are optional improvements, prioritized by impact.

---

## Guiding Principles (Apply to All Phases)

1. **No regressions.** Every phase ends with a working server + client. Validate with runtime tests before proceeding.
2. **Incremental delivery.** Each phase is independently committable and deployable.
3. **Minimal blast radius.** Group related changes; avoid mixing build changes with logic changes.
4. **Preserve architecture strengths.** The Oracle pattern, Entity system, and streaming model are well-designed. Modernize tooling around them, not through them.
5. **One problem at a time.** Do not combine dependency upgrades with refactors. Upgrade first, refactor second.

---

## Prerequisites

- Phase 4 completed (all dependencies modernized, Vite, React 18, Three.js upgraded)
- All Phase 3 tests passing
- Full end-to-end functionality verified

---

## Tasks

### 5.1 Decompose `EventsGraph.ts` (890+ lines)

Split the monolithic orchestrator into focused modules:

| New File | Responsibility | Approx Size |
|----------|---------------|-------------|
| `src/client/lib/EventsGraph.ts` | Core orchestrator (reduced) | ~200 lines |
| `src/client/lib/SceneManager.ts` | Three.js scene, camera, renderer lifecycle | extracted |
| `src/client/lib/NodeInteractionManager.ts` | Click, hover, focus, activate handlers | extracted |
| `src/client/lib/VRControlManager.ts` | VR button rendering, raycast intersection | extracted |
| `src/client/lib/AudioManager.ts` | Audio listener, sound management | extracted |
| `src/client/lib/StreamProgressManager.ts` | Stream progress tracking, loader updates | extracted |

**Approach:**
1. Extract one module at a time
2. Run tests after each extraction
3. Maintain the same public API on `EventsGraph` — it delegates to sub-managers
4. Do not change behavior, only structure

### 5.2 Move Socket Handling Out of Component

Address the existing TODO in `eventsGraph.tsx`. Currently the React component directly emits/listens to socket events.

**Target:** Service layer manages socket, component subscribes to data.

**File:** `src/client/lib/GraphDataService.ts` (new)

```typescript
// GraphDataService manages Socket.IO connection, emit/listen, request queue
// Component becomes a consumer:

const dataService = new GraphDataService(socket)
dataService.onGraphData((response) => { /* update graph */ })
dataService.onGraphStream((response) => { /* update graph */ })
dataService.requestData(request)
```

The component (`eventsGraph.tsx`) becomes a thin consumer that wires the service to the graph renderer.

### 5.3 Add Structured Logging

```bash
npm install pino
npm install --save-dev pino-pretty
```

Replace all `console.log`, `console.table`, `console.error` calls with Pino logger:

**File:** `src/server/lib/logger.ts` (new)

```typescript
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty' }
    : undefined,
})
```

**Migration approach:**
- Replace `console.log(...)` with `logger.info(...)`
- Replace `console.error(...)` with `logger.error(...)`
- Replace `console.table(...)` with `logger.info({ data: ... }, 'table output')`
- Remove any remaining `console.clear()` calls

### 5.4 Add ESLint 9 + Prettier

**Install:**

```bash
npm install --save-dev eslint@^9.0.0 @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser prettier eslint-config-prettier
```

**Remove old packages:**

```bash
npm uninstall eslint eslint-config-airbnb eslint-config-airbnb-base \
  eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react babel-eslint
```

**File:** `eslint.config.mjs` (new, flat config format)

Create ESLint 9 flat config with TypeScript support, Prettier integration, and rules appropriate for the project.

**File:** `.prettierrc` (new)

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

**Add scripts to `package.json`:**
```json
"lint": "eslint src/",
"lint:fix": "eslint src/ --fix",
"format": "prettier --write src/"
```

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `src/client/lib/EventsGraph.ts` | Modify | Reduce to core orchestrator (~200 lines) |
| `src/client/lib/SceneManager.ts` | Create | Extracted from EventsGraph |
| `src/client/lib/NodeInteractionManager.ts` | Create | Extracted from EventsGraph |
| `src/client/lib/VRControlManager.ts` | Create | Extracted from EventsGraph |
| `src/client/lib/AudioManager.ts` | Create | Extracted from EventsGraph |
| `src/client/lib/StreamProgressManager.ts` | Create | Extracted from EventsGraph |
| `src/client/lib/GraphDataService.ts` | Create | Socket abstraction layer |
| `src/client/components/eventsGraph.tsx` | Modify | Use GraphDataService instead of direct socket |
| `src/server/lib/logger.ts` | Create | Pino structured logger |
| `src/server/**/*.ts` | Modify | Replace console.* with logger.* |
| `eslint.config.mjs` | Create | Flat ESLint 9 config |
| `.prettierrc` | Create | Prettier config |
| `package.json` | Modify | Add lint/format scripts, new dependencies |

---

## New Dependencies

| Package | Version | Type | Purpose |
|---------|---------|------|---------|
| `pino` | ^9.0.0 | prod | Structured logging |
| `pino-pretty` | latest | dev | Dev-mode log formatting |
| `eslint` | ^9.0.0 | dev | Linting (replaces ESLint 5) |
| `@typescript-eslint/eslint-plugin` | latest | dev | TypeScript lint rules |
| `@typescript-eslint/parser` | latest | dev | TypeScript ESLint parser |
| `prettier` | latest | dev | Code formatting |
| `eslint-config-prettier` | latest | dev | Disable ESLint rules that conflict with Prettier |

### Removed Dependencies

| Package | Reason |
|---------|--------|
| `eslint` (5.x) | Replaced by ESLint 9.x |
| `eslint-config-airbnb` | Replaced by flat config |
| `eslint-config-airbnb-base` | Replaced by flat config |
| `eslint-plugin-import` | Replaced by flat config |
| `eslint-plugin-jsx-a11y` | Replaced by flat config |
| `eslint-plugin-react` | Replaced by flat config |

---

## Verification Checkpoint

```
- [ ] EventsGraph.ts is <300 lines with focused sub-modules
- [ ] Socket handling is in service layer, not in React component
- [ ] Structured logging active (pino output in dev, JSON in prod)
- [ ] ESLint passes on full codebase
- [ ] Prettier formatting applied consistently
- [ ] All tests still pass
- [ ] Full end-to-end functionality preserved
```

### Quick Smoke Test

```bash
npm run lint
# Expected: No lint errors

npm test
# Expected: All tests pass

npm run build
npm run server
# Expected: "App listening on 8050" — pino-formatted logs in dev

open http://localhost:8050
# Expected: 3D graph renders, all interactions work, no console errors
```

---

## Final Verification Matrix

After completing all phases, the full system should pass every checkpoint:

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

## Project Complete

After Phase 5, the EventsGraph codebase is:
- Installable and buildable on Node 20 LTS
- Secured with helmet, CORS, rate limiting, and Zod validation
- Tested with Vitest (server-side coverage)
- Running modern dependencies (React 18, TS 5, Vite 6, Three.js 0.170+, Mongoose 8)
- Structured with focused modules and structured logging
- Linted and formatted with ESLint 9 + Prettier
