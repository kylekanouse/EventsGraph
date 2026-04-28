# Phase 2 — Constant renames (TS-level, wire ID still `'trellis'`)

> **Parent plan:** [PLAN.md](../PLAN.md)
> **Branch:** `rename/trellis-to-sylva`
> **Status:** not started
> **Depends on:** Phase 1
> **Unblocks:** Phase 3

---

## 1. Purpose

Rename the TypeScript constant **identifiers** in
[src/server/constants.ts](../../../../src/server/constants.ts) from
`TRELLIS_*` to `SYLVA_*`, and update every TS reference in the
`sylva/` tree to match. This is identifier-only — the **string
literal values** (e.g. `'trellis'`) stay unchanged and are flipped
later in Phase 5 once decision D1 is confirmed.

---

## 2. Scope

**In scope:**

- [src/server/constants.ts](../../../../src/server/constants.ts), lines ~164–182:
  - `TRELLIS_COLLECTION_ID` → `SYLVA_COLLECTION_ID`
  - All 14 `TRELLIS_*_CONTEXT_ID` → `SYLVA_*_CONTEXT_ID`
- All references to those constants throughout `src/` (primarily
  `src/server/lib/repos/oracles/sylva/Sylva.ts`, contexts, and tests).

**Out of scope:**

- Changing the **string literal values** of those constants
  (e.g. `'trellis'`) — Phase 5.
- `process.env.TRELLIS_*` reads or `.env.example` — Phase 4.
- Operator/log strings — Phase 3.

---

## 3. Steps

1. Edit [src/server/constants.ts](../../../../src/server/constants.ts):
   - Rename `TRELLIS_COLLECTION_ID` to `SYLVA_COLLECTION_ID`.
     **Keep its string value `'trellis'` unchanged.**
   - Rename each of the 14 `TRELLIS_*_CONTEXT_ID` constants to
     `SYLVA_*_CONTEXT_ID`. Keep their string values unchanged.
   - Add a TODO marker on the collection id line:
     ```ts
     // TODO(rename-D1): change wire id to 'sylva' once clients updated (Phase 5)
     export const SYLVA_COLLECTION_ID: string = 'trellis'
     ```
2. Update every reference in the source tree:
   ```bash
   rg -l '\bTRELLIS_' src/ | xargs sed -i '' 's/\bTRELLIS_/SYLVA_/g'
   ```
3. Sanity-check:
   ```bash
   rg '\bTRELLIS_' src/    # must return no results
   rg '\bSYLVA_'  src/     # spot-check the renames
   ```
4. Validate:
   ```bash
   npm run lint
   npm test
   ```
5. Commit:
   ```bash
   git add -A
   git commit -m "REFACTORED: Rename TRELLIS_* constants to SYLVA_*"
   ```

---

## 4. Exit criteria

- [ ] `rg '\bTRELLIS_' src/` returns no results.
- [ ] `SYLVA_COLLECTION_ID` exists in
      [src/server/constants.ts](../../../../src/server/constants.ts)
      with value `'trellis'` and a `TODO(rename-D1)` comment.
- [ ] All 14 `SYLVA_*_CONTEXT_ID` constants exist with their original
      string values intact.
- [ ] `npm run lint` exits 0.
- [ ] `npm test` exits 0.
- [ ] One commit landed: `REFACTORED: Rename TRELLIS_* constants to SYLVA_*`.

---

## 5. Guardrails

- Do **not** change any string literal values in this phase.
- Do **not** touch `process.env.TRELLIS_*` (`.env.example` and the
  env consumers in `SylvaConnectionManager.ts` /
  `EventsGraphDataRepo.ts` belong to Phase 4).
- The `sed` command is scoped to `src/`. Do not run it across the
  repo root.
