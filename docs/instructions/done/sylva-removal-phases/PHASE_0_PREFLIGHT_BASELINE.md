# Phase 0 — Preflight & Baseline

**Destructive:** No (read-only)
**Prerequisite:** None — this is the entry point
**Next phase:** [Phase 1 — Preserve the Asset](PHASE_1_PRESERVE_THE_ASSET.md)
**Parent:** [Sylva Removal Solutions Architecture](../SYLVA_REMOVAL_SOLUTION_ARCHITECTURE.md)

---

## Orientation

### What EventsGraph is

A **VR graph-visualization engine**. It maps arbitrary structured data onto physics,
space, color, and sound so a human can use innate spatial reasoning to understand it.
A Node.js/TypeScript server feeds graph data over Socket.IO to a React + A-Frame /
three.js VR client.

### What Sylva is

**Sylva** (renamed from *Trellis* — the rename was cosmetic) is an external,
self-hosted governed-multi-agent platform in the PCN product family. EventsGraph
consumes it as a strictly **read-only** data source over REST + SSE. It is one of four
*oracles*, alongside Twitter, BasicNetwork, and DummyData. We are deleting it.

### The DDD layering — why this removal is safe

```
src/server/
├── domain/        ← Contracts only. Interfaces + zod schemas. No behavior.
│                    IEventsGraphCollection, IEventsGraphCollectionContext,
│                    IGraphNode, IGraphLink, IGraphData, …Request / …Response
├── lib/           ← Shared implementation.
│   ├── Entity.ts, EntityCollection.ts   ← the shared object model
│   ├── Utils.ts                         ← createNode / createLink / buildResponse / isStreamable
│   ├── logger.ts                        ← pino; used by index, socket, middlewares, ALL oracles
│   └── repos/
│       ├── EventsGraphDataRepo.ts       ← the registry / aggregate root:
│       │                                  Map<collectionID, IEventsGraphCollection>
│       ├── Context.ts                   ← base Context
│       └── oracles/
│           ├── Oracle.ts                ← base Collection class
│           ├── Twitter.ts + twitter/
│           ├── BasicNetwork.ts + basicnetwork/
│           ├── DummyData.ts + dummydata/
│           └── sylva/                   ← THE TARGET (67 files, 10,515 LOC)
└── socket.ts      ← transport; zod-validates via domain/schemas.ts; dispatches to the repo
```

**Ubiquitous language.** An **Oracle** is a data source. It exposes one **Collection**
(implements `IEventsGraphCollection`), which owns N **Contexts** (each a named query
shape). A Context returns `IGraphData` = `{ nodes: IGraphNode[], links: IGraphLink[] }`,
wrapped by `Utils.buildResponse()` into an `IEventsGraphCollectionContextResponse` and
pushed to the VR client over Socket.IO.

**The dependency arrow points one way: `oracles → lib → domain`.** Nothing in `domain/`
or `lib/` imports an oracle. `EventsGraphDataRepo` is the single place any oracle is
named. Sylva is a **leaf node** in this graph.

Sylva further **forked away from** the shared abstractions rather than leaking into
them: Twitter is built on `Entity` / `EntityCollection` / `Utils.createNode`; Sylva uses
**none** of it, substituting pure mapper functions that return plain object literals and
touching exactly **one** shared Utils export — `buildResponse`. That divergence is an
architectural smell in normal times, and it is precisely what makes this deletion clean.

---

## ⚠️ The one trap — read before touching anything

**Do not remove Sylva by reverting commits.**

Commit `5d4be46` ("Anchor /server/ in .gitignore and add 60 orphaned src/server source
files") bundles the Sylva sources together with **eight files of shared, load-bearing
infrastructure that `master` does not have**:

```
.gitignore                                    ← the anchoring fix itself
src/server/lib/logger.ts                      ← used by index, socket, middlewares, ALL oracles
src/server/domain/schemas.ts                  ← used by socket.ts (zod request validation)
src/server/domain/__tests__/schemas.test.ts
src/server/lib/__tests__/Entity.test.ts
src/server/lib/__tests__/EntityCollection.test.ts
src/server/lib/__tests__/Utils.test.ts
src/server/lib/repos/__tests__/EventsGraphDataRepo.test.ts
```

Reverting that commit to "undo Sylva" would delete the shared logger and zod schemas
and take the server build down with it.

> **Removal must be surgical (`git rm` a directory), never historical (`git revert`).**

---

## Goal of this phase

Prove the starting tree is green, and **capture the numbers you will regress against in
every later phase**. Phase 3 deletes 71% of the test suite on purpose — without a
recorded baseline you cannot distinguish an *expected reduction* from an *actual
breakage*. That distinction is the entire safety story of this operation.

This phase writes nothing. It is pure measurement.

---

## Why the baseline must be taken on `rename/trellis-to-sylva`, not `master`

**`master` does not currently build.** Its server typecheck fails immediately:

```
Trellis.ts(3,42): error TS2307: Cannot find module './TrellisConnectionManager'
Trellis.ts(8,34): error TS2307: Cannot find module './contexts/ContextAgentTopology'
index.ts(5,24):   error TS2307: Cannot find module './lib/logger'
```

**Cause:** an unanchored `server/` rule in `.gitignore` was silently ignoring
`src/server/**`, so ~62 source files — including shared `logger.ts` and `schemas.ts` —
were never committed. They existed only on one developer's disk. The
`rename/trellis-to-sylva` branch fixed this (commit `5d4be46`) and is green.

**Therefore `rename/trellis-to-sylva` — not `master` — is the only correct baseline for
this work.** (Phase 2 is what repairs `master`.)

---

## Preconditions

- You are in the repo root: `/Users/kkanouse/DEV/prj/eventsgraph-prj/eventsgraph`
- Node 18–20 (`package.json` engines: `>=18.0.0 <21.0.0`); `nvm use` honors `.nvmrc`
- `node_modules` installed (`npm ci` if not)

---

## Steps

### 1. Confirm you are on the correct branch with a clean tree

```bash
git branch --show-current     # expect: rename/trellis-to-sylva
git status --short            # expect: clean, or only untracked docs/
```

If you are not on `rename/trellis-to-sylva`, **stop.** Do not substitute `master` — it
does not build (see above).

### 2. Capture the baseline

```bash
npx tsc --noEmit -p tsconfig.json          # client typecheck  — expect: clean, exit 0
npx tsc --noEmit -p tsconfig.server.json   # server typecheck  — expect: clean, exit 0
npx vitest run                             # expect: 42 files, 453 tests, all pass
```

### 3. Record the numbers

These are your regression oracle. Write them down somewhere you will still have them in
Phase 3.

| Measurement | Baseline value |
|---|---|
| Test files | **42 passed (42)** |
| Test cases | **453 passed (453)** |
| Client typecheck (`tsconfig.json`) | clean, exit 0 |
| Server typecheck (`tsconfig.server.json`) | clean, exit 0 |
| Sylva connector files | 67 (35 source + 32 test) |
| Sylva connector LOC | 10,515 |

### 4. Note the expected post-removal targets

You are not acting on these yet — you are internalizing them so that Phase 3's dramatic
test-count drop does not read as an emergency.

| Measurement | After Phase 3 |
|---|---|
| Test files | **10** (42 − 32 Sylva test files) |
| Test cases | **131** (453 − 322 Sylva test cases) |
| Both typechecks | still clean |

The 10 surviving test files are:

```
src/client/lib/__tests__/FocusManager.test.ts
src/client/lib/__tests__/GraphEvent.test.ts
src/client/lib/__tests__/InteractionModeManager.test.ts
src/client/lib/__tests__/NodeInteractionManager.test.ts
src/client/lib/__tests__/ThreeSingleton.test.ts
src/server/domain/__tests__/schemas.test.ts
src/server/lib/__tests__/Entity.test.ts
src/server/lib/__tests__/EntityCollection.test.ts
src/server/lib/__tests__/Utils.test.ts
src/server/lib/repos/__tests__/EventsGraphDataRepo.test.ts
```

> **The success signal in Phase 3 is `0 failures`, not a test count.** A *reduction* is
> expected and correct. A *failure* means a coupling was missed.

### 5. Confirm no test gate can trip on the count

Verified, but confirm for yourself — [vitest.config.ts](../../../../vitest.config.ts) has
**no `coverage.thresholds`**, no `testPathIgnorePatterns`, and no setup files. Deleting
322 tests therefore cannot fail a gate. There is no CI (`.github/` does not exist), no
Dockerfile, no `scripts/`.

### 6. Confirm the coupling inventory is still exhaustive

Re-run the audit that the architecture document's inventory was built from. Drift is
possible if anyone has committed since.

```bash
git grep -in sylva -- ':!src/server/lib/repos/oracles/sylva' ':!docs/' ':!CHANGELOG.md'
```

**Expected — exactly these, and nothing else:**

| File | Lines | Nature |
|---|---|---|
| `.env.example` | 5–10 | 5 `SYLVA_*` env vars + comment header |
| `src/server/constants.ts` | 163–183 | 15 `SYLVA_*` constants (1 collection id + 14 context ids) + JSDoc header |
| `src/server/lib/repos/EventsGraphDataRepo.ts` | 8, 51–53 | `import Sylva` + env-gated registration block |

If this grep returns **anything else**, the inventory has drifted. Stop and re-scope
before proceeding — the "3 files" guarantee that the rest of this plan rests on is no
longer true.

---

## Verification / Exit criteria

All four must hold before you proceed to Phase 1:

- [ ] On branch `rename/trellis-to-sylva`, working tree clean
- [ ] `npx tsc --noEmit -p tsconfig.json` → clean
- [ ] `npx tsc --noEmit -p tsconfig.server.json` → clean
- [ ] `npx vitest run` → **42 files / 453 tests, 0 failures**
- [ ] Coupling grep returns exactly the 3 files above

---

## Rollback

Not applicable — this phase is read-only and mutates nothing.

---

## Notes for the executor

- The vitest run emits Sylva log lines (e.g. `Sylva Oracle: initialized with advanced
  features support (Phase 6)`, `SylvaEventBridge: SSE connected`). This is expected at
  baseline. **Phase 6 will check that these lines are gone** — they are your before
  picture.
- Duration is ~1.5s for the full suite. If it hangs, something is wrong with your
  environment, not the code.
