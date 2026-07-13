# Changelog

All notable changes to this project are documented here. This
project adheres to [Keep a Changelog](https://keepachangelog.com/)
conventions.

## [Unreleased]

### Removed (BREAKING)

- **Removed an experimental third-party oracle connector** and all
  of its supporting code, constants, and environment variables. It
  was feature-flagged off by default and is no longer part of the
  project.

  Any external client still requesting that collection over
  socket.io will now receive an `Unable to find collection …`
  error. No replacement is provided.

### Unchanged

- **The Oracle / Collection / Context extension point is
  untouched.** Twitter, BasicNetwork, and DummyData are unaffected,
  and the generic connector spec at
  `docs/instructions/ai/EVENTSGRAPH_API_CONNECTOR_SPEC.md` remains
  authoritative for building a new oracle.
- No npm dependency was orphaned by the removal.
- No client file changed.
- `IGraphNode.color` is retained. It predates the removed connector
  and remains a valid capability for a future oracle: the renderer
  honors an explicit node `color` over `nodeAutoColorBy`.

### Fixed

- **Anchored the `server/` rule in `.gitignore`.** The unanchored
  rule was silently matching `src/server/` as well as the compiled
  output directory, so ~62 server source files — including the
  shared `logger.ts` and `domain/schemas.ts` — were never committed
  and `master`'s server typecheck failed. The rule is now
  `/server/`, anchored to the repo root.
