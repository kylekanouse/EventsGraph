# Trellis → Sylva Rename — Final Cleanup

> **Parent plan:** [PLAN.md](./PLAN.md)
> **Branch:** `rename/trellis-to-sylva`
> **Status:** code complete, uncommitted; awaiting commit + archive
> **Generated:** 2026-04-28

---

## 1. Current state assessment

### 1.1 What is already done (in the working tree, uncommitted)

- **Phase 1 (identifiers/files):** complete. `oracles/trellis/`
  no longer exists. All 67 source files renamed; class names,
  imports, test descriptors all `Sylva*`.
- **Phase 2 (constants):** complete in
  [src/server/constants.ts](../../../src/server/constants.ts).
  `SYLVA_COLLECTION_ID` and all 14 `SYLVA_*_CONTEXT_ID` exist
  with their original string values intact (except the
  collection id, which was also flipped — see Phase 5).
- **Phase 3 (logs/strings):** complete. Startup log emits
  `Sylva Oracle: initialized with advanced features support (Phase 6)`
  (verified by test run output).
- **Phase 4 (env vars):** complete with shims.
  - [.env.example](../../../.env.example) advertises `SYLVA_*` only.
  - [SylvaConnectionManager.ts](../../../src/server/lib/repos/oracles/sylva/SylvaConnectionManager.ts)
    has a local `readSylvaEnv()` helper that reads `SYLVA_<X>` first,
    falls back to `TRELLIS_<X>`, and emits
    `SYLVA: TRELLIS_<X> is deprecated, use SYLVA_<X>`.
  - [EventsGraphDataRepo.ts](../../../src/server/lib/repos/EventsGraphDataRepo.ts)
    applies the same fallback for `TRELLIS_ENABLED → SYLVA_ENABLED`.
- **Phase 5 (wire id flip):** **partially complete — no alias.**
  - `SYLVA_COLLECTION_ID` value is now `'sylva'` (flipped).
  - **No** `SYLVA_COLLECTION_ID_LEGACY = 'trellis'` constant exists.
  - **No** alias routing in `EventsGraphDataRepo._buildOracles()`
    for the legacy `'trellis'` collection id.
  - This matches Phase 0 §6 decision **D1 = "Flip now hard, no
    alias (breaking)"**, which overrides the original PHASE-5 spec.
- **Validation:**
  - `npm run lint` → 0 errors, 118 warnings (all pre-existing,
    unchanged from baseline).
  - `npm test` → 42 files / **454 tests** passing
    (baseline 42 / 453; +1 new `SylvaConnectionManager.test.ts`).

### 1.2 Deviations from PLAN.md to be aware of

| # | Plan said | Actual code | Reason / source |
| --- | --- | --- | --- |
| 1 | One commit per phase (1–5) | All phases sit unstaged/staged in **one** mixed working tree | Work was done in a single sweep; never committed |
| 2 | `git mv` for renames so blame is preserved (D6 in plan) | D6 in Phase 0 §6 was answered **"No `git mv`"**; some files show as `R` in git status, others as `D + A` | Owner override in Phase 0 |
| 3 | Phase 4 env vars should have backwards-compat shim (D2) | Phase 0 §6 D2 was answered **"Rename hard (breaking), no fallback"**; actual code **does include** the `TRELLIS_*` fallback + warning | Code matches the original PHASE-4 spec, not the D2 override. Treat the shim as kept. |
| 4 | Phase 5 should ship a `'trellis'` collection alias | No alias; D1 = "Flip now hard, no alias" | Code matches D1 |
| 5 | PHASE-5 §3 step 2 says add `TODO(rename-D1)` removal | No such TODO ever landed (Phase 2 was never split out) | n/a — both halves done in one go |

> **Action item for the owner:** confirm whether the Phase 4
> env-var shims should **stay** (current state) or be **removed**
> to honor D2's "hard breaking" decision. The cleanup steps below
> default to **keep the shims**, since their presence is
> low-risk and aids operator migration. If you want them gone,
> add the deletion to commit C2 below.

### 1.3 What is NOT done

- [ ] Nothing is committed. Branch `rename/trellis-to-sylva`
      sits at `36b5388` (Phase 0 docs only) with all rename
      changes in the working tree.
- [ ] No `CHANGELOG.md` or release-notes entry.
- [ ] Planning folder still at
      `docs/instructions/todo/fix-trellis-name/`; not archived.
- [ ] `prompt.txt` still in the planning folder.
- [ ] Phase 7 cleanup is **not applicable** for the wire id
      (no alias to remove). Still applicable for the env-var
      shims if §1.2 row 3 stays as "keep".

---

## 2. Cleanup checklist (do these in order)

```
- [ ] C0: Confirm shim policy (§1.2 row 3) before commits
- [ ] C1: Stage and commit code changes
- [ ] C2: (optional) Remove env-var shims if D2 is being honored
- [ ] C3: Add CHANGELOG.md
- [ ] C4: Audit user-facing docs (none expected)
- [ ] C5: Archive planning folder
- [ ] C6: Final validation (lint + tests)
- [ ] C7: Hand off — push branch + open PR
- [ ] C8: Schedule Phase 7 (only if shims stayed in C2)
```

---

## 3. Step-by-step instructions

### C0. Confirm shim policy

Ask the owner: *"PHASE-0 §6 D2 says rename `TRELLIS_*` env vars
hard (breaking, no fallback), but the working tree currently
includes a `readSylvaEnv()` fallback helper plus a
`TRELLIS_ENABLED → SYLVA_ENABLED` fallback in
`EventsGraphDataRepo.ts`. Keep the shims (operator-friendly,
removable later in Phase 7), or remove them now to honor D2?"*

Write the answer here before proceeding:

- **Decision:** _____ (keep | remove)
- **Date:** _____

### C1. Commit code changes

The plan called for one commit per phase (1–5). Since the work
was done in a single sweep and `git mv` was waived (D6), the
simplest faithful approach is a **single commit** that records
the rename as one atomic change. This matches what actually
happened.

```bash
cd /Users/kkanouse/DEV/prj/eventsgraph-prj/eventsgraph
git status                # confirm branch is rename/trellis-to-sylva
git add -A
git commit -m "REFACTORED: Rename Trellis integration to Sylva" \
           -m "- Folder src/server/lib/repos/oracles/trellis → sylva" \
           -m "- All Trellis* classes/files/tests → Sylva*" \
           -m "- TRELLIS_* constants → SYLVA_* in src/server/constants.ts" \
           -m "- Wire collection id flipped from 'trellis' to 'sylva' (BREAKING per D1)" \
           -m "- .env.example: TRELLIS_* → SYLVA_*" \
           -m "- TRELLIS_* env vars still read as fallback with deprecation warning" \
           -m "- 454 tests passing; lint clean (0 errors, 118 pre-existing warnings)"
```

> If the owner prefers split commits per phase for posterity,
> use `git add -p` to stage hunks: env-related lines into one
> commit, constants into another, etc. The result is identical;
> only the history granularity differs.

### C2. (optional) Remove env-var shims

**Only if C0 decision = "remove".** Otherwise skip.

1. Edit
   [SylvaConnectionManager.ts](../../../src/server/lib/repos/oracles/sylva/SylvaConnectionManager.ts):
   - Delete the `readSylvaEnv()` helper.
   - Replace each call site with a direct `process.env.SYLVA_<X>` read.
2. Edit
   [EventsGraphDataRepo.ts](../../../src/server/lib/repos/EventsGraphDataRepo.ts):
   - Replace the fallback block with
     `if (process.env.SYLVA_ENABLED === 'true') { ... }`.
   - Remove the `import { logger } from '../logger'` line if it is
     no longer used.
3. Update or delete the matching deprecation tests in
   [SylvaConnectionManager.test.ts](../../../src/server/lib/repos/oracles/sylva/__tests__/SylvaConnectionManager.test.ts).
4. Re-run validation (see C6).
5. Commit:
   ```bash
   git add -A
   git commit -m "REMOVED: Drop TRELLIS_* env var fallback shim (honors D2)"
   ```

### C3. Add CHANGELOG.md

Repo currently has no `CHANGELOG.md`. Create one at the repo
root with this seed:

```markdown
# Changelog

All notable changes to this project are documented here. This
project adheres to [Keep a Changelog](https://keepachangelog.com/)
conventions.

## [Unreleased]

### Changed (BREAKING)

- **Renamed Trellis integration to Sylva.** All TypeScript
  identifiers, file/folder names, environment variable names,
  and the socket.io `collection` id have been renamed:
  - Wire collection id changed from `'trellis'` to `'sylva'`.
    External clients that send `{ collection: 'trellis', ... }`
    over socket.io must update to `{ collection: 'sylva', ... }`.
    **No backwards-compat alias is provided** (per decision D1).
  - Environment variables renamed: `TRELLIS_ENABLED`,
    `TRELLIS_BASE_URL`, `TRELLIS_DID`, `TRELLIS_WORKSPACE_ID`,
    `TRELLIS_PARTICIPANT_NAME` → `SYLVA_*` equivalents.
    <!-- If C0 = keep shims, leave this paragraph: -->
    Legacy `TRELLIS_*` names continue to work as a fallback
    and emit a one-time `SYLVA: TRELLIS_<X> is deprecated, use
    SYLVA_<X>` warning. Removal is scheduled for the next major
    release.
    <!-- If C0 = remove shims, replace the paragraph above with: -->
    <!-- Legacy `TRELLIS_*` names are no longer read; deployments
    must rename them before upgrading. -->

### Internal

- Folder `src/server/lib/repos/oracles/trellis/` renamed to
  `oracles/sylva/`.
- Constants `TRELLIS_*` in `src/server/constants.ts` renamed to
  `SYLVA_*` (string values unchanged except `SYLVA_COLLECTION_ID`).
- Operator-facing log strings updated (`Sylva Oracle: …`,
  `Sylva: authenticated successfully`, etc.).
```

Commit:
```bash
git add CHANGELOG.md
git commit -m "DOCS: Add CHANGELOG with Trellis→Sylva rename entry"
```

### C4. Audit user-facing docs

Already verified empty, but re-run as a final check:
```bash
rg -n 'Trellis|TRELLIS|trellis' README.md docs/ \
  --glob '!docs/instructions/todo/fix-trellis-name/**' \
  --glob '!docs/instructions/done/rename-trellis-to-sylva/**'
```
Expected: zero results. If any appear, update prose to `Sylva`
(use `Sylva (formerly Trellis)` once per document if helpful).

### C5. Archive planning folder

```bash
mkdir -p docs/instructions/done
git mv docs/instructions/todo/fix-trellis-name \
       docs/instructions/done/rename-trellis-to-sylva
git rm docs/instructions/done/rename-trellis-to-sylva/prompt.txt
git add -A
git commit -m "DOCS: Archive Trellis→Sylva rename plan"
```

### C6. Final validation

```bash
npm run lint    # expect: 0 errors
npm test        # expect: 42 files / 454 tests passing
                #   (453 if C2 removed deprecation tests)
```

If anything fails, stop and fix before C7.

### C7. Hand off

```bash
git log --oneline -10        # sanity check the commit graph
git push -u origin rename/trellis-to-sylva
```

Open a PR against `master`. Suggested PR title:
`REFACTORED: Rename Trellis integration to Sylva`

PR body should call out:
1. Wire-level breaking change (`collection: 'trellis'` → `'sylva'`).
2. Env var rename (and shim status from C0).
3. No upstream API path changes (D4).
4. No DID changes (D3).

### C8. Schedule Phase 7 (conditional)

- If C0 = **keep shims** → file an issue titled
  `Phase 7: remove TRELLIS_* env var fallback shim` referencing
  [PHASE-7-remove-compat-shim.md](./phases/PHASE-7-remove-compat-shim.md)
  and target a release ≥ 1 cycle after this lands.
- If C0 = **remove shims** → Phase 7 is fully obsolete; close
  the phase doc with a note in the archive.

---

## 4. Exit criteria for the cleanup

- [ ] C0 decision recorded in §3.
- [ ] All staged/unstaged changes committed; `git status` clean.
- [ ] `CHANGELOG.md` exists at repo root with rename entry.
- [ ] `docs/instructions/todo/fix-trellis-name/` no longer exists;
      content lives at
      `docs/instructions/done/rename-trellis-to-sylva/`.
- [ ] `prompt.txt` removed from the archived folder.
- [ ] `npm run lint` exits 0.
- [ ] `npm test` exits 0; ≥ 453 tests pass.
- [ ] Branch `rename/trellis-to-sylva` pushed; PR opened.
- [ ] Phase 7 issue filed (if shims kept) or closed-out
      (if shims removed).

---

## 5. Guardrails

- **Do not push** until the owner has reviewed C1's commit
  message and the C0 decision.
- **Do not** force-push or rewrite history once pushed.
- **Do not** edit `src/server/.env` (user-managed; not in git).
- **Do not** touch the compiled `server/` directory; it is
  regenerated by the build.
- If you discover an external consumer (dashboard, other PCN
  service) hard-coding `'trellis'`, file a follow-up before
  merging — there is **no alias** to soften the break.
