# Sylva Connector — Removal Solutions Architecture

**Status:** Proposed
**Author:** Engineering
**Date:** 2026-07-13
**Target branch at time of writing:** `rename/trellis-to-sylva` (8 commits ahead of `master`, unpushed)
**Scope:** Complete removal of the Sylva (formerly Trellis) oracle from EventsGraph

---

## 1. Executive Summary

Sylva is a **self-contained, feature-flagged, leaf-node oracle**. Removing it is a low-risk, high-yield operation — but there is **one trap that will destroy the codebase if you take the obvious approach**.

| Metric | Value |
|---|---|
| Files in the connector | 67 (41 source + 32 test — some dirs overlap) |
| Total LOC | 10,515 (4,775 source / 5,740 test) |
| Test cases removed | 322 of 453 (71% of the suite) |
| **Code files outside the connector needing edits** | **3** |
| npm dependencies orphaned | **0** |
| Client-side files needing edits | **0** |
| CI / Docker / build files needing edits | **0** (none exist) |
| Docs needing rewriting | **0** (1 CHANGELOG entry to add) |
| Shared domain interfaces that break | **0** |

**Headline:** deleting `src/server/lib/repos/oracles/sylva/` plus edits to **three files** (`EventsGraphDataRepo.ts`, `constants.ts`, `.env.example`) removes Sylva completely. Nothing else in the system knows it exists.

### ⚠️ The one trap

**Do not remove Sylva by reverting commits.** Commit `5d4be46` ("Anchor /server/ in .gitignore and add 60 orphaned src/server source files") bundles the Sylva sources together with **eight files of shared, load-bearing infrastructure** that `master` does not have:

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

Reverting that commit to "undo Sylva" would delete the shared logger and zod schemas and take the server build down with it. **Removal must be surgical (`git rm` a directory), never historical (`git revert`).**

---

## 2. What Sylva Is — Conceptual Deep Dive

### 2.1 The system

Sylva (renamed from **Trellis** in commit `5d0f1e0`; the rename was cosmetic — upstream API paths and the service DID were deliberately left unchanged) is an **external, self-hosted governed-multi-agent platform** in the PCN (Provenance Chain Network) product family. EventsGraph consumes it as a **strictly read-only data source** — it never writes to Sylva.

EventsGraph itself is a **VR graph-visualization engine**: it maps arbitrary structured data onto physics, space, color, and sound so a human can use innate spatial reasoning to understand it. Sylva is one of four *oracles* feeding it data, alongside Twitter, BasicNetwork, and DummyData.

### 2.2 Transport & auth

Two transports, both built on the global `fetch` (no HTTP client dependency):

- **REST/HTTP** — JWT bearer auth. A token is acquired via `POST /api/auth/token` with `{did, workspaceId}`, auto-refreshed 5 minutes before expiry, and retried once on a 401.
- **SSE** — `GET /api/events/stream?eventTypes=...`. Notably **not** the native `EventSource` API: it uses `fetch` + `ReadableStream` with manual `\n\n` frame parsing, specifically because `EventSource` cannot send an `Authorization` header.

Identity is **DID-based** (`SYLVA_DID=did:pcn:service:eventsgraph`) — EventsGraph authenticates *as a PCN service identity*.

### 2.3 The domain model

Sylva's world is **governance and provenance of autonomous agents**:

| Concept | Meaning |
|---|---|
| **GPA** (General Purpose Agent) | An agent, with a `parentGpaId` delegation tree, an execution budget, a governance tier, and an "eigenstate" |
| **Channel** | A communication bus — standard / governed / broadcast / direct |
| **Participant** | Human, agent, service, or webhook — each with a DID and a governance depth |
| **Governance Receipt** | The provenance atom: a PASS/FAIL/WARN/INFO verdict with a `parentReceiptId`, forming a **chained DAG** |
| **Execution / Step** | An agent run, decomposed into `guard` / `action` / `verification` / `emit` / `observe` steps |
| **Coherence** | A 0–1 score with an improving / stable / declining trajectory |
| **Federation** | Peer Sylva instances, addressed by `instanceDid` |

**The provenance chain is literally materialized as the receipt chain**: `parentReceiptId` edges (type `chain`, label `precedes`) are exactly what `ContextGovernanceReceiptChain` renders in VR. This is the conceptual heart of the integration.

### 2.4 Architecture

```
Sylva service (HTTP + SSE)
      │
      ├── SylvaConnectionManager ──── auth + fetch wrapper (the ONLY thing that speaks HTTP)
      │        ├── SylvaEventBridge ──── one shared SSE conn, fan-out by event type
      │        ├── SylvaObservabilityClient ─ capability probe (HEAD) + optional endpoints
      │        │        └── SylvaAnalyticsService ─ observability-first, falls back to
      │        │                                    client-side aggregation; 30s TTL cache
      │        └── SylvaNodeDetailService (dead — never invoked)
      │
      └── 14 Contexts ──> 9 mappers ──> {IGraphNode[], IGraphLink[]} ──> Utils.buildResponse()
                                                                              │
                                    Sylva.getData() post-processing (Phase 6) ┤ diff / subgraph / search
                                                                              ▼
                                                IEventsGraphCollectionContextResponse → socket.io → VR client
```

**The mappers are the interesting part.** They are pure functions encoding **semantic-to-visual meaning** — this is the real intellectual asset in the connector:

- `group` (force-layout clustering) is a **globally partitioned integer space**: GPA status 1–5, channel type 10–13, participant type 15–18, receipt consequence 20–23, coherence 25–27, step type 30–34, filesystem 35–36, federation 37–40.
- `color` carries health semantics: green = PASS/running/improving, red = FAIL/stopped/declining, gold = WARN.
- `val` (node size) is always a meaningful magnitude: remaining execution budget %, governance depth, coherence score, file size, step duration.

### 2.5 Why removal is easy: Sylva *forked away from* the shared abstractions

This is the key architectural fact. The Twitter oracle is built on the shared `Entity` / `EntityCollection` / `IGraphEntity` object model. **Sylva uses none of it** — no `Entity`, no `EntityCollection`, no `Utils.createNode`/`createLink`. It touches exactly **one** shared Utils export (`buildResponse`) and substitutes its own pure mapper functions returning plain object literals.

So Sylva never *leaked into* the shared abstractions — it *diverged from* them. That divergence is an architectural smell in normal times, but it is precisely what makes this deletion clean: **the dependency arrow points only one way, Sylva → shared.** Nothing shared points back.

### 2.6 Dead code already present (delete without ceremony)

- `services/SylvaCrossContextNav.ts` (102 LOC) — imported by nothing; `getCrossContextLinks` has zero call sites repo-wide.
- `AdvancedParams.crossContextNav` and `AdvancedParams.nodeDetail` — declared in `types.ts` but never read by `Sylva.getData()`.
- `SylvaNodeDetailService` — instantiated and exposed via a getter, never invoked by any request path.

---

## 3. Complete Coupling Inventory

Everything outside `oracles/sylva/` that knows Sylva exists. **This list is exhaustive** (verified by repo-wide grep).

| # | File | Lines | Nature | Action |
|---|---|---|---|---|
| 1 | `src/server/lib/repos/EventsGraphDataRepo.ts` | `:8` | `import Sylva from './oracles/sylva/Sylva'` | Delete line |
| 2 | `src/server/lib/repos/EventsGraphDataRepo.ts` | `:51-53` | Env-gated registration block | Delete block |
| 3 | `src/server/constants.ts` | `:164-183` | 15 `SYLVA_*` constants (1 collection + 14 context IDs) | Delete block |
| 4 | `.env.example` | `:5-10` | 5 `SYLVA_*` vars | Delete block |
| 5 | `CHANGELOG.md` | `:7-34` | The Trellis→Sylva rename entry | Supersede with removal entry |

### Confirmed non-coupling (verified negative)

- **Client:** zero Sylva references. The oracle dropdown at `src/client/components/controls/requests/RequestControls.tsx:29-36` is a **static 6-entry array** that never listed Sylva. Node types are derived dynamically from arriving graph data, never hardcoded. No Sylva icons, styles, routes, or components exist.
- **Tests outside the connector:** `EventsGraphDataRepo.test.ts:14-17` asserts only `>= 3` collections containing `twitter`, `basicnetwork`, `dummydata`. It **never asserts `sylva` is registered** — it passes identically after removal.
- **Dependencies:** the connector imports **zero** node_modules packages (every import is relative; networking is global `fetch`). `zod`, `socket.io`, `pino` are all shared. **Nothing can be dropped from `package.json`.**
- **Config:** `src/server/configs.ts` has no Sylva reference (MongoDB only). All Sylva env reads are inline `process.env`.
- **Infra:** no `.github/`, no Dockerfile, no docker-compose, no Makefile, no `scripts/`. Nothing to change.
- **Docs:** `docs/instructions/ai/EVENTSGRAPH_API_CONNECTOR_SPEC.md` (948 lines) documents the *generic* Oracle/Collection/Context pattern with **zero** Sylva references. No architecture doc needs rewriting.
- **Test gates:** `vitest.config.ts` has **no coverage thresholds**, no `testPathIgnorePatterns`, no setup files. Deleting 322 tests cannot fail a gate.

### One piece of residue

`IGraphNode.color` is a shared, optional field that **only Sylva populates** (Twitter/BasicNetwork/DummyData never set it; shared `Utils.createNode()` doesn't even accept it). After removal it becomes dead surface area. It predates the connector (added in `b803ee6`), so it is *not* Sylva's to delete — see Phase 4 for the decision.

---

## 4. Prerequisite: The `master` Problem

**`master` does not currently build.** Its server typecheck fails immediately:

```
Trellis.ts(3,42): error TS2307: Cannot find module './TrellisConnectionManager'
Trellis.ts(8,34): error TS2307: Cannot find module './contexts/ContextAgentTopology'
index.ts(5,24):   error TS2307: Cannot find module './lib/logger'
```

Cause: an **unanchored `server/` rule** in `.gitignore` was silently ignoring `src/server/**`, so ~62 source files — including shared `logger.ts` and `schemas.ts` — were never committed. They existed only on one developer's disk. The `rename/trellis-to-sylva` branch fixed this (commit `5d4be46`) and is **green** (42 test files, 453 tests passing; server typecheck clean).

**Therefore: `rename/trellis-to-sylva` — not `master` — is the only correct baseline for this work.**

### Route decision

| | Route A — Merge, then remove **(RECOMMENDED)** | Route B — Cherry-pick, never merge |
|---|---|---|
| **How** | Merge `rename/trellis-to-sylva` → `master` as-is (it's green), then remove Sylva in a clean follow-up PR | Cherry-pick only the gitignore fix + 8 shared files onto `master`; never land the rename; delete Sylva |
| **Pro** | Linear, low-risk, each PR is independently reviewable and revertable; baseline is a known-green tree | Avoids ~10k LOC of add-then-delete churn in history |
| **Con** | History briefly contains a rename of code that is then deleted | Requires commit surgery; high risk of leaving `master` broken; harder to review |
| **Verdict** | ✅ **Take this.** The churn is cosmetic; correctness and reviewability dominate. | ❌ Only if a hard "no dead code in history" policy exists. |

The rest of this document assumes **Route A**.

---

## 5. Multi-Phase Removal Strategy

Six phases. Phases 0–2 are reversible and land no destructive change; Phase 3 is the point of no return.

---

### Phase 0 — Preflight & Baseline

**Goal:** prove the starting tree is green and capture the numbers you will verify against later.

**Steps**
1. Confirm you are on `rename/trellis-to-sylva` with a clean tree.
2. Capture the baseline:
   ```bash
   npx tsc --noEmit -p tsconfig.json          # expect: clean
   npx tsc --noEmit -p tsconfig.server.json   # expect: clean
   npx vitest run                             # expect: 42 files, 453 tests, all pass
   ```
3. Record the numbers. These are your regression oracle.

**Exit criteria:** both typechecks clean; 42/453 green.

**Rollback:** n/a (read-only).

---

### Phase 1 — Preserve the Asset

**Goal:** make the connector permanently recoverable *before* deleting it. This is 10,515 LOC and ~322 tests of real engineering; the mappers encode non-obvious visual semantics that would be expensive to re-derive.

**Steps**
1. Tag the tip of the branch that still contains the connector:
   ```bash
   git tag -a sylva-connector-final -m "Final state of the Sylva (ex-Trellis) oracle before removal.
   67 files, 10515 LOC, 322 tests. Restore with:
     git checkout sylva-connector-final -- src/server/lib/repos/oracles/sylva"
   ```
2. Push the tag if/when the remote is in play: `git push origin sylva-connector-final`.
3. Record the restore incantation in the CHANGELOG entry written in Phase 5.

**Exit criteria:** tag exists and `git show sylva-connector-final --stat` lists the connector.

**Why this is a phase and not a footnote:** once Phase 3 lands and the branch is gone, an untagged connector is recoverable only by someone who knows the commit SHA. A tag makes revival a one-liner.

---

### Phase 2 — Land the Foundation (unbreak `master`)

**Goal:** get the shared-infrastructure fix onto `master` **independently of the removal**, so that if the removal is ever reverted, `master` still builds.

**Steps**
1. Open a PR: `rename/trellis-to-sylva` → `master`.
2. Merge it. This lands the `.gitignore` anchoring fix, `logger.ts`, `schemas.ts`, and the 5 shared test files — and incidentally the Sylva rename.
3. Verify on `master`: both typechecks clean, 453 tests green.

**Exit criteria:** `master` builds and is green for the first time.

**Rollback:** revert the merge. (Note this returns `master` to its broken state — which is the status quo, not a regression.)

**Note:** it is legitimate to feel that merging a rename you are about to delete is wasted motion. It is not: this merge is the *only* thing that repairs the shared-infrastructure gap, and coupling that repair to the removal PR would make both harder to review and impossible to revert independently.

---

### Phase 3 — Excise the Connector

**Goal:** the destructive step. One PR, mechanically verifiable.

**Steps**
1. Branch from `master`: `git checkout -b remove/sylva-connector`.
2. Delete the tree:
   ```bash
   git rm -r src/server/lib/repos/oracles/sylva
   ```
3. Unwire `src/server/lib/repos/EventsGraphDataRepo.ts`:
   - Delete line 8 (`import Sylva from './oracles/sylva/Sylva'`).
   - Delete the registration block at lines 51–53:
     ```ts
     if (process.env.SYLVA_ENABLED === 'true') {
       entries.push([Sylva.getID(), Sylva])
     }
     ```
   - The `entries` array should be left with exactly `Twitter`, `BasicNetwork`, `DummyData`. Confirm `entries` no longer needs to be `let`/mutable — simplify to a direct `new Map([...])` if the `push` was its only mutation.
4. **Do not touch anything else in this commit.** Constants and env cleanup are Phase 4 — keeping them separate makes the "did the app still work" question answerable in isolation.

**Verification (must all pass):**
```bash
npx tsc --noEmit -p tsconfig.server.json   # must be clean — this is the real gate
npx tsc --noEmit -p tsconfig.json
npx vitest run                             # expect: 10 files, 131 tests, all pass
git grep -il sylva -- src/server/lib/repos # expect: only constants-driven hits, none in repos/
```

**Expected test delta:** 42 → 10 files, 453 → 131 tests. **A count of 131 passing with zero failures is the success signal.** Any *failure* (as opposed to reduction) means a coupling was missed.

**Exit criteria:** server typecheck clean; 131/131 green; app boots.

**Rollback:** `git revert` the commit, or `git checkout sylva-connector-final -- src/server/lib/repos/oracles/sylva`.

---

### Phase 4 — Clean the Shared Surface

**Goal:** remove Sylva's footprint from files that survive. Separate PR (or separate commit) from Phase 3 so that a bisect can distinguish "deletion broke it" from "cleanup broke it".

**Steps**
1. `src/server/constants.ts` — delete lines **163–183** (the `SYLVA_*` block: `SYLVA_COLLECTION_ID` + 14 context IDs). Nothing outside the deleted connector imports these; verify with `git grep -n "SYLVA_"`.
   - **Correction (verified during execution):** the range is **163**–183, not 164–183. Line 163 is the block's JSDoc opener (`/**`); deleting from 164 orphans it, and the dangling comment swallows the next declaration. Gate on `tsc -p tsconfig.server.json` to catch a bad splice.
2. `.env.example` — delete lines 5–10 (the `# Sylva Connector` block: `SYLVA_ENABLED`, `SYLVA_BASE_URL`, `SYLVA_DID`, `SYLVA_WORKSPACE_ID`, `SYLVA_PARTICIPANT_NAME`).
   - Note `SYLVA_PARTICIPANT_NAME` was already **dead** — zero consumers anywhere in the tree.
3. **Decide on `IGraphNode.color`.** Sylva was its only producer. Options:
   - **Keep (recommended).** It's an optional field on a shared interface, it predates Sylva, and it is a reasonable capability for a future oracle. Cost of keeping: zero. Leave it and move on.
   - **Remove.** Only if you are actively minimizing the domain surface. **Do not bundle this into the removal PR.**

   > **Correction (verified during execution).** An earlier draft of this section claimed "the client *reads* `color` … so removing it is a client-side change too." **That is false.** The client never imports `IGraphNode` at all (`git grep -rn IGraphNode -- src/client` → no hits); it declares its own structurally-independent `src/client/types/GraphNodeData.d.ts`. Removing the server field would be a **pure server-side type change**.
   >
   > The recommendation to **keep** still stands, but for a different reason: the client colors nodes via `nodeAutoColorBy('group')` (`Graph.ts:32,121`), and `3d-force-graph`'s `nodeAutoColorBy` only colors nodes that do **not** already carry a `color`. So an explicit `color` on the wire *is* honored by the renderer at runtime — the capability is real and wired end to end, merely unexercised now that Sylva is gone.
4. Developer hygiene: any local `.env` still carrying `SYLVA_*` keys is now inert. Stale compiled JS under `/server/` and `dist/` is gitignored and untracked; it will regenerate cleanly on next build. Optionally `rm -rf server/ dist/ coverage/` locally.

**Verification:**
```bash
git grep -i sylva -- . ':!CHANGELOG.md' ':!docs/'   # expect: ZERO hits
npx tsc --noEmit -p tsconfig.server.json
npx vitest run                                       # still 131/131
```

**Exit criteria:** `git grep -i sylva` returns nothing outside CHANGELOG and this document.

**Rollback:** revert the commit; purely additive-to-restore.

---

### Phase 5 — Document

**Goal:** leave a trail that explains *why* 10k LOC vanished and *how* to get it back.

**Steps**
1. `CHANGELOG.md` — the current `[Unreleased]` section (lines 7–34) documents the Trellis→Sylva rename, which is now moot. **Replace it** (do not append to it) with a removal entry:
   - What was removed (the Sylva oracle: 67 files, 14 contexts, 9 mappers, REST+SSE client).
   - Why.
   - That the Oracle/Collection/Context extension point is **unchanged** — Twitter, BasicNetwork, and DummyData are unaffected, and the generic connector spec in `docs/instructions/ai/` remains authoritative for building a replacement.
   - The recovery incantation: `git checkout sylva-connector-final -- src/server/lib/repos/oracles/sylva`.
2. Move this document from `docs/instructions/todo/` to `docs/instructions/done/`.

**Exit criteria:** a reader six months from now can answer "where did Sylva go, and how do I bring it back?" from the CHANGELOG alone.

---

### Phase 6 — Post-Removal Verification

**Goal:** prove the *product* still works, not just that the compiler is happy.

**Steps**
1. Boot the server and confirm it starts with no Sylva log lines (baseline logs currently emit `Sylva Oracle: initialized with advanced features support (Phase 6)` — this must be gone).
2. Drive the real app: open the VR client, and for each of the 6 entries in the `RequestControls` dropdown (DummyData Basic, BasicNetwork Operations, and the 4 Twitter contexts), issue a request and confirm the graph renders.
3. Confirm the streaming path still works on a streamable context (the `SylvaEventBridge` SSE machinery is gone, but Socket.IO — the browser↔EventsGraph transport — is untouched and must be unaffected).
4. Confirm no client console errors referencing a missing `sylva` collection.

**Exit criteria:** all 6 dropdown contexts render; streaming works; no errors.

---

## 6. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Removal by `git revert` destroys shared infra** (`logger.ts`, `schemas.ts`, `.gitignore` fix) | Medium — it's the *intuitive* approach | **Critical** — server won't build | §1 trap callout; Phase 3 mandates `git rm` of a directory only. Never revert `5d4be46`. |
| R2 | The connector is lost and later needed | Low | High — 10k LOC to re-derive, incl. non-obvious mapper semantics | Phase 1 tags `sylva-connector-final` **before** deletion |
| R3 | A missed coupling breaks the build | **Very low** — 3 files, exhaustively verified | Medium | Phase 3 gates on `tsc -p tsconfig.server.json`, which catches every import |
| R4 | Test count drop reads as a regression | Certain (453 → 131) | Low | Expected and documented. The signal is **zero failures**, not the count. No coverage threshold exists to trip. |
| R5 | Merging the rename before deleting feels wasteful, tempting a shortcut | Medium | High — the shortcut is R1 | Phase 2 explains why the merge is load-bearing |
| R6 | `master` left broken if removal is reverted | Low | Medium | Phase 2 lands the infra fix in a **separate, independently-revertable** merge |
| R7 | `IGraphNode.color` cleanup silently breaks the VR renderer | Low | Medium | Phase 4 explicitly **defers** this; it is not part of the removal |

---

## 7. Summary Checklist

```
Phase 0  □ Baseline green on rename/trellis-to-sylva (42 files / 453 tests, both typechecks clean)
Phase 1  □ git tag -a sylva-connector-final   ← DO THIS BEFORE ANY DELETION
Phase 2  □ Merge rename/trellis-to-sylva → master (unbreaks master; lands logger/schemas/.gitignore)
Phase 3  □ git rm -r src/server/lib/repos/oracles/sylva
         □ EventsGraphDataRepo.ts: delete import (:8) + registration block (:51-53)
         □ Gate: tsc -p tsconfig.server.json clean; vitest 131/131 green
Phase 4  □ constants.ts: delete SYLVA_* block (:164-183)
         □ .env.example: delete SYLVA_* block (:5-10)
         □ Defer IGraphNode.color decision (recommend: keep)
         □ Gate: git grep -i sylva → zero hits outside CHANGELOG/docs
Phase 5  □ CHANGELOG: replace rename entry with removal entry + recovery command
         □ Move this doc to docs/instructions/done/
Phase 6  □ Boot server; no Sylva log lines
         □ All 6 RequestControls dropdown contexts render in VR
         □ Streaming + Socket.IO unaffected
```

---

## 8. Appendix — Verification Commands

```bash
# Baseline / regression
npx tsc --noEmit -p tsconfig.json
npx tsc --noEmit -p tsconfig.server.json     # THE gate — catches every dangling import
npx vitest run

# Coupling audit (should be exhaustive)
git grep -in sylva -- ':!src/server/lib/repos/oracles/sylva'
git grep -n "SYLVA_"

# Confirm no orphaned dependency (expect: only 'vitest', from test files)
git grep -h "^import .* from '[^.]" -- src/server/lib/repos/oracles/sylva | sort -u

# Recovery, if ever needed
git checkout sylva-connector-final -- src/server/lib/repos/oracles/sylva
```
