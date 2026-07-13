# Changelog

All notable changes to this project are documented here. This
project adheres to [Keep a Changelog](https://keepachangelog.com/)
conventions.

## [Unreleased]

### Removed (BREAKING)

- **Removed the Sylva oracle connector** (formerly Trellis). The
  `sylva` collection is gone from the socket.io API. Clients
  sending `{ collection: 'sylva', ... }` now receive
  `Unable to find collection sylva`.

  Removed in full:
  - `src/server/lib/repos/oracles/sylva/` — 67 files, 10,515 LOC,
    322 tests: the Collection root, the REST/JWT connection
    manager, the SSE event bridge, 14 contexts, 9 mappers, and
    8 services.
  - The 15 `SYLVA_*` constants in `src/server/constants.ts` (the
    collection id and 14 context ids).
  - The 5 `SYLVA_*` environment variables (`SYLVA_ENABLED`,
    `SYLVA_BASE_URL`, `SYLVA_DID`, `SYLVA_WORKSPACE_ID`,
    `SYLVA_PARTICIPANT_NAME`). Any still set in a deployment are
    now inert and can be dropped.

  This **supersedes** the Trellis→Sylva rename previously recorded
  in this section. That rename is moot: the renamed code has been
  removed in the same unreleased cycle.

### Unchanged

- **The Oracle / Collection / Context extension point is
  untouched.** Twitter, BasicNetwork, and DummyData are
  unaffected, and the generic connector spec at
  `docs/instructions/ai/EVENTSGRAPH_API_CONNECTOR_SPEC.md` remains
  authoritative for building a replacement oracle.
- No npm dependency was orphaned. The connector imported zero
  packages — networking used the global `fetch`.
- No client file changed. The client never referenced Sylva; the
  oracle dropdown is a static 6-entry array that never listed it.
- `IGraphNode.color` is deliberately retained. Sylva was its only
  producer, but the field predates the connector and remains a
  valid capability for a future oracle.

### Recovery

The connector is preserved at the `sylva-connector-final` tag:

    git checkout sylva-connector-final -- src/server/lib/repos/oracles/sylva

That restores the connector *directory* only. Re-registering it
also requires restoring the `SYLVA_*` constants in
`src/server/constants.ts` and the import + env-gated registration
block in `src/server/lib/repos/EventsGraphDataRepo.ts`.

> **Never restore Sylva by reverting commit `5d4be46`.** That commit
> bundles the connector together with shared, load-bearing
> infrastructure (`src/server/lib/logger.ts`,
> `src/server/domain/schemas.ts`, and the `.gitignore` anchoring
> fix). Reverting it takes the server build down.

### Fixed

- **Anchored the `server/` rule in `.gitignore`.** The unanchored
  rule was silently matching `src/server/` as well as the compiled
  output directory, so ~62 server source files — including the
  shared `logger.ts` and `domain/schemas.ts` — were never
  committed and `master`'s server typecheck failed. The rule is now
  `/server/`, anchored to the repo root.
