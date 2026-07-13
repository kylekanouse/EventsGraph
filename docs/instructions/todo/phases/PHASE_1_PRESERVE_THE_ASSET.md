# Phase 1 — Preserve the Asset

**Destructive:** No (creates a tag; changes no files)
**Prerequisite:** [Phase 0 — Preflight & Baseline](PHASE_0_PREFLIGHT_BASELINE.md) complete and green
**Next phase:** [Phase 2 — Land the Foundation](PHASE_2_LAND_THE_FOUNDATION.md)
**Parent:** [Sylva Removal Solutions Architecture](../SYLVA_REMOVAL_SOLUTION_ARCHITECTURE.md)

---

## Orientation

**EventsGraph** is a VR graph-visualization engine: a Node/TypeScript server maps
structured data onto graph nodes and links and streams it over Socket.IO to a React +
A-Frame/three.js VR client.

**Sylva** (formerly *Trellis*) is an external governed-multi-agent platform that
EventsGraph consumes read-only as one of four **oracles** (alongside Twitter,
BasicNetwork, DummyData). We are deleting it.

In the server's DDD layering — `domain/` (contracts) ← `lib/` (shared implementation) ←
`lib/repos/oracles/` (data sources) — an **Oracle** exposes a **Collection**
(`IEventsGraphCollection`) that owns N **Contexts**, each returning
`IGraphData { nodes, links }`. Sylva is a **leaf**: the dependency arrow runs
`oracles → lib → domain` and nothing shared points back at it.

---

## Goal of this phase

Make the connector **permanently recoverable before it is deleted.**

This is 10,515 LOC and 322 test cases of real engineering. **This phase is not a
formality and it is not a footnote.** Once Phase 3 lands and the feature branch is gone,
an untagged connector is recoverable only by someone who already knows the commit SHA.
A tag turns revival into a one-liner.

---

## Why this asset is worth preserving — what is actually in those 10k lines

The connector is not boilerplate. Two things in it would be expensive and error-prone to
re-derive from scratch:

### 1. The mappers encode non-obvious *semantic-to-visual* meaning

The 9 files in `oracles/sylva/mappers/` are pure functions that translate Sylva's
governance domain into visual properties. The encoding is a **designed system**, not an
arbitrary one:

- **`group`** (which drives force-layout clustering, and which the VR client feeds to
  `nodeAutoColorBy('group')`) is a **globally partitioned integer space**:

  | Range | Meaning |
  |---|---|
  | 1–5 | GPA status |
  | 10–13 | channel type |
  | 15–18 | participant type |
  | 20–23 | receipt consequence |
  | 25–27 | coherence |
  | 30–34 | step type |
  | 35–36 | filesystem |
  | 37–40 | federation |

  The partitioning is what keeps clusters from colliding across contexts. Lose it and
  you lose the layout.

- **`color`** carries health semantics: green = PASS / running / improving, red = FAIL /
  stopped / declining, gold = WARN.
- **`val`** (node size) is always a *meaningful magnitude*: remaining execution budget %,
  governance depth, coherence score, file size, step duration.

### 2. The receipt chain is the conceptual heart of the integration

Sylva's domain is the governance and provenance of autonomous agents:

| Concept | Meaning |
|---|---|
| **GPA** (General Purpose Agent) | An agent with a `parentGpaId` delegation tree, execution budget, governance tier, "eigenstate" |
| **Channel** | A communication bus — standard / governed / broadcast / direct |
| **Participant** | Human, agent, service, or webhook — each with a DID and governance depth |
| **Governance Receipt** | The provenance atom: a PASS/FAIL/WARN/INFO verdict with a `parentReceiptId`, forming a **chained DAG** |
| **Execution / Step** | An agent run, decomposed into `guard` / `action` / `verification` / `emit` / `observe` steps |
| **Coherence** | A 0–1 score with an improving / stable / declining trajectory |
| **Federation** | Peer Sylva instances, addressed by `instanceDid` |

**The provenance chain is literally materialized as the receipt chain**: `parentReceiptId`
edges (type `chain`, label `precedes`) are exactly what `ContextGovernanceReceiptChain`
renders in VR.

### 3. The SSE transport is a non-obvious workaround

`SylvaEventBridge` deliberately does **not** use the native `EventSource` API. It uses
`fetch` + `ReadableStream` with manual `\n\n` frame parsing — **because `EventSource`
cannot send an `Authorization` header**, and Sylva's stream is JWT-authenticated. Anyone
rebuilding this from memory will reach for `EventSource` first and lose a day.

---

## What exactly is being tagged (the 67 files)

```
src/server/lib/repos/oracles/sylva/
├── Sylva.ts                      ← the Collection root (extends Oracle)
├── SylvaConnectionManager.ts     ← the ONLY thing that speaks HTTP: JWT auth + fetch wrapper
├── SylvaEventBridge.ts           ← one shared SSE connection, fanned out by event type
├── types.ts
├── contexts/    (14)  ContextAgentTopology, ContextGovernanceReceiptChain,
│                      ContextChannelNetwork, ContextExecutionTree,
│                      ContextCrossChannelKnowledge, ContextFilesystemTree,
│                      ContextFederationMesh, ContextCoherenceLandscape,
│                      ContextInstanceOverview, ContextExecutionTrends,
│                      ContextComplianceOverview, ContextFleetHealth,
│                      ContextViolationNetwork, ContextCoherenceHeatmap
├── mappers/     (9)   gpa, channel, participant, receipt, step,
│                      coherence, federation, filesystem, event
├── services/    (8)   SylvaAnalyticsService, SylvaObservabilityClient,
│                      SylvaSnapshotCache, SylvaGraphDiff, SylvaGraphSearch,
│                      SylvaSubgraphExtractor, SylvaNodeDetail, SylvaCrossContextNav
└── __tests__/   (32)  322 test cases
```

---

## Preconditions

- Phase 0 exit criteria met: on `rename/trellis-to-sylva`, tree clean, 42 files / 453
  tests green, both typechecks clean.
- The connector still exists on disk (you have not started Phase 3).

Confirm:

```bash
git branch --show-current                                  # expect: rename/trellis-to-sylva
test -d src/server/lib/repos/oracles/sylva && echo PRESENT # expect: PRESENT
```

---

## Steps

### 1. Tag the tip of the branch that still contains the connector

```bash
git tag -a sylva-connector-final -m "Final state of the Sylva (ex-Trellis) oracle before removal.
67 files, 10515 LOC, 322 tests. Restore with:
  git checkout sylva-connector-final -- src/server/lib/repos/oracles/sylva"
```

The restore incantation lives **inside the tag message** deliberately — so that
`git show sylva-connector-final` is self-documenting even to someone who never finds the
CHANGELOG.

### 2. Verify the tag actually captured the connector

```bash
git show sylva-connector-final --stat | head -20
git ls-tree -r --name-only sylva-connector-final -- src/server/lib/repos/oracles/sylva | wc -l
```

The second command must print **67**. If it prints 0, the tag is pointing at the wrong
commit — delete it (`git tag -d sylva-connector-final`) and re-tag while on the correct
branch.

### 3. Push the tag if a remote is in play

```bash
git push origin sylva-connector-final
```

> The branch is currently **unpushed** (8 commits ahead of `master`, local only). If there
> is no remote yet, the local tag is still sufficient for Phase 3 to proceed — but the
> asset is then only as durable as this working copy. **Push the tag as soon as a remote
> exists.** A local-only tag on a laptop is not a backup.

### 4. Carry the incantation forward

Note the restore command. [Phase 5](PHASE_5_DOCUMENT.md) requires it to be written into
the CHANGELOG, which is where a reader six months from now will actually look:

```bash
git checkout sylva-connector-final -- src/server/lib/repos/oracles/sylva
```

---

## Verification / Exit criteria

- [ ] `git tag -l` lists `sylva-connector-final`
- [ ] `git ls-tree -r --name-only sylva-connector-final -- src/server/lib/repos/oracles/sylva | wc -l` → **67**
- [ ] `git show sylva-connector-final --stat` lists connector files
- [ ] Tag pushed to remote **if** a remote exists

---

## Rollback

`git tag -d sylva-connector-final` (and `git push --delete origin sylva-connector-final`
if pushed). Nothing else changed.

---

## Risk this phase mitigates

| Risk | Likelihood | Impact | How this phase addresses it |
|---|---|---|---|
| **R2** — the connector is lost and later needed | Low | **High** — 10k LOC to re-derive, including the non-obvious mapper semantics and the `EventSource`-can't-send-auth-headers workaround | A tag makes revival a one-liner instead of an archaeology project |

---

## ⚠️ Do not skip ahead

**Phase 3 is the point of no return. Do not begin it until this tag exists and verifies.**
Everything after this phase assumes the asset is safe.
