# Phase 7 — Removal of compatibility shim (future release)

> **Parent plan:** [PLAN.md](../PLAN.md)
> **Branch:** `rename/trellis-to-sylva-cleanup` (new branch off
> `master` after at least one release that included Phases 1–6)
> **Status:** scheduled — **do not run until ≥ 1 release cycle has
> elapsed since Phase 6 shipped**
> **Depends on:** Phase 6 shipped to production AND release-notes
> deprecation window has elapsed
> **Unblocks:** nothing

---

## 1. Purpose

Remove the backwards-compatibility surface added in Phases 4 and 5
now that operators and clients have had a release cycle to migrate.
After this phase the codebase has **no remaining `Trellis` /
`TRELLIS_*` / `'trellis'` references** outside intentional historical
notes.

This phase is a **breaking change** for any deployment or client
that ignored the deprecation warnings. It must be released under a
**major version bump** per semver.

---

## 2. Scope

**In scope:**

- Removal of the `TRELLIS_*` env var fallback paths (and the
  `readSylvaEnv` helper introduced in Phase 4, if it exists solely
  to support the fallback).
- Removal of the `'trellis'` collection alias and its routing /
  deprecation `logger.warn` (added in Phase 5).
- Removal of the `SYLVA_COLLECTION_ID_LEGACY` constant (Phase 5).
- Removal of any "formerly Trellis" deprecation tests.
- Major version bump in `package.json`.

**Out of scope:**

- Any further renames; the codebase is already fully Sylva-named
  after Phase 5.

---

## 3. Steps

1. Verify the deprecation window has elapsed (check release notes
   from Phase 6 against current release date).
2. Create a new branch off latest `master`:
   ```bash
   git checkout master && git pull --ff-only
   git checkout -b rename/trellis-to-sylva-cleanup
   ```
3. Remove env var fallbacks:
   - In `SylvaConnectionManager.ts` (and any other env consumer
     that uses the helper), replace each `readSylvaEnv('X')` /
     `process.env.SYLVA_X ?? process.env.TRELLIS_X` with a direct
     `process.env.SYLVA_X` read. Inline a sensible default if one
     existed previously.
   - Delete the `readSylvaEnv` helper if it's no longer used.
   - In
     [src/server/lib/repos/EventsGraphDataRepo.ts](../../../../src/server/lib/repos/EventsGraphDataRepo.ts):
     drop the `process.env.TRELLIS_ENABLED` fallback.
4. Remove the wire alias (if Phase 5 ran):
   - Delete `SYLVA_COLLECTION_ID_LEGACY` from
     [src/server/constants.ts](../../../../src/server/constants.ts).
   - Remove the alias entry and the `logger.warn` from the
     collection dispatcher.
5. Remove deprecation tests added in Phases 4 and 5 (the ones that
   asserted the legacy paths still worked + warned).
6. Sweep for any remaining references:
   ```bash
   rg -n 'TRELLIS|Trellis|trellis' src/
   ```
   Expect only intentional historical "formerly Trellis" comments,
   if any. Remove if no longer useful.
7. Bump the major version:
   ```bash
   npm version major --no-git-tag-version
   ```
   Update the changelog with a `BREAKING:` entry listing what was
   removed.
8. Validate:
   ```bash
   npm run lint
   npm test
   npm run build
   ```
9. Smoke-test:
   - With **only `TRELLIS_*` env vars set**, start the server and
     confirm it now fails (or uses defaults) — i.e. the fallback
     truly is gone.
   - If Phase 5 ran: send a request with
     `{ collection: 'trellis', context: '...' }` and confirm it is
     **rejected** (no longer routed).
10. Commit:
    ```bash
    git add -A
    git commit -m "REMOVED: Drop TRELLIS_* env var and 'trellis' collection alias compatibility shims"
    ```

---

## 4. Exit criteria

- [ ] `rg -n 'TRELLIS|Trellis|trellis' src/` returns no functional
      references (only historical comments at most).
- [ ] No `process.env.TRELLIS_*` reads remain.
- [ ] `SYLVA_COLLECTION_ID_LEGACY` is gone (if Phase 5 ran).
- [ ] Collection dispatcher rejects `collection: 'trellis'`.
- [ ] Major version bump landed in `package.json`.
- [ ] Changelog records the breaking change.
- [ ] `npm run lint`, `npm test`, and `npm run build` all exit 0.
- [ ] One commit landed:
      `REMOVED: Drop TRELLIS_* env var and 'trellis' collection alias compatibility shims`.

---

## 5. Guardrails

- This is a **breaking change**. Do not skip the major version bump.
- Notify any known external integrators identified during Phase 5
  before merging.
- Do not run this phase pre-emptively just because tests pass —
  the gating is the deprecation window from Phase 6, not green CI.
