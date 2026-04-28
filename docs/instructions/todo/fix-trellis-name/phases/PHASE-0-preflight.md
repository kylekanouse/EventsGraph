# Phase 0 — Preflight

> **Parent plan:** [PLAN.md](../PLAN.md)
> **Branch:** `rename/trellis-to-sylva`
> **Status:** not started
> **Depends on:** nothing
> **Unblocks:** Phase 1

---

## 1. Purpose

Establish a known-good baseline before any rename work begins. This
phase makes **zero code changes**. Its job is to confirm decisions,
capture the current green state of lint + tests, and create the
working branch.

The overall initiative renames the legacy **"Trellis"** integration
in `eventsgraph` to **"Sylva"** (Latin for *forest / woodland*) to
align with a broader forest/woodland naming convention. The rename
is purely cosmetic — REST contracts, graph shapes, and oracle
responsibilities are unchanged.

---

## 2. Decisions to confirm with the owner

These choices affect compatibility with deployed clients and
running infrastructure. **Do not start Phase 1 until D1, D2, D5,
and D6 have written answers.** D3 and D4 have safe defaults.

| # | Decision | Default proposal | Risk if skipped |
| --- | --- | --- | --- |
| D1 | Wire `COLLECTION_ID` value (`'trellis'`) — exposed in socket.io requests like `{ collection: 'trellis', context: '...' }` | Defer; flip in Phase 5 with one-release alias | External clients/scripts referencing `collection: 'trellis'` will break if flipped without alias |
| D2 | Env var names (`TRELLIS_*`) | Rename to `SYLVA_*` with backwards-compat fallback that still reads `TRELLIS_*` and emits a deprecation warning | Operators must update deployment configs |
| D3 | DID value `did:pcn:service:eventsgraph` in `.env.example` | Unchanged (unrelated to Trellis branding) | n/a |
| D4 | Upstream API paths (`/api/auth/token`, `/health`, etc.) | Unchanged; this rename is local naming only | If upstream is also rebranding, schedule follow-up |
| D5 | Folder naming style | snake-case folder `sylva/`, PascalCase classes `Sylva*`, SCREAMING_SNAKE constants `SYLVA_*` | Inconsistency across files |
| D6 | Git history | Use `git mv` for all file renames so blame/log is preserved | Loss of history |

Record the answers at the bottom of this file under §6 before exiting
the phase.

---

## 3. Steps

1. Confirm decisions D1–D6 with the owner; record answers in §6.
2. Ensure clean git working tree on `master`:
   ```bash
   git status            # must report "nothing to commit, working tree clean"
   git rev-parse --abbrev-ref HEAD   # must print "master"
   ```
3. Pull latest:
   ```bash
   git pull --ff-only
   ```
4. Capture baseline green state:
   ```bash
   npm run lint
   npm test
   ```
   Save the test summary (suite count, passing count) in §6.
5. Create and switch to the working branch:
   ```bash
   git checkout -b rename/trellis-to-sylva
   ```

> ⚠️ **Do NOT commit.** This phase produces no code changes.

---

## 4. Exit criteria

- [ ] Decisions D1–D6 recorded in §6 with the owner's answers.
- [ ] `git status` clean on branch `rename/trellis-to-sylva`.
- [ ] `npm run lint` exits 0.
- [ ] `npm test` exits 0; baseline counts captured in §6.

---

## 5. Risk register (this phase)

| Risk | Mitigation |
| --- | --- |
| Baseline tests already failing | Stop. Do not start Phase 1; the rename will mask failures. Open an issue for the failing tests first. |
| Working tree dirty | Stash or commit unrelated work to its own branch first. |

---

## 6. Notes (fill in during execution)

- D1 answer: **Flip now hard, no alias (breaking).** Wire-level `COLLECTION_ID` will change from `'trellis'` to `'sylva'` in Phase 5 with no backwards-compat alias. External clients/scripts referencing `collection: 'trellis'` will need to be updated in lockstep.
- D2 answer: **Rename to `SYLVA_*` hard (breaking).** No `TRELLIS_*` fallback; deployment configs must be updated when this lands.
- D3 answer: **Keep unchanged.** `did:pcn:service:eventsgraph` is unrelated to Trellis branding.
- D4 answer: **Keep unchanged.** Upstream API paths (`/api/auth/token`, `/health`, etc.) are not part of this rename.
- D5 answer: **Approved as proposed.** snake-case folder `sylva/`, PascalCase classes `Sylva*`, SCREAMING_SNAKE constants `SYLVA_*`.
- D6 answer: **No `git mv`.** Renames may be performed without preserving git blame/log history.
- Baseline lint result: **`npm run lint` exit 0** — 0 errors, 118 pre-existing warnings (unrelated to rename).
- Baseline test result (suites / tests passing): **`npm test` exit 0** — 42/42 test files passing, 453/453 tests passing. *Note: 2 stale tests in `src/client/lib/__tests__/NodeInteractionManager.test.ts` were initially failing (`runs raycasting in scene-focus mode`, `fires in scene-focus mode`) due to source guards added without test updates (`mouseTracked` flag and canvas-only click guard). These were repaired in this phase as a precondition; the fix is unrelated to the Trellis→Sylva rename and should be reviewed/committed separately.*
- Branch created at commit: **`04ad496`** — branch `rename/trellis-to-sylva` (off `master`).
