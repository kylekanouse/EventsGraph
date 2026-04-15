# Phase 0 — Pre-Flight (Foundation)

**Parent Document:** [SOLUTIONS_ARCHITECTURE.md](../SOLUTIONS_ARCHITECTURE.md)  
**Companion Document:** [CODEBASE_ANALYSIS.md](../CODEBASE_ANALYSIS.md)  
**Objective:** Establish a reproducible, clean-installable project baseline on Node 20 LTS.

---

## Guiding Principles (Apply to All Phases)

1. **No regressions.** Every phase ends with a working server + client. Validate with runtime tests before proceeding.
2. **Incremental delivery.** Each phase is independently committable and deployable.
3. **Minimal blast radius.** Group related changes; avoid mixing build changes with logic changes.
4. **Preserve architecture strengths.** The Oracle pattern, Entity system, and streaming model are well-designed. Modernize tooling around them, not through them.
5. **One problem at a time.** Do not combine dependency upgrades with refactors. Upgrade first, refactor second.

---

## Prerequisites

- Access to the EventsGraph repository
- Node.js 20 LTS installed (or nvm available)

---

## Tasks

### 0.1 Pin Node Version

Create `.nvmrc` in the project root:
```
20
```

Add `engines` field to `package.json`:
```json
"engines": {
  "node": ">=18.0.0 <21.0.0"
}
```

### 0.2 Fix `.gitignore`

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

### 0.3 Clean Stale Artifacts

Remove the entire `server/` compiled directory from git tracking:
```bash
git rm -r --cached server/
```

Remove stale OlyCloud references:
- `server/lib/repos/oracles/OlyCloud.js`
- `server/lib/repos/oracles/OlyCloud.js.map`
- `server/lib/repos/oracles/olycloud/` (entire directory)

### 0.4 Generate Fresh Lock File

```bash
rm -rf node_modules
npm install
# Commit the resulting package-lock.json
```

### 0.5 Fix Logger Middleware

**File:** `src/server/middlewares/logger.ts`

Remove `console.clear()` call. It wipes all server logs on every incoming request.

### 0.6 Move MongoDB Config to Environment Variables

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

Add corresponding entries to `src/server/.env.example`:
```
MONGODB_URL=localhost
MONGODB_PORT=27017
MONGODB_USERNAME=
MONGODB_PASSWORD=
MONGODB_COLLECTION=test
```

### 0.7 Rebuild Server from Source

```bash
npx tsc -p tsconfig.server.json
node server/
# Verify: "App listening on 8050"
```

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `.nvmrc` | Create | Node version pin |
| `.gitignore` | Modify | Add `server/`, remove `package-lock.json` |
| `package.json` | Modify | Add `engines` field |
| `src/server/configs.ts` | Modify | Env var support for MongoDB |
| `src/server/middlewares/logger.ts` | Modify | Remove `console.clear()` |
| `src/server/.env.example` | Modify | Add MongoDB env vars |
| `server/` | Delete from git | Remove tracked compiled output |

---

## Known Constraints

| Constraint | Detail |
|-----------|--------|
| `node-sass` binary | Breaks on Node >16. `npm install` may fail on node-sass — this is expected and fixed in Phase 1. |
| `awesome-typescript-loader` | Requires webpack 4. Addressed in Phase 1. |

---

## Verification Checkpoint

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

### Quick Smoke Test

```bash
# Server builds and starts
npx tsc -p tsconfig.server.json
node server/
# Expected: "App listening on 8050"
```

---

## Next Phase

Proceed to [Phase 1 — Stabilize Build Toolchain](./PHASE_1_STABILIZE_BUILD.md) after all checkpoints pass.
