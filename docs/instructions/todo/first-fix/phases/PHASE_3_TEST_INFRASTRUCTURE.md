# Phase 3 — Test Infrastructure

**Parent Document:** [SOLUTIONS_ARCHITECTURE.md](../SOLUTIONS_ARCHITECTURE.md)  
**Companion Document:** [CODEBASE_ANALYSIS.md](../CODEBASE_ANALYSIS.md)  
**Prerequisite:** [Phase 2 — Security Hardening](./PHASE_2_SECURITY_HARDENING.md) completed and verified.  
**Objective:** Establish a testing framework and write foundational tests for the highest-risk code paths.

---

## Guiding Principles (Apply to All Phases)

1. **No regressions.** Every phase ends with a working server + client. Validate with runtime tests before proceeding.
2. **Incremental delivery.** Each phase is independently committable and deployable.
3. **Minimal blast radius.** Group related changes; avoid mixing build changes with logic changes.
4. **Preserve architecture strengths.** The Oracle pattern, Entity system, and streaming model are well-designed. Modernize tooling around them, not through them.
5. **One problem at a time.** Do not combine dependency upgrades with refactors. Upgrade first, refactor second.

---

## Prerequisites

- Phase 2 completed (security middleware active, Zod validation in place)
- Server and client both functional

---

## Tasks

### 3.1 Install Test Framework

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

### 3.2 Priority Test Targets

Tests should cover the data transformation layer first — this is the most complex and most likely to break during upgrades.

#### Test Group 1: Server Utilities (`src/server/lib/Utils.ts`)

| Test Case | Description |
|-----------|-------------|
| `createNode()` | Produces valid `IGraphNode` |
| `createLink()` | Produces valid `IGraphLink` |
| `mergeGraphData()` | Combines nodes and links correctly |
| `removeDuplicatesFromGraphData()` | Deduplicates by ID |
| `safeText()` | Strips unsafe characters |
| `addNewLinesToWords()` | Formats labels correctly |
| `normalize()` | Scales values to 0-1 range |
| `buildResponse()` | Creates valid response envelope |

**File:** `src/server/lib/__tests__/Utils.test.ts`

#### Test Group 2: Entity System (`src/server/lib/Entity.ts`, `EntityCollection.ts`)

| Test Case | Description |
|-----------|-------------|
| `Entity.getGraphData()` | Returns node + optional link |
| `Entity.getLink()` | Creates correct source-target link |
| `EntityCollection.getGraphData()` with linear association | Linear node chain |
| `EntityCollection.getGraphData()` with central association | Hub-and-spoke pattern |
| `EntityCollection.getGraphData()` with no association | Independent nodes |
| `EntityCollection` deduplication | Merged graph data has no duplicates |

**File:** `src/server/lib/__tests__/Entity.test.ts`  
**File:** `src/server/lib/__tests__/EntityCollection.test.ts`

#### Test Group 3: Oracle Routing (`src/server/lib/repos/EventsGraphDataRepo.ts`)

| Test Case | Description |
|-----------|-------------|
| `findCollectionByID()` | Returns correct oracle |
| `findCollectionByID()` unknown ID | Returns undefined |
| `getData()` | Delegates to correct collection |
| `getDataStream()` | Delegates to streamable context |
| `getCollectionIDs()` | Returns all registered collections |

**File:** `src/server/lib/repos/__tests__/EventsGraphDataRepo.test.ts`

#### Test Group 4: Socket Request Validation

| Test Case | Description |
|-----------|-------------|
| Valid request passes Zod schema | All required fields present |
| Missing collection field fails | Required field validation |
| Invalid `isStream` type fails | Type validation |
| Empty string collection fails | Min length validation |

**File:** `src/server/domain/__tests__/schemas.test.ts`

### 3.3 Enable TypeScript Strict Mode on Client

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

---

## Files Changed

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

---

## New Dependencies

| Package | Version | Type | Purpose |
|---------|---------|------|---------|
| `vitest` | ^3.0.0 | dev | Test runner (compatible with Vite ecosystem) |
| `@vitest/coverage-v8` | latest | dev | Coverage reporting |

---

## Coverage Targets

| Module | Target Coverage |
|--------|----------------|
| `src/server/lib/Utils.ts` | >80% |
| `src/server/lib/Entity.ts` | >70% |
| `src/server/lib/EntityCollection.ts` | >70% |
| `src/server/lib/repos/EventsGraphDataRepo.ts` | >60% |
| `src/server/domain/schemas.ts` | >90% |

---

## Verification Checkpoint

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

### Quick Smoke Test

```bash
npm test
# Expected: All test suites pass

npm run test:coverage
# Expected: Coverage report generated, targets met

npm run build
npm run server
# Expected: "App listening on 8050" — no regressions
```

---

## Next Phase

Proceed to [Phase 4 — Dependency Modernization](./PHASE_4_DEPENDENCY_MODERNIZATION.md) after all checkpoints pass.
