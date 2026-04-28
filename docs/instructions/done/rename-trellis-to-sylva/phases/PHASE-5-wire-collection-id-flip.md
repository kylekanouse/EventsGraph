# Phase 5 — Wire collection ID flip (gated by D1)

> **Parent plan:** [PLAN.md](../PLAN.md)
> **Branch:** `rename/trellis-to-sylva`
> **Status:** not started — **gated**
> **Depends on:** Phase 4 **and** owner sign-off on decision D1
> **Unblocks:** Phase 6

---

## 1. Purpose

Flip the **wire-level collection identifier** from the literal
string `'trellis'` to `'sylva'`. This is the **only behavioral
change** in the whole rename initiative — it changes what
external clients see in socket.io requests like
`{ collection: 'trellis', context: '...' }`.

Because this can break clients that hard-code `'trellis'`, the
phase ships with an **alias** so the legacy id keeps working for
one release, with a per-request deprecation warning. Phase 7
removes the alias.

> ⛔ **Do not start this phase until decision D1 is recorded as
> "yes, flip now" in [Phase 0 §6](./PHASE-0-preflight.md#6-notes-fill-in-during-execution).**
> If D1 is "defer," skip directly to Phase 6.

---

## 2. Scope

**In scope:**

- The string value of `SYLVA_COLLECTION_ID` in
  [src/server/constants.ts](../../../../src/server/constants.ts):
  `'trellis'` → `'sylva'`.
- Adding an alias in the oracle/repo registration so requests
  arriving with `collection: 'trellis'` still route to the Sylva
  oracle, with a per-request `logger.warn`.
- Updating any client/test fixtures that hard-code `'trellis'`:
  ```bash
  rg -n "['\"]trellis['\"]" src/
  ```

**Out of scope:**

- Removing the alias — Phase 7.
- The `TRELLIS_*` env var fallback shim — also Phase 7.

---

## 3. Steps

1. Confirm D1 = "flip now" is recorded in
   [Phase 0 §6](./PHASE-0-preflight.md#6-notes-fill-in-during-execution).
   If not, **stop** and skip to Phase 6.
2. Edit
   [src/server/constants.ts](../../../../src/server/constants.ts):
   - Change `SYLVA_COLLECTION_ID` value from `'trellis'` to `'sylva'`.
   - Add a sibling constant for the legacy alias:
     ```ts
     // Legacy alias — accepted for one release, removed in Phase 7.
     export const SYLVA_COLLECTION_ID_LEGACY: string = 'trellis'
     ```
   - Remove the `TODO(rename-D1)` marker added in Phase 2.
3. Add alias routing where collections are dispatched. Locate the
   place in the oracle/repo registration that maps incoming
   `collection` strings to oracles (start in
   [src/server/lib/repos/EventsGraphDataRepo.ts](../../../../src/server/lib/repos/EventsGraphDataRepo.ts)
   and the Sylva oracle's request entry point). Register both
   `SYLVA_COLLECTION_ID` and `SYLVA_COLLECTION_ID_LEGACY` to the
   same oracle. When the legacy id is matched, emit:
   ```ts
   logger.warn(
     `SYLVA: collection id 'trellis' is deprecated, use 'sylva'`
   )
   ```
4. Find every hard-coded fixture or test referencing `'trellis'`:
   ```bash
   rg -n "['\"]trellis['\"]" src/
   ```
   Update production usages to `'sylva'`. For tests, keep at
   least one test case asserting the **legacy alias still works
   and emits the deprecation warning**, plus broaden the rest to
   `'sylva'`.
5. Validate:
   ```bash
   npm run lint
   npm test
   ```
6. End-to-end smoke check:
   - `npm run dev`
   - Open the client at <http://localhost:3001> and load a graph
     context (e.g. `agent-topology`) — confirm it succeeds via
     the new `'sylva'` id.
   - Manually issue a socket.io request with
     `{ collection: 'trellis', context: '...' }` — confirm it
     still resolves and the server logs the deprecation warning
     exactly once per request.
7. Commit:
   ```bash
   git add -A
   git commit -m "UPDATED: Switch wire collection id from 'trellis' to 'sylva' (with legacy alias)"
   ```

---

## 4. Exit criteria

- [ ] `SYLVA_COLLECTION_ID === 'sylva'`.
- [ ] `SYLVA_COLLECTION_ID_LEGACY === 'trellis'` and is wired into the
      collection dispatcher with a `logger.warn`.
- [ ] `rg -n "['\"]trellis['\"]" src/` returns only the alias
      constant declaration and the dedicated alias regression test(s).
- [ ] `npm run lint` exits 0.
- [ ] `npm test` exits 0; new alias-deprecation test passes.
- [ ] Smoke check: a request with the legacy `'trellis'` collection
      still resolves and emits the warning.
- [ ] One commit landed:
      `UPDATED: Switch wire collection id from 'trellis' to 'sylva' (with legacy alias)`.

---

## 5. Guardrails

- Do **not** remove the `TRELLIS_*` env var fallback (Phase 7).
- Do **not** delete the `'trellis'` alias in this phase — that is
  intentionally a one-release deprecation.
- If you discover a client outside this repo (dashboards, other
  PCN services) that hard-codes `'trellis'`, file a follow-up to
  notify owners before Phase 7 lands.
