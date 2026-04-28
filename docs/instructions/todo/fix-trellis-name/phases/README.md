# Trellis → Sylva rename — Phase index

Self-contained, executable phase instructions derived from
[../PLAN.md](../PLAN.md). Each phase document includes its own
purpose, scope, steps, exit criteria, and guardrails so it can be
handed off independently.

| # | Phase | Status | Gating |
| --- | --- | --- | --- |
| 0 | [Preflight](./PHASE-0-preflight.md) | not started | — |
| 1 | [Class & file renames](./PHASE-1-class-and-file-renames.md) | not started | Phase 0 |
| 2 | [Constant renames](./PHASE-2-constant-renames.md) | not started | Phase 1 |
| 3 | [Log / string updates](./PHASE-3-log-and-string-updates.md) | not started | Phase 2 |
| 4 | [Env var migration](./PHASE-4-env-var-migration.md) | not started | Phase 3 |
| 5 | [Wire collection id flip](./PHASE-5-wire-collection-id-flip.md) | not started | Phase 4 + decision **D1** |
| 6 | [Docs & cleanup](./PHASE-6-docs-and-cleanup.md) | not started | Phase 5 (or Phase 4 if D1 deferred) |
| 7 | [Remove compat shim](./PHASE-7-remove-compat-shim.md) | scheduled | ≥ 1 release after Phase 6 |

## Conventions

- All phases run on branch `rename/trellis-to-sylva` except
  Phase 7, which uses a fresh branch off `master`.
- Use `git mv` (decision **D6**) to preserve blame across renames.
- Each phase ends in **exactly one commit** with the prefix called
  out in its document. Do not batch phases into a single commit —
  the per-phase commits make bisecting trivial if anything regresses.
- `npm run lint` and `npm test` must exit 0 at the end of every
  phase.
- Compiled output under `server/`, generated `coverage/`, and
  `node_modules/` are never edited directly.

## Decision matrix (recorded in [Phase 0 §6](./PHASE-0-preflight.md#6-notes-fill-in-during-execution))

| # | Decision | Affects |
| --- | --- | --- |
| D1 | Flip wire `collection` id `'trellis'` → `'sylva'`? | Phase 5 |
| D2 | Maintain `TRELLIS_*` env var fallback? | Phase 4, Phase 7 |
| D3 | Change DID `did:pcn:service:eventsgraph`? | (default: no) |
| D4 | Upstream API path renames? | (default: no) |
| D5 | Folder/identifier casing convention | Phase 1 |
| D6 | Use `git mv` for renames | All phases |
