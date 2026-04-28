# Phase 4 — Environment variables (with backwards-compat shim)

> **Parent plan:** [PLAN.md](../PLAN.md)
> **Branch:** `rename/trellis-to-sylva`
> **Status:** not started
> **Depends on:** Phase 3
> **Unblocks:** Phase 5

---

## 1. Purpose

Migrate the integration's environment variable surface from
`TRELLIS_*` to `SYLVA_*`, while keeping deployments alive: every
env consumer must read **`SYLVA_*` first, falling back to
`TRELLIS_*`** with a one-time `logger.warn` deprecation notice.

This is the only phase in the plan that touches `.env.example`
and `process.env.*` reads. It is non-breaking by design (per
decision D2).

---

## 2. Scope

**In scope:**

- [.env.example](../../../../.env.example) lines ~5–10 — rename
  the keys (and update the section header).
- Env consumers in the `sylva/` tree, primarily
  `SylvaConnectionManager.ts`. Search confirms the full set:
  ```bash
  rg -n "process\.env\.TRELLIS_" src/
  ```
- [src/server/lib/repos/EventsGraphDataRepo.ts](../../../../src/server/lib/repos/EventsGraphDataRepo.ts) —
  the `process.env.TRELLIS_ENABLED` read at line ~51 (left untouched in Phase 1).

**Out of scope:**

- Removing the `TRELLIS_*` fallback shim — that happens in Phase 7
  after at least one release cycle.
- Any change to the DID value `did:pcn:service:eventsgraph` (D3 = unchanged).
- Any change to upstream API paths (D4 = unchanged).

---

## 3. Steps

1. Update [.env.example](../../../../.env.example) — replace the
   block at lines ~5–10 with:
   ```dotenv
   # Sylva Connector (formerly Trellis)
   SYLVA_ENABLED=true
   SYLVA_BASE_URL=http://localhost:3100
   SYLVA_DID=did:pcn:service:eventsgraph
   SYLVA_WORKSPACE_ID=default
   SYLVA_PARTICIPANT_NAME=EventsGraph VR
   ```
2. Find every env consumer:
   ```bash
   rg -n "process\.env\.TRELLIS_" src/
   ```
3. For each `process.env.TRELLIS_X` read, switch to a
   `SYLVA_X` first / `TRELLIS_X` fallback pattern with a
   one-time deprecation warning. Example:
   ```ts
   const baseUrl =
     process.env.SYLVA_BASE_URL
     ?? process.env.TRELLIS_BASE_URL
     ?? 'http://localhost:3100'

   if (!process.env.SYLVA_BASE_URL && process.env.TRELLIS_BASE_URL) {
     logger.warn(
       'SYLVA: TRELLIS_BASE_URL is deprecated, use SYLVA_BASE_URL'
     )
   }
   ```
   Do the same for `TRELLIS_ENABLED`, `TRELLIS_DID`,
   `TRELLIS_WORKSPACE_ID`, `TRELLIS_PARTICIPANT_NAME`, and any
   others surfaced by step 2.

   **Implementation tip:** introduce a small helper local to
   `SylvaConnectionManager.ts` so each consumer site stays
   one-liner-tidy. Do not export it; do not over-engineer.

   ```ts
   function readSylvaEnv(name: string): string | undefined {
     const sylvaKey = `SYLVA_${name}`
     const legacyKey = `TRELLIS_${name}`
     const sylvaVal = process.env[sylvaKey]
     if (sylvaVal !== undefined) return sylvaVal
     const legacyVal = process.env[legacyKey]
     if (legacyVal !== undefined) {
       logger.warn(`SYLVA: ${legacyKey} is deprecated, use ${sylvaKey}`)
       return legacyVal
     }
     return undefined
   }
   ```
4. Apply the same fallback in
   [src/server/lib/repos/EventsGraphDataRepo.ts](../../../../src/server/lib/repos/EventsGraphDataRepo.ts)
   for `TRELLIS_ENABLED` → `SYLVA_ENABLED`.
5. Update or add tests asserting both:
   - `SYLVA_*` values are honored when present.
   - `TRELLIS_*` values are honored as a fallback **and** trigger
     the deprecation warning exactly once per process.
6. Validate:
   ```bash
   npm run lint
   npm test
   ```
7. Smoke-test (optional but recommended):
   - With only `TRELLIS_*` set in your local `src/server/.env`,
     start the server and confirm a `SYLVA: TRELLIS_* is deprecated …`
     warning appears, and the integration still authenticates.
   - Rename to `SYLVA_*` locally and confirm warnings stop.
8. Commit:
   ```bash
   git add -A
   git commit -m "UPDATED: Migrate Trellis env vars to Sylva (with backwards-compat fallback)" \
              -m "Operators should rename TRELLIS_* env vars to SYLVA_*; legacy names still work but will be removed in a future release."
   ```

---

## 4. Exit criteria

- [ ] [.env.example](../../../../.env.example) advertises only
      `SYLVA_*` keys under a `# Sylva Connector (formerly Trellis)` header.
- [ ] `rg -n "process\.env\.SYLVA_" src/` returns one site per
      legacy `TRELLIS_*` consumer.
- [ ] Every `process.env.TRELLIS_*` read is reachable only as a
      fallback after a `SYLVA_*` read.
- [ ] At least one test verifies the fallback path emits a
      single `logger.warn`.
- [ ] `npm run lint` exits 0.
- [ ] `npm test` exits 0.
- [ ] One commit landed:
      `UPDATED: Migrate Trellis env vars to Sylva (with backwards-compat fallback)`.

---

## 5. Guardrails

- Do **not** delete the `TRELLIS_*` fallback paths — Phase 7 owns removal.
- Do **not** touch the user-managed `src/server/.env` file from
  source control. Only `.env.example` is committed.
- Do **not** change the wire collection id `'trellis'` — Phase 5.
- Keep the deprecation `logger.warn` short and one-shot per key
  (deduplicate inside the helper if you reuse it across many sites).
