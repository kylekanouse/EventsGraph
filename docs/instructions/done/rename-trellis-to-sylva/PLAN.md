# Trellis → Sylva Rename Plan

> **Goal:** Replace every reference to the legacy "Trellis" name with the
> new project name **"Sylva"** (Latin for *forest / woodland*) across the
> EventsGraph codebase.
>
> **Generated:** 2026-04-27

---

## 1. Background & scope

The integration formerly known as **Trellis** (a "lattice/garden frame"
metaphor) is being renamed to **Sylva** to align with a broader
forest/woodland naming convention. This rename is purely cosmetic
from the data-model perspective — the REST contract surfaces, graph
shapes, and oracle responsibilities are unchanged. What changes is
**naming, identifiers, environment variables, log strings, and the
folder layout**.

This codebase (`eventsgraph`) integrates with the upstream
service via:

- An HTTP connection manager (`TrellisConnectionManager`) that hits
  `${BASE_URL}/api/auth/token`, `/health`, and other endpoints.
- A set of "context" providers under
  `src/server/lib/repos/oracles/trellis/contexts/` that map upstream
  payloads to graph data.
- An Oracle entry point (`Trellis`) registered with the
  `EventsGraphDataRepo`.

There is **no** Trellis-related code in the client (`src/client/`).
The compiled `server/` directory is git-ignored (built from
`src/server/`), so all renames happen at the source level and the
build will regenerate the JS automatically.

---

## 2. Inventory of references

Scope: `src/`, `.env.example`, `docs/`. Compiled output (`server/`)
and `coverage/` are derived artifacts and excluded.

### 2.1 Files / directories (67 .ts source files)

| Area | Path | Action |
| --- | --- | --- |
| Oracle root file | `src/server/lib/repos/oracles/trellis/Trellis.ts` | rename file → `Sylva.ts`, rename class → `Sylva` |
| Oracle folder | `src/server/lib/repos/oracles/trellis/` | rename → `sylva/` |
| Connection manager | `TrellisConnectionManager.ts` (+ `.test.ts`) | rename → `SylvaConnectionManager.ts`; rename class & all imports |
| Event bridge | `TrellisEventBridge.ts` (+ `.test.ts`) | rename → `SylvaEventBridge.ts`; rename class |
| Types | `trellis/types.ts` | rename interfaces (`TrellisAuthResponse`, `TrellisGPA`, `TrellisChannel`, `TrellisParticipant`, `TrellisChannelMember`, plus their `*ListResponse` variants) |
| Services (8 files) | `services/Trellis*.ts` | rename files & classes (`TrellisObservabilityClient`, `TrellisAnalyticsService`, `TrellisSnapshotCache`, `TrellisGraphDiff`, `TrellisGraphSearch`, `TrellisSubgraphExtractor`, `TrellisNodeDetail`, `TrellisCrossContextNav`) |
| Contexts (14 files) | `contexts/Context*.ts` | filenames already neutral; only update imports & internal class refs to `Sylva*` |
| Mappers (9 files) | `mappers/*.mapper.ts` | filenames already neutral; only update internal type refs / comments |
| Tests (32 files) | `__tests__/**` | rename `Trellis*` test filenames; update all imports |

### 2.2 Cross-cutting source touchpoints (3 files)

| File | Lines | What |
| --- | --- | --- |
| `src/server/constants.ts` | 164–182 | `TRELLIS_COLLECTION_ID` and 14 `TRELLIS_*_CONTEXT_ID` constants |
| `src/server/lib/repos/EventsGraphDataRepo.ts` | 8, 51, 52 | `import Trellis from './oracles/trellis/Trellis'`, `process.env.TRELLIS_ENABLED`, registration |
| `.env.example` | 5–10 | `TRELLIS_ENABLED`, `TRELLIS_BASE_URL`, `TRELLIS_DID`, `TRELLIS_WORKSPACE_ID`, `TRELLIS_PARTICIPANT_NAME` |

### 2.3 User-facing strings (operator/log)

- `Trellis Oracle: initialized with advanced features support (Phase 6)`
- `Trellis: authenticated successfully`
- `Trellis: received 401, re-authenticating`
- `Trellis: token refresh failed`
- `Trellis auth failed: …`
- JSDoc comments referring to "Trellis API", "Trellis instance", etc.

### 2.4 Out-of-scope (intentional, see §3)

- `server/**` — git-ignored compiled output; will regenerate on build.
- `coverage/**` — generated.
- `node_modules/**` — third-party.
- The string literal `'trellis'` used as the **wire-level
  collection ID** (`TRELLIS_COLLECTION_ID = 'trellis'`) — see §3.

---

## 3. Decisions required from owner

The following are **not technical blockers** but are choices that
affect compatibility with deployed clients / running infrastructure.
Defaults are listed; please confirm or override.

| # | Decision | Default proposal | Risk if changed |
| --- | --- | --- | --- |
| D1 | **Wire `COLLECTION_ID`** value (`'trellis'`) — exposed in socket.io requests like `{ collection: 'trellis', context: '...' }` | Change to `'sylva'` | Any external client/script referencing `collection: 'trellis'` will break. Recommend dual-accept (alias) for one release. |
| D2 | **Env var names** (`TRELLIS_*`) | Rename to `SYLVA_*`, with backwards-compat fallback that still reads `TRELLIS_*` and emits a deprecation warning | Operators must update deployment configs. Fallback removes urgency. |
| D3 | **DID value** `did:pcn:service:eventsgraph` in `.env.example` | Unchanged (unrelated to Trellis branding) | n/a |
| D4 | **Upstream API paths** (`/api/auth/token`, `/health`, etc.) | Unchanged; this rename is local naming only | If upstream service is *also* rebranding its API, a follow-up task is needed. |
| D5 | **Folder naming style** | snake-case folder `sylva/`, PascalCase classes `Sylva*`, SCREAMING_SNAKE constants `SYLVA_*` | Consistent with current repo conventions. |
| D6 | **Git history** | Use `git mv` for all file renames so blame/log is preserved | Always desirable. |

> ⚠️ Until D1 and D2 are confirmed, the implementation should default
> to **non-breaking changes only** (rename internals + add backwards
> compat) and keep the wire ID + env var names as today, gated behind
> a TODO.

---

## 4. Execution plan (phased, reviewable)

Each phase compiles + tests cleanly. Stop and verify between phases.

### Phase 0 — Preflight

- [ ] Confirm decisions D1–D6 with owner.
- [ ] Ensure clean git working tree on `master`.
- [ ] Run baseline: `npm run lint && npm test` — capture green state.
- [ ] Create branch `rename/trellis-to-sylva`.

### Phase 1 — Internal class & file renames (no behavior change)

Goal: every TypeScript identifier and filename uses `Sylva*`.
Wire IDs and env vars unchanged.

1. `git mv src/server/lib/repos/oracles/trellis src/server/lib/repos/oracles/sylva`
2. Within `sylva/`, `git mv` each file:
   - `Trellis.ts` → `Sylva.ts`
   - `TrellisConnectionManager.ts` → `SylvaConnectionManager.ts`
   - `TrellisEventBridge.ts` → `SylvaEventBridge.ts`
   - `services/Trellis*.ts` (8 files) → `services/Sylva*.ts`
   - `__tests__/Trellis*.test.ts` and `__tests__/services/Trellis*.test.ts` → `Sylva*.test.ts`
3. Inside the moved files, find/replace identifiers:
   - Class / interface names: `Trellis` → `Sylva` (PascalCase boundaries)
   - JSDoc + inline comments containing "Trellis"
   - Imports updated to new file paths
4. Update consumers outside the folder:
   - `src/server/lib/repos/EventsGraphDataRepo.ts` —
     `import Trellis from './oracles/trellis/Trellis'`
     →
     `import Sylva from './oracles/sylva/Sylva'`
     and the 2 references in `_buildOracles()`.
5. `npm run lint` then `npm test`. Expect all 32 oracle tests to pass.
6. Commit: `REFACTORED: Rename Trellis classes/files to Sylva`.

### Phase 2 — Constant renames (TS-level, wire ID still 'trellis')

1. In `src/server/constants.ts` rename declarations:
   - `TRELLIS_COLLECTION_ID` → `SYLVA_COLLECTION_ID`
   - All 14 `TRELLIS_*_CONTEXT_ID` → `SYLVA_*_CONTEXT_ID`
   - **Keep the string literal values unchanged** for now (D1 still
     deferred): `SYLVA_COLLECTION_ID: string = 'trellis'`. Add a
     `// TODO(rename-D1): change wire ID to 'sylva' once clients updated`.
2. Update all references in `sylva/Sylva.ts`, contexts, and tests
   (`constants.TRELLIS_*` → `constants.SYLVA_*`).
3. `npm run lint && npm test`.
4. Commit: `REFACTORED: Rename TRELLIS_* constants to SYLVA_*`.

### Phase 3 — Log / operator string updates

1. Rewrite log messages in `Sylva.ts`, `SylvaConnectionManager.ts`,
   `SylvaEventBridge.ts`, services, and any `logger.*` callers in
   the `sylva/` tree:
   - `Trellis Oracle:` → `Sylva Oracle:`
   - `Trellis: authenticated…` → `Sylva: authenticated…`
   - `Trellis auth failed` → `Sylva auth failed`
   - etc.
2. Re-run any tests that assert on log strings (search the
   `__tests__/` tree for matching assertions before editing).
3. Commit: `UPDATED: Replace operator-facing 'Trellis' strings with 'Sylva'`.

### Phase 4 — Environment variables (with backwards-compat shim)

1. Update `.env.example`:
   ```
   # Sylva Connector (formerly Trellis)
   SYLVA_ENABLED=true
   SYLVA_BASE_URL=http://localhost:3100
   SYLVA_DID=did:pcn:service:eventsgraph
   SYLVA_WORKSPACE_ID=default
   SYLVA_PARTICIPANT_NAME=EventsGraph VR
   ```
2. In `SylvaConnectionManager.ts` and any other env consumers,
   read **`SYLVA_*` first, fall back to `TRELLIS_*`** with a
   one-time `logger.warn()`. Example pattern:
   ```ts
   const baseUrl =
     process.env.SYLVA_BASE_URL
     ?? process.env.TRELLIS_BASE_URL
     ?? 'http://localhost:3100'
   if (!process.env.SYLVA_BASE_URL && process.env.TRELLIS_BASE_URL) {
     logger.warn('SYLVA: TRELLIS_BASE_URL is deprecated, use SYLVA_BASE_URL')
   }
   ```
3. Same for `EventsGraphDataRepo.ts` (`SYLVA_ENABLED`).
4. Update local `src/server/.env` (not committed; user-managed) —
   leave a note in commit body: *"users should rename TRELLIS_* env
   vars to SYLVA_*; legacy names still work but will be removed in
   a future release."*
5. Commit: `UPDATED: Migrate Trellis env vars to Sylva (with backwards-compat fallback)`.

### Phase 5 — Wire collection ID flip (gated by D1)

> Only execute once D1 is confirmed.

1. Change `SYLVA_COLLECTION_ID` value: `'trellis'` → `'sylva'`.
2. **Add alias support** in the oracle/repo registration so
   incoming requests with `collection: 'trellis'` still route to
   the same Sylva oracle (one-release deprecation period). Emit
   a `logger.warn` per request with the legacy collection name.
3. Update any client/test fixtures that hard-code `'trellis'`
   (search: `grep -rn "'trellis'\\|\"trellis\"" src/`).
4. Commit: `UPDATED: Switch wire collection id from 'trellis' to 'sylva' (with legacy alias)`.

### Phase 6 — Documentation & cleanup

1. Update `README.md` if/when it gains a Sylva section (currently
   no docs reference Trellis).
2. Move/rename this plan once complete:
   `docs/instructions/todo/fix-trellis-name/` →
   `docs/instructions/done/rename-trellis-to-sylva/`.
3. Remove `prompt.txt` once the work is shipped.
4. Add a `CHANGELOG`/release-notes entry covering env var migration,
   deprecation timeline for `TRELLIS_*` and `collection: 'trellis'`.

### Phase 7 — Removal of compatibility shim (future release)

After at least one release cycle:

- Remove `TRELLIS_*` env var fallbacks in `SylvaConnectionManager`
  and `EventsGraphDataRepo`.
- Remove the `'trellis'` collection alias.
- Bump major version per semver.

---

## 5. Find/replace cheatsheet

Run inside the `sylva/` folder (after Phase 1 step 1) and on
the cross-cutting files. **Always preview with `git diff` before
committing.**

```bash
# Identifier renames (PascalCase, scoped to TS sources)
rg -l '\bTrellis' src/ | xargs sed -i '' 's/\bTrellis\b/Sylva/g'

# Constant renames (Phase 2 only)
rg -l '\bTRELLIS_' src/ | xargs sed -i '' 's/\bTRELLIS_/SYLVA_/g'

# Wire string flip (Phase 5 only — review carefully)
rg -n "['\"]trellis['\"]" src/
```

**Caveats:**
- Do not blanket-rename inside `node_modules/`, `coverage/`,
  `server/` (build output), or `dist/`.
- Watch for `Trellis` substrings inside larger words (none expected
  in this repo, but verify with `rg 'trellis[A-Za-z]'`).
- Comments referencing the upstream **service brand** ("the Trellis
  REST API") may be intentional historical context — update to
  "Sylva (formerly Trellis)" on first occurrence in each file.

---

## 6. Verification checklist

After each phase:

- [ ] `npm run lint` clean
- [ ] `npm test` — all suites green (especially `src/server/lib/repos/oracles/sylva/__tests__/**`)
- [ ] `npm run server` starts without errors; observe log line
      `Sylva Oracle: initialized…` instead of `Trellis Oracle: …`
- [ ] `npm run dev` end-to-end: client at http://localhost:3001
      successfully loads a graph context (e.g. `agent-topology`)
      via the renamed Sylva oracle
- [ ] `grep -rn 'Trellis\|TRELLIS\|trellis' src/` returns only
      intentional references (deprecation warnings, "formerly Trellis"
      doc strings)
- [ ] Build succeeds: `npm run build` and `tsc -p tsconfig.server.json`

---

## 7. Risk register

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Breaking external clients that send `collection: 'trellis'` | Medium | D1 alias for one release |
| Deployment env files still contain `TRELLIS_*` | High | D2 fallback with warning |
| Tests asserting on log strings break silently | Medium | Phase 3 is committed separately so failures are isolated |
| Search/replace catches an unrelated `trellis` substring | Low | Repo-wide `rg` showed no other `trellis` text outside the documented files |
| Compiled `server/` output drifts | None | `server/` is git-ignored; rebuilt from source |
| Map files (`*.js.map`) under `server/` reference old paths | None | Regenerated on next `tsc` build |

---

## 8. Effort summary

- **~67** TypeScript source files renamed/edited inside the `trellis/`
  folder.
- **3** cross-cutting files edited (`constants.ts`,
  `EventsGraphDataRepo.ts`, `.env.example`).
- **0** client-side files affected.
- **0** docs (markdown) currently reference Trellis (besides this
  plan and the originating `prompt.txt`).
- Phases 1–4 are mechanical and safe; Phase 5 is the only behavioral
  change and is feature-flagged behind a one-line constant value.

---

## 9. Open questions for owner

1. **Decision D1** — When can we flip the wire `collection` id?
2. **Decision D2** — How long do we maintain `TRELLIS_*` env var
   fallbacks?
3. Is the **upstream service itself** also being rebranded
   (i.e. will its REST endpoints, DID strings, or auth token
   payloads change)? If yes, schedule a follow-up task.
4. Any **external integrators** (other PCN services, dashboards)
   referencing the `trellis` collection that we should notify?
