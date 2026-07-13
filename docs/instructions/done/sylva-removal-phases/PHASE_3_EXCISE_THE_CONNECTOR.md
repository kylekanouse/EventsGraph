# Phase 3 — Excise the Connector

**Destructive:** ⚠️ **YES — this is the point of no return**
**Prerequisite:** [Phase 1](PHASE_1_PRESERVE_THE_ASSET.md) tag exists **and verifies**; [Phase 2](PHASE_2_LAND_THE_FOUNDATION.md) merged and `master` is green
**Next phase:** [Phase 4 — Clean the Shared Surface](PHASE_4_CLEAN_THE_SHARED_SURFACE.md)
**Parent:** [Sylva Removal Solutions Architecture](../SYLVA_REMOVAL_SOLUTION_ARCHITECTURE.md)

---

## 🛑 Stop — two gates before you type anything

```bash
git tag -l | grep sylva-connector-final                    # MUST print the tag
git ls-tree -r --name-only sylva-connector-final -- src/server/lib/repos/oracles/sylva | wc -l   # MUST print 67
```

If either fails, **go back to [Phase 1](PHASE_1_PRESERVE_THE_ASSET.md).** You are about to
delete 10,515 lines and 322 tests. The tag is the only thing that makes that reversible
after the branch is gone.

### ⚠️ And the trap:

> **Remove Sylva with `git rm` on a directory. NEVER with `git revert` on a commit.**

Commit `5d4be46` bundles the Sylva sources together with **shared, load-bearing
infrastructure that `master` did not have** — `src/server/lib/logger.ts` (imported by
`index.ts`, `socket.ts`, the middlewares, and every oracle), `src/server/domain/schemas.ts`
(the zod validation used by `socket.ts`), the `.gitignore` anchoring fix, and 5 shared test
files. Reverting it to "undo Sylva" **deletes the shared logger and schemas and takes the
server build down.**

Removal is **surgical**, never **historical**.

---

## Orientation

**EventsGraph** is a VR graph-visualization engine: a Node/TypeScript server maps
structured data onto graph nodes and links and streams it over Socket.IO to a React +
A-Frame/three.js VR client. **Sylva** (formerly *Trellis*) is an external
governed-multi-agent platform consumed read-only as one of four **oracles** — alongside
Twitter, BasicNetwork, and DummyData.

### The DDD layering, and why this cut is clean

```
src/server/
├── domain/    ← contracts only (interfaces + zod schemas, no behavior)
├── lib/       ← shared implementation: Entity, EntityCollection, Utils, logger
│   └── repos/
│       ├── EventsGraphDataRepo.ts   ← THE REGISTRY: Map<collectionID, IEventsGraphCollection>
│       └── oracles/                 ← one folder per data source
│           ├── Oracle.ts            ← base Collection class
│           ├── Twitter.ts, BasicNetwork.ts, DummyData.ts
│           └── sylva/               ← THE TARGET
└── socket.ts  ← transport; dispatches to the registry
```

An **Oracle** exposes one **Collection** (`IEventsGraphCollection`) owning N **Contexts**
(named query shapes), each returning `IGraphData { nodes, links }`.

**The dependency arrow points one way: `oracles → lib → domain`.** Nothing in `domain/` or
`lib/` imports an oracle. `EventsGraphDataRepo` is the *single* place any oracle is named.

Sylva went further: it **forked away from** the shared abstractions rather than leaking
into them. Twitter is built on `Entity` / `EntityCollection` / `Utils.createNode`. **Sylva
uses none of it** — it substitutes pure mapper functions returning plain object literals
and touches exactly **one** shared Utils export: `buildResponse`. It imports **zero**
npm packages (every import is relative; networking is the global `fetch`).

**Consequence: Sylva is a leaf. Deleting the directory + unwiring one registration is the
whole job.** Everything else in this phase is verification.

---

## Goal of this phase

Delete the connector and unwire it from the registry — **and nothing else.**

Constants and env cleanup are deliberately deferred to
[Phase 4](PHASE_4_CLEAN_THE_SHARED_SURFACE.md). Keeping them out of this commit is what
makes *"did the deletion break the app?"* answerable in isolation, and lets `git bisect`
distinguish "deletion broke it" from "cleanup broke it."

---

## Preconditions

- [ ] `sylva-connector-final` tag exists and lists 67 connector files (checked above)
- [ ] Phase 2 merged; `master` is green (42 files / 453 tests; both typechecks clean)
- [ ] Working tree clean

---

## Optional: dry-run the removal with zero risk

Sylva's registration is **env-gated** (`SYLVA_ENABLED === 'true'`). So you can observe the
exact post-removal runtime behavior *before deleting anything*:

```bash
SYLVA_ENABLED=false npm run server
```

The registry will contain exactly `twitter`, `basicnetwork`, `dummydata`, and no Sylva log
lines will appear. If the app misbehaves here, it will misbehave after deletion too — and
you can find out while `git checkout .` is still a full undo.

---

## Steps

### 1. Branch from `master`

```bash
git checkout master
git pull                                  # if a remote is in play
git checkout -b remove/sylva-connector
```

### 2. Delete the tree

```bash
git rm -r src/server/lib/repos/oracles/sylva
```

Expect **67 files** staged for deletion (35 source + 32 test = 10,515 LOC).

```bash
git diff --cached --stat | tail -1        # sanity: ~67 files changed, ~10515 deletions
```

### 3. Unwire the registry — [`src/server/lib/repos/EventsGraphDataRepo.ts`](../../../../src/server/lib/repos/EventsGraphDataRepo.ts)

Two deletions in one file. This is the *only* code file this phase touches.

**3a. Delete the import at line 8:**

```ts
import Sylva from './oracles/sylva/Sylva'      // ← DELETE THIS LINE
```

> ⚠️ **Do NOT touch line 2** (`import IEventsGraphCollection from '../../domain/IEventsGraphCollection'`).
> It is still used — it types both `_repo` and the `entries` array. An over-eager
> "remove unused imports" will break the build here.

**3b. Delete the env-gated registration block at lines 51–53** (plus its surrounding blank
line).

**Before** (lines 44–56):

```ts
  constructor() {
    const entries: [string, IEventsGraphCollection][] = [
      [Twitter.getID(), Twitter],
      [BasicNetwork.getID(), BasicNetwork],
      [DummyData.getID(), DummyData],
    ]

    if (process.env.SYLVA_ENABLED === 'true') {      // ← DELETE
      entries.push([Sylva.getID(), Sylva])           // ← DELETE
    }                                                // ← DELETE

    this._repo = new Map(entries)
  }
```

**After — minimal edit (recommended):**

```ts
  constructor() {
    const entries: [string, IEventsGraphCollection][] = [
      [Twitter.getID(), Twitter],
      [BasicNetwork.getID(), BasicNetwork],
      [DummyData.getID(), DummyData],
    ]

    this._repo = new Map(entries)
  }
```

**Optional simplification.** The `entries` local now exists only to be passed straight to
`new Map()`, so it can be inlined. Note that `entries` was already `const` — it was
*mutated* via `.push()`, not reassigned — so there is no `let`→`const` change to make here
(the architecture document's phrasing on this point is imprecise). If you inline, **keep
the explicit type parameter** so `_repo`'s `Map<string, IEventsGraphCollection>` type still
checks and the line-2 import stays used:

```ts
  constructor() {
    this._repo = new Map<string, IEventsGraphCollection>([
      [Twitter.getID(), Twitter],
      [BasicNetwork.getID(), BasicNetwork],
      [DummyData.getID(), DummyData],
    ])
  }
```

Either form is correct. If in doubt, take the minimal edit — a smaller diff is a cheaper
review.

### 4. Do not touch anything else in this commit

Leave these **alone** — they are Phase 4:

- ❌ `src/server/constants.ts` (the `SYLVA_*` block) — harmless dead constants for now
- ❌ `.env.example` (the `SYLVA_*` vars) — harmless dead config for now
- ❌ `CHANGELOG.md` — Phase 5
- ❌ `IGraphNode.color` — Phase 4 decides, and the recommendation is *keep*

The tree will still typecheck and still pass tests with those constants present. They
reference nothing; nothing references them.

---

## Verification — all four must pass

```bash
npx tsc --noEmit -p tsconfig.server.json   # ← THE GATE. Must be clean.
npx tsc --noEmit -p tsconfig.json          # client typecheck — must be clean
npx vitest run                             # expect: 10 files, 131 tests, 0 failures
git grep -in sylva -- src/server/lib/repos # expect: NO hits
```

### Why `tsc -p tsconfig.server.json` is *the* gate

TypeScript resolves every import in the server graph. If any file anywhere still imports
anything under `oracles/sylva/`, this **cannot** pass. It is a complete, mechanical proof
that no dangling reference survives — stronger than any grep. **A clean server typecheck is
the single most important signal in this entire operation.**

### Expected test delta — read this before you panic

| | Before | After |
|---|---|---|
| Test files | 42 | **10** |
| Test cases | 453 | **131** |

**A count of 131 passing with zero failures is the success signal.**

> The count *dropping* is expected and correct — you deleted 32 test files containing 322
> test cases. The signal is **zero failures**, not the count. Any *failure* (as opposed to
> a reduction) means a coupling was missed.
>
> No gate can trip on this: [vitest.config.ts](../../../../vitest.config.ts) has **no
> coverage thresholds**, and there is no CI.

### The one test outside the connector that touches the registry

[`src/server/lib/repos/__tests__/EventsGraphDataRepo.test.ts`](../../../../src/server/lib/repos/__tests__/EventsGraphDataRepo.test.ts)
asserts only that there are **`>= 3` collections**, containing `twitter`, `basicnetwork`,
and `dummydata`. **It never asserts that `sylva` is registered.** It passes identically
before and after this phase — no test edit is required.

### The 10 surviving test files

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

If any file **other than a Sylva one** disappeared from this list, you deleted too much.

### Boot check

```bash
npm run server
```

The server must start. The log line
`Sylva Oracle: initialized with advanced features support (Phase 6)` must **no longer
appear** (it did at baseline).

---

## Commit

```bash
git commit -m "REMOVED: Delete the Sylva oracle connector

Removes src/server/lib/repos/oracles/sylva (67 files, 10515 LOC, 322 tests)
and unwires it from EventsGraphDataRepo.

The Oracle/Collection/Context extension point is unchanged; Twitter,
BasicNetwork, and DummyData are unaffected.

Recover with:
  git checkout sylva-connector-final -- src/server/lib/repos/oracles/sylva

Constants and env cleanup follow separately (Phase 4)."
```

---

## Exit criteria

- [ ] `npx tsc --noEmit -p tsconfig.server.json` → **clean**
- [ ] `npx tsc --noEmit -p tsconfig.json` → clean
- [ ] `npx vitest run` → **10 files / 131 tests / 0 failures**
- [ ] `git grep -in sylva -- src/server/lib/repos` → no hits
- [ ] Server boots; no `Sylva Oracle: …` log line
- [ ] `git status` shows **only** `EventsGraphDataRepo.ts` modified and the `sylva/` tree deleted

---

## Rollback

Either of these fully restores the connector:

```bash
git revert <this-commit>                                                  # revert THIS commit — safe
git checkout sylva-connector-final -- src/server/lib/repos/oracles/sylva  # restore from the tag
```

> ✅ Reverting **this** commit is safe — it touches only Sylva.
> ❌ Reverting **`5d4be46`** is the trap. Never do that. See the top of this document.

---

## Risks addressed

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| **R1** | Removal by `git revert` destroys shared infra | Medium — it is the *intuitive* approach | **Critical** | This phase mandates `git rm` of a directory only |
| **R3** | A missed coupling breaks the build | **Very low** — 3 files, exhaustively verified | Medium | Gated on `tsc -p tsconfig.server.json`, which catches *every* import |
| **R4** | The test-count drop reads as a regression | Certain (453 → 131) | Low | Expected and documented. The signal is **zero failures**, not the count |
