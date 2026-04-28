# Phase 1 — Internal class & file renames (no behavior change)

> **Parent plan:** [PLAN.md](../PLAN.md)
> **Branch:** `rename/trellis-to-sylva`
> **Status:** not started
> **Depends on:** Phase 0
> **Unblocks:** Phase 2

---

## 1. Purpose

Rename every TypeScript identifier and filename in the Trellis
integration to use the `Sylva*` form. **No behavior changes**:
wire IDs (the literal string `'trellis'`) and environment variable
names (`TRELLIS_*`) remain untouched in this phase. Phases 2, 4,
and 5 handle those.

By the end of this phase the `src/server/lib/repos/oracles/trellis/`
folder no longer exists; all classes and tests compile and pass
under their new `Sylva` names; and the EventsGraph data repo
imports the renamed oracle.

---

## 2. Scope

**In scope (rename + reference updates):**

- Folder: `src/server/lib/repos/oracles/trellis/` → `oracles/sylva/`
- Oracle root: `Trellis.ts` (class `Trellis`) → `Sylva.ts` (class `Sylva`)
- `TrellisConnectionManager.ts` (+ test) → `SylvaConnectionManager.ts`
- `TrellisEventBridge.ts` (+ test) → `SylvaEventBridge.ts`
- `trellis/types.ts` interfaces:
  `TrellisAuthResponse`, `TrellisGPA`, `TrellisChannel`,
  `TrellisParticipant`, `TrellisChannelMember`, plus their
  `*ListResponse` variants → `Sylva*` equivalents
- `services/Trellis*.ts` (8 files): `TrellisObservabilityClient`,
  `TrellisAnalyticsService`, `TrellisSnapshotCache`,
  `TrellisGraphDiff`, `TrellisGraphSearch`,
  `TrellisSubgraphExtractor`, `TrellisNodeDetail`,
  `TrellisCrossContextNav` → `Sylva*` (file + class)
- `contexts/Context*.ts` (14 files): filenames already neutral —
  update internal class refs and imports only
- `mappers/*.mapper.ts` (9 files): filenames already neutral —
  update internal type refs and comments
- `__tests__/**` (32 files): rename `Trellis*` test filenames; update
  all imports and described identifiers
- Cross-cutting consumer:
  `src/server/lib/repos/EventsGraphDataRepo.ts` —
  `import Trellis from './oracles/trellis/Trellis'` →
  `import Sylva from './oracles/sylva/Sylva'`, plus the 2
  references in `_buildOracles()`

**Out of scope (other phases):**

- `src/server/constants.ts` `TRELLIS_*` constants — Phase 2
- Operator/log strings (`'Trellis Oracle: …'`, etc.) — Phase 3
- `.env.example` and `process.env.TRELLIS_*` reads — Phase 4
- The string literal `'trellis'` value of `TRELLIS_COLLECTION_ID` — Phase 5
- `server/**` compiled JS (git-ignored, regenerated)
- `coverage/**`, `node_modules/**`

---

## 3. Steps

> Use `git mv` (D6) so blame and history follow the files.

1. Move the oracle folder:
   ```bash
   git mv src/server/lib/repos/oracles/trellis src/server/lib/repos/oracles/sylva
   ```
2. Inside `src/server/lib/repos/oracles/sylva/`, rename files (keep
   each `git mv` on its own line so history is clean):
   ```bash
   cd src/server/lib/repos/oracles/sylva
   git mv Trellis.ts                       Sylva.ts
   git mv TrellisConnectionManager.ts      SylvaConnectionManager.ts
   git mv TrellisEventBridge.ts            SylvaEventBridge.ts
   # services (8)
   git mv services/TrellisObservabilityClient.ts services/SylvaObservabilityClient.ts
   git mv services/TrellisAnalyticsService.ts    services/SylvaAnalyticsService.ts
   git mv services/TrellisSnapshotCache.ts       services/SylvaSnapshotCache.ts
   git mv services/TrellisGraphDiff.ts           services/SylvaGraphDiff.ts
   git mv services/TrellisGraphSearch.ts         services/SylvaGraphSearch.ts
   git mv services/TrellisSubgraphExtractor.ts   services/SylvaSubgraphExtractor.ts
   git mv services/TrellisNodeDetail.ts          services/SylvaNodeDetail.ts
   git mv services/TrellisCrossContextNav.ts     services/SylvaCrossContextNav.ts
   # tests
   git mv __tests__/TrellisConnectionManager.test.ts __tests__/SylvaConnectionManager.test.ts
   git mv __tests__/TrellisEventBridge.test.ts       __tests__/SylvaEventBridge.test.ts
   # repeat for any other __tests__/Trellis*.test.ts and __tests__/services/Trellis*.test.ts
   cd -
   ```
   Verify nothing remains:
   ```bash
   find src/server/lib/repos/oracles/sylva -name 'Trellis*'   # must be empty
   ```
3. Replace identifiers inside the renamed files. Do **PascalCase
   word-boundary** replacements only — do not touch lowercase
   `'trellis'` strings yet.
   ```bash
   # Class / interface / type identifiers
   rg -l '\bTrellis' src/server/lib/repos/oracles/sylva \
     | xargs sed -i '' 's/\bTrellis\b/Sylva/g'
   ```
   Then check that no unintended changes happened:
   ```bash
   git diff --stat
   rg 'trellis[A-Za-z]' src/server/lib/repos/oracles/sylva   # warn on glued substrings
   ```
4. Update JSDoc and inline comments containing the word "Trellis"
   inside `sylva/`. The `sed` above already handles `\bTrellis\b`;
   sweep for lowercase prose:
   ```bash
   rg -n '\btrellis\b' src/server/lib/repos/oracles/sylva
   ```
   For each hit, decide: leave (e.g. "formerly Trellis" historical
   note), or update to "Sylva".
5. Update **import paths** that previously referenced
   `./oracles/trellis/...`:
   ```bash
   rg -n "oracles/trellis" src/
   ```
   Replace with `oracles/sylva`.
6. Update the cross-cutting consumer
   [src/server/lib/repos/EventsGraphDataRepo.ts](../../../../src/server/lib/repos/EventsGraphDataRepo.ts):
   - Line ~8: `import Trellis from './oracles/trellis/Trellis'` →
     `import Sylva from './oracles/sylva/Sylva'`
   - Lines ~51–52: rename the `Trellis` symbol used in
     `_buildOracles()` to `Sylva`. **Leave** the
     `process.env.TRELLIS_ENABLED` read alone (Phase 4 handles env vars).
7. Validate:
   ```bash
   npm run lint
   npm test
   ```
   All 32 oracle tests must pass. If any fail because a test asserted
   on an identifier or file path, update the test (this phase is
   exactly the right place to do that).
8. Commit:
   ```bash
   git add -A
   git commit -m "REFACTORED: Rename Trellis classes/files to Sylva"
   ```

---

## 4. Exit criteria

- [ ] `find src/server/lib/repos/oracles/sylva -name 'Trellis*'` is empty.
- [ ] `rg '\bTrellis\b' src/server/lib/repos/oracles/sylva` returns
      only intentional historical/comment references.
- [ ] `rg "oracles/trellis" src/` returns no results.
- [ ] `EventsGraphDataRepo.ts` imports `Sylva` from `./oracles/sylva/Sylva`.
- [ ] `npm run lint` exits 0.
- [ ] `npm test` exits 0 with prior passing-suite count preserved.
- [ ] One commit landed: `REFACTORED: Rename Trellis classes/files to Sylva`.

---

## 5. Guardrails

- **Do not** change the literal string `'trellis'` in
  `TRELLIS_COLLECTION_ID` — Phase 5 owns that flip.
- **Do not** rename `TRELLIS_*` constants — Phase 2 owns that.
- **Do not** edit `.env.example` or any `process.env.TRELLIS_*` reads — Phase 4 owns that.
- **Do not** edit anything under `server/`, `coverage/`, `dist/`, or
  `node_modules/`.
- **Do not** blanket-rename across the repo with `sed`. Scope each
  command to `src/server/lib/repos/oracles/sylva` (and the explicit
  cross-cutting consumer file).
- Verify `git status` shows file renames (R) rather than delete + add
  (D + A) — that proves history is preserved.
