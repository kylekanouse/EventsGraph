# Phase 4 — Clean the Shared Surface

**Destructive:** Yes (cleanup only — deletes dead constants and dead config)
**Prerequisite:** [Phase 3 — Excise the Connector](PHASE_3_EXCISE_THE_CONNECTOR.md) complete; server typecheck clean; 10 files / 131 tests green
**Next phase:** [Phase 5 — Document](PHASE_5_DOCUMENT.md)
**Parent:** [Sylva Removal Solutions Architecture](../SYLVA_REMOVAL_SOLUTION_ARCHITECTURE.md)

---

## Orientation

**EventsGraph** is a VR graph-visualization engine: a Node/TypeScript server maps
structured data onto graph nodes and links and streams it over Socket.IO to a React +
A-Frame/three.js VR client. **Sylva** (formerly *Trellis*) was one of its four **oracles**.
Phase 3 deleted the connector directory and unwired it from `EventsGraphDataRepo`.

**After Phase 3 the app is already fully Sylva-free at runtime.** What survives is
*residue*: dead constants and dead env config in files that were never Sylva's to own. This
phase removes that residue.

**This is a separate commit from Phase 3 on purpose.** If something breaks, `git bisect`
must be able to tell "the deletion broke it" apart from "the cleanup broke it."

---

## Goal of this phase

Get `git grep -i sylva` to return **zero hits** outside `CHANGELOG.md` and `docs/`.

---

## ⚠️ Two corrections to the architecture document

Both were verified against the actual tree. **Follow this document, not the parent, where
they disagree.**

### Correction 1 — the `constants.ts` range is `163–183`, not `164–183`

The architecture document says "delete lines 164–183." **Line 163 is the block's JSDoc
opener (`/**`).** Deleting from 164 leaves a dangling `/**` that swallows the next
declaration and breaks the file. **Delete from 163.**

### Correction 2 — the client does *not* read `IGraphNode.color`

The architecture document says removing `IGraphNode.color` "is a client-side change too"
because "the client *reads* `color`." **This is false.** The client **never imports
`IGraphNode`** — verified: `git grep -rn "IGraphNode" -- src/client` returns nothing. It
declares its own structurally-independent type,
[`src/client/types/GraphNodeData.d.ts`](../../../../src/client/types/GraphNodeData.d.ts),
which has its own `color?: string`.

The recommendation (**keep the field**) does not change, but the *reason* does — and the
false reason should not be used to defend it. See the decision section below.

---

## Preconditions

- [ ] Phase 3 committed: `src/server/lib/repos/oracles/sylva/` is gone
- [ ] `npx tsc --noEmit -p tsconfig.server.json` → clean
- [ ] `npx vitest run` → 10 files / 131 tests / 0 failures
- [ ] You are on `remove/sylva-connector` (or a follow-up branch off it)

---

## Steps

### 1. `src/server/constants.ts` — delete the `SYLVA_*` block (lines **163–183**)

These 15 constants are the collection id plus the 14 context ids. **Nothing outside the
already-deleted connector ever imported them** — they are now unreachable dead code.

**Delete lines 163 through 183 inclusive** — the JSDoc header, the collection id, and all
14 context ids:

```ts
  /**                                                                            ← 163  DELETE FROM HERE
   * Sylva
   */

  static readonly SYLVA_COLLECTION_ID: string = 'sylva'

  static readonly SYLVA_AGENT_TOPOLOGY_CONTEXT_ID: string = 'agent-topology'
  static readonly SYLVA_RECEIPT_CHAIN_CONTEXT_ID: string = 'governance-receipt-chain'
  static readonly SYLVA_CHANNEL_NETWORK_CONTEXT_ID: string = 'channel-network'
  static readonly SYLVA_EXECUTION_TREE_CONTEXT_ID: string = 'execution-tree'
  static readonly SYLVA_CROSS_CHANNEL_CONTEXT_ID: string = 'cross-channel-knowledge'
  static readonly SYLVA_FILESYSTEM_TREE_CONTEXT_ID: string = 'filesystem-tree'
  static readonly SYLVA_FEDERATION_MESH_CONTEXT_ID: string = 'federation-mesh'
  static readonly SYLVA_COHERENCE_LANDSCAPE_CONTEXT_ID: string = 'coherence-landscape'
  static readonly SYLVA_INSTANCE_OVERVIEW_CONTEXT_ID: string = 'instance-overview'
  static readonly SYLVA_EXECUTION_TRENDS_CONTEXT_ID: string = 'execution-trends'
  static readonly SYLVA_COMPLIANCE_OVERVIEW_CONTEXT_ID: string = 'compliance-overview'
  static readonly SYLVA_FLEET_HEALTH_CONTEXT_ID: string = 'fleet-health'
  static readonly SYLVA_VIOLATION_NETWORK_CONTEXT_ID: string = 'violation-network'
  static readonly SYLVA_COHERENCE_HEATMAP_CONTEXT_ID: string = 'coherence-heatmap'
                                                                                 ← 183  DELETE TO HERE
```

The result should splice cleanly: the `TWITTER_TWEET_NO_ID_PROVIDED` constant (line 161)
is followed by a blank line and then the `/** Client */` block that currently begins at
line 185.

**Do not trust the line numbers blindly** — if anything has shifted, delete *the block*,
matched by content, and verify with the grep below.

**Verify:**

```bash
git grep -n "SYLVA_" -- src/server/constants.ts   # expect: ZERO hits
npx tsc --noEmit -p tsconfig.server.json          # expect: clean (catches a broken JSDoc splice)
```

### 2. `.env.example` — delete the `SYLVA_*` block (lines **5–10**)

**Before:**

```bash
# FILE: /.env
SERVER_ENV=PROD
GRAPH_DATA_URL=

# Sylva Connector (formerly Trellis)      ← 5   DELETE FROM HERE (incl. the blank line 4 above)
SYLVA_ENABLED=true
SYLVA_BASE_URL=http://localhost:3100
SYLVA_DID=did:pcn:service:eventsgraph
SYLVA_WORKSPACE_ID=default
SYLVA_PARTICIPANT_NAME=EventsGraph VR    ← 10  DELETE TO HERE
```

**After — the file is three lines:**

```bash
# FILE: /.env
SERVER_ENV=PROD
GRAPH_DATA_URL=
```

Notes:

- **`SYLVA_PARTICIPANT_NAME` was already dead** before this whole operation — zero
  consumers anywhere in the tree. It was documented config for a feature that never read it.
- **There is a second tracked `.env.example` at
  [`src/server/.env.example`](../../../../src/server/.env.example).** It contains only
  MongoDB and Twitter keys — **zero Sylva vars. Do not touch it.** (Called out so you don't
  go hunting for a Sylva block that isn't there.)
- `src/server/configs.ts` has no Sylva reference either (MongoDB only). All Sylva env reads
  were inline `process.env` inside the connector, which is now gone.

### 3. Decide on `IGraphNode.color` — **recommendation: KEEP. Do nothing.**

[`src/server/domain/IGraphNode.ts`](../../../../src/server/domain/IGraphNode.ts):

```ts
export default interface IGraphNode {
  id: string,
  group: number,
  label: string,
  val: number,
  desc: string,
  icon: string,
  type: string,
  url: string,
  color?: string,      // ← Sylva was its only producer
  image?: string
}
```

**The situation, accurately stated:**

- Sylva was the **only** producer of `color`. Twitter, BasicNetwork, and DummyData never
  set it, and the shared `Utils.createNode()` does not even accept it.
- The field **predates** the connector (added in `b803ee6`). It is **not Sylva's to delete**.
- **The client does not import `IGraphNode` at all.** It has its own independent
  `GraphNodeData.d.ts`. So removing the server field is a **pure server-side type change**
  — *not* the client-side change the architecture document claims.
- However, the client renders node color via **`nodeAutoColorBy('group')`**
  ([`Graph.ts:32`](../../../../src/client/lib/Graph.ts#L32),
  [`Graph.ts:121`](../../../../src/client/lib/Graph.ts#L121)). In `3d-force-graph`,
  `nodeAutoColorBy` only assigns a color to nodes that **do not already carry one** — so a
  `color` on the wire *is* honored by the rendering library at runtime. The capability is
  real; it is just currently unexercised.

**Decision: keep it.**

| | Keep ✅ | Remove |
|---|---|---|
| Cost | Zero. It's an optional field on a shared interface that predates Sylva. | A domain-surface change, plus re-verifying the VR renderer. |
| Benefit | A future oracle can override force-graph's auto-coloring — a genuinely useful capability, and the mechanism is already wired end to end. | Marginally smaller domain surface. |

**If someone insists on removing it anyway:** that is a **separate PR**, not part of this
removal. It is a domain-model decision, not Sylva residue. **Do not bundle it here.**
(This is risk **R7** — `IGraphNode.color` cleanup silently changing VR rendering behavior.)

### 4. Developer hygiene (local, optional, uncommitted)

- Any local `.env` still carrying `SYLVA_*` keys is now **inert** — nothing reads them.
  Harmless; delete at leisure.
- Stale compiled JS under `/server/` and `dist/` is gitignored and untracked. It will
  regenerate cleanly on the next build. Optionally:

  ```bash
  rm -rf server/ dist/ coverage/
  ```

  ⚠️ Note `/server/` (compiled output, gitignored) is **not** `src/server/` (the TypeScript
  sources). Confusing the two is the exact bug that broke `master` in the first place —
  see [Phase 2](PHASE_2_LAND_THE_FOUNDATION.md).

---

## Verification — the phase gate

```bash
# THE GATE: zero Sylva anywhere outside the changelog and docs
git grep -i sylva -- . ':!CHANGELOG.md' ':!docs/'     # expect: ZERO hits

# Nothing broke
npx tsc --noEmit -p tsconfig.server.json              # expect: clean
npx tsc --noEmit -p tsconfig.json                     # expect: clean
npx vitest run                                        # expect: still 10 files / 131 tests / 0 failures
```

The test count must be **unchanged from Phase 3** (131). This phase deletes no tests. If
the count moves, you deleted something you shouldn't have.

---

## Commit

```bash
git commit -am "REMOVED: Drop dead SYLVA_* constants and env vars

Removes the 15 SYLVA_* constants from src/server/constants.ts and the
5 SYLVA_* vars from .env.example. All were unreachable after the
connector was deleted.

IGraphNode.color is deliberately retained: it predates the connector and
remains a valid capability for a future oracle (3d-force-graph honors a
node color over nodeAutoColorBy)."
```

---

## Exit criteria

- [ ] `git grep -i sylva -- . ':!CHANGELOG.md' ':!docs/'` → **zero hits**
- [ ] `git grep -n "SYLVA_"` → zero hits
- [ ] Both typechecks clean
- [ ] `npx vitest run` → 10 files / 131 tests / 0 failures (unchanged from Phase 3)
- [ ] `IGraphNode.color` still present (unless a deliberate, separate decision was made)
- [ ] `src/server/.env.example` untouched

---

## Rollback

`git revert` this commit. It is purely subtractive — restoring it is safe and has no side
effects. The constants it restores are dead either way.

---

## Risks addressed

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| **R7** | `IGraphNode.color` cleanup silently breaks the VR renderer | Low | Medium | This phase explicitly **defers** it. It is not part of the removal. |
| — | A bad JSDoc splice in `constants.ts` silently comments out the next block | Low | Medium | Delete from line **163**, not 164; gate on `tsc -p tsconfig.server.json` |
