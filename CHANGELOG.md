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
    **No backwards-compat fallback is provided** (per decision
    D2). Deployments must rename `TRELLIS_*` to `SYLVA_*` before
    upgrading.

### Internal

- Folder `src/server/lib/repos/oracles/trellis/` renamed to
  `oracles/sylva/`.
- Constants `TRELLIS_*` in `src/server/constants.ts` renamed to
  `SYLVA_*` (string values unchanged except `SYLVA_COLLECTION_ID`).
- Operator-facing log strings updated (`Sylva Oracle: …`,
  `Sylva: authenticated successfully`, etc.).
- Upstream API paths and the service DID
  (`did:pcn:service:eventsgraph`) are unchanged.
