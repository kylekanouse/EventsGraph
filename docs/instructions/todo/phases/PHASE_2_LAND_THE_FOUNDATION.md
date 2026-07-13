# Phase 2 — Land the Foundation (unbreak `master`)

**Destructive:** No (a merge; adds only)
**Prerequisite:** [Phase 1 — Preserve the Asset](PHASE_1_PRESERVE_THE_ASSET.md) — the `sylva-connector-final` tag must exist
**Next phase:** [Phase 3 — Excise the Connector](PHASE_3_EXCISE_THE_CONNECTOR.md)
**Parent:** [Sylva Removal Solutions Architecture](../SYLVA_REMOVAL_SOLUTION_ARCHITECTURE.md)

---

## Orientation

**EventsGraph** is a VR graph-visualization engine: a Node/TypeScript server maps
structured data onto graph nodes and links and streams it over Socket.IO to a React +
A-Frame/three.js VR client. **Sylva** (formerly *Trellis*) is one of its four **oracles**
— a read-only external data source — and we are deleting it.

The server follows a DDD layering: `domain/` holds contracts (interfaces + zod schemas,
no behavior), `lib/` holds shared implementation (`Entity`, `EntityCollection`, `Utils`,
`logger`), and `lib/repos/oracles/` holds the data sources. The dependency arrow runs
one way: `oracles → lib → domain`.

**This phase does not touch Sylva at all.** It exists to repair a *separate* pre-existing
defect that the removal work happens to sit on top of.

---

## Goal of this phase

Get the **shared-infrastructure fix onto `master` independently of the removal**, so that
if the removal is ever reverted, `master` still builds.

---

## The problem being fixed

**`master` does not currently build.** Its server typecheck fails immediately:

```
Trellis.ts(3,42): error TS2307: Cannot find module './TrellisConnectionManager'
Trellis.ts(8,34): error TS2307: Cannot find module './contexts/ContextAgentTopology'
index.ts(5,24):   error TS2307: Cannot find module './lib/logger'
```

**Root cause.** `.gitignore` contained an **unanchored** `server/` rule. In gitignore
semantics an unanchored pattern matches at *any* depth — so `server/` silently matched
`src/server/` as well as the intended compiled-output directory at the repo root. The
result: **~62 source files under `src/server/**` were never committed.** They existed only
on one developer's disk.

Among the files `master` is missing:

| File | Why it is load-bearing |
|---|---|
| `src/server/lib/logger.ts` | pino logger — imported by `index.ts`, `socket.ts`, the middlewares, and **every oracle** |
| `src/server/domain/schemas.ts` | the zod request schemas — imported by `socket.ts` for request validation |
| `src/server/domain/__tests__/schemas.test.ts` | test |
| `src/server/lib/__tests__/Entity.test.ts` | test |
| `src/server/lib/__tests__/EntityCollection.test.ts` | test |
| `src/server/lib/__tests__/Utils.test.ts` | test |
| `src/server/lib/repos/__tests__/EventsGraphDataRepo.test.ts` | test |
| `.gitignore` | the anchoring fix itself |

The `rename/trellis-to-sylva` branch fixed this in commit `5d4be46` — the rule is now
anchored to the repo root:

```gitignore
# Compiled server output (build from source) — anchored to repo root
# so it does NOT match src/server/ (the TypeScript sources).
/server/
!/server/.gitkeep
```

That branch is **green** (42 test files, 453 tests, both typechecks clean). `master` is not.

---

## ⚠️ Why this merge is load-bearing, and why the shortcut is a trap

**It is legitimate to feel that merging a rename you are about to delete is wasted motion.
It is not wasted, and the instinct to skip it is exactly the trap.**

The tempting shortcut is: *"don't merge, just revert the Sylva commits on master."*
Commit `5d4be46` bundles the Sylva sources **together with** the eight shared files above.

> **Reverting `5d4be46` to "undo Sylva" deletes `logger.ts` and `schemas.ts` and takes the
> server build down with it.**

This merge is the **only** thing that repairs the shared-infrastructure gap. Coupling that
repair to the removal PR would make both harder to review and impossible to revert
independently — which is precisely the property [Phase 3](PHASE_3_EXCISE_THE_CONNECTOR.md)
depends on.

### The route decision (already made)

| | **Route A — Merge, then remove ✅ TAKEN** | Route B — Cherry-pick, never merge |
|---|---|---|
| **How** | Merge `rename/trellis-to-sylva` → `master` as-is (it's green), then remove Sylva in a clean follow-up PR | Cherry-pick only the gitignore fix + 8 shared files onto `master`; never land the rename; delete Sylva |
| **Pro** | Linear, low-risk; each PR independently reviewable and revertable; baseline is a known-green tree | Avoids ~10k LOC of add-then-delete churn in history |
| **Con** | History briefly contains a rename of code that is then deleted | Requires commit surgery; high risk of leaving `master` broken; harder to review |
| **Verdict** | ✅ **The churn is cosmetic; correctness and reviewability dominate.** | ❌ Only if a hard "no dead code in history" policy exists. |

**This plan assumes Route A.** If someone proposes Route B mid-flight, they are proposing
commit surgery on the one commit that is load-bearing for the build. Say no.

---

## Preconditions

- [ ] Phase 1 complete: `git tag -l` shows `sylva-connector-final`
- [ ] `rename/trellis-to-sylva` is green (Phase 0 numbers: 42 files / 453 tests, both typechecks clean)
- [ ] Working tree clean

---

## Steps

### 1. Open the PR

```bash
git push -u origin rename/trellis-to-sylva     # the branch is currently unpushed
gh pr create --base master --head rename/trellis-to-sylva \
  --title "Anchor /server/ in .gitignore; land 60 orphaned src/server sources; rename Trellis→Sylva" \
  --body "Unbreaks master. See docs/instructions/todo/phases/PHASE_2_LAND_THE_FOUNDATION.md"
```

**In the PR description, state plainly that this merge's purpose is to unbreak `master`**,
and that the Sylva connector it lands will be removed in an immediately-following PR
(Phase 3). Reviewers who don't know that will reasonably object to merging ~10k LOC that
is about to be deleted.

If there is no remote / no `gh`, merge locally:

```bash
git checkout master
git merge --no-ff rename/trellis-to-sylva
```

### 2. Merge it

This lands, in one reviewable unit:
- the `.gitignore` anchoring fix,
- `src/server/lib/logger.ts` and `src/server/domain/schemas.ts`,
- the 5 shared test files,
- ~62 previously-orphaned `src/server` sources,
- and, incidentally, the Sylva rename and connector.

### 3. Verify `master` is green — for the first time

```bash
git checkout master
npx tsc --noEmit -p tsconfig.json          # expect: clean
npx tsc --noEmit -p tsconfig.server.json   # expect: clean  ← this previously FAILED
npx vitest run                             # expect: 42 files, 453 tests, 0 failures
```

The server typecheck passing on `master` is the headline result of this phase. It has not
passed before.

---

## Verification / Exit criteria

- [ ] `master` contains `src/server/lib/logger.ts` and `src/server/domain/schemas.ts`
- [ ] `.gitignore` on `master` has the **anchored** `/server/` rule
- [ ] `npx tsc --noEmit -p tsconfig.server.json` on `master` → **clean** (was failing)
- [ ] `npx tsc --noEmit -p tsconfig.json` on `master` → clean
- [ ] `npx vitest run` on `master` → **42 files / 453 tests, 0 failures**

Sanity-check the files actually landed:

```bash
git checkout master
test -f src/server/lib/logger.ts     && echo "logger  OK"
test -f src/server/domain/schemas.ts && echo "schemas OK"
grep -n "^/server/" .gitignore       # expect: the ANCHORED form, with a leading slash
```

---

## Rollback

Revert the merge commit.

Note this returns `master` to its **broken** state — which is the status quo ante, not a
regression. Nothing that worked before will stop working.

---

## Risks this phase addresses

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| **R1** | Removal by `git revert` destroys shared infra (`logger.ts`, `schemas.ts`, `.gitignore` fix) | Medium — it is the *intuitive* approach | **Critical** — server won't build | This phase lands the infra via a **merge**, so no later revert can take it out |
| **R5** | Merging a rename before deleting it feels wasteful, tempting a shortcut | Medium | High — the shortcut *is* R1 | This document explains why the merge is load-bearing |
| **R6** | `master` left broken if the removal is later reverted | Low | Medium | The infra fix lands in a **separate, independently-revertable** merge from the removal |

---

## What this phase explicitly does NOT do

- It does **not** remove Sylva. Not one line. That is [Phase 3](PHASE_3_EXCISE_THE_CONNECTOR.md).
- It does **not** touch `constants.ts` or `.env.example`. That is [Phase 4](PHASE_4_CLEAN_THE_SHARED_SURFACE.md).
- It does **not** rewrite the CHANGELOG. That is [Phase 5](PHASE_5_DOCUMENT.md).

Keeping this merge free of removal work is the entire point: it makes "did the deletion
break it?" and "did the infra fix break it?" two independently answerable questions.
