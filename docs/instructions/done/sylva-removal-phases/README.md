# Sylva Removal — Phase Instructions

Execution documents for the [Sylva Removal Solutions Architecture](../SYLVA_REMOVAL_SOLUTION_ARCHITECTURE.md).

Each phase document is **self-contained**: it repeats the orientation, the
architectural rationale, and the exact commands it needs. You can hand any
single file to an engineer (or an agent) with no other context and they can
execute it correctly.

## Order

| Phase | Document | Destructive? | Gate |
|---|---|---|---|
| 0 | [Preflight & Baseline](PHASE_0_PREFLIGHT_BASELINE.md) | No | 42 files / 453 tests green; both typechecks clean |
| 1 | [Preserve the Asset](PHASE_1_PRESERVE_THE_ASSET.md) | No | `sylva-connector-final` tag exists |
| 2 | [Land the Foundation](PHASE_2_LAND_THE_FOUNDATION.md) | No (merge) | `master` builds green for the first time |
| 3 | [Excise the Connector](PHASE_3_EXCISE_THE_CONNECTOR.md) | **YES — point of no return** | Server typecheck clean; 10 files / 131 tests green |
| 4 | [Clean the Shared Surface](PHASE_4_CLEAN_THE_SHARED_SURFACE.md) | Yes (cleanup) | `git grep -i sylva` → zero hits outside CHANGELOG/docs |
| 5 | [Document](PHASE_5_DOCUMENT.md) | No | CHANGELOG answers "where did it go / how do I get it back" |
| 6 | [Post-Removal Verification](PHASE_6_POST_REMOVAL_VERIFICATION.md) | No | All 6 dropdown contexts render; streaming works |

**Phases 0–2 are reversible and land no destructive change. Phase 3 is the point
of no return — do not start it until Phase 1's tag exists.**

## The one trap (read this even if you read nothing else)

**Do not remove Sylva by reverting commits.** Commit `5d4be46` bundles the Sylva
sources together with eight files of shared, load-bearing infrastructure that
`master` does not have — including `src/server/lib/logger.ts` (used by the server
entrypoint, socket layer, middlewares, and every oracle) and
`src/server/domain/schemas.ts` (the zod request validation used by `socket.ts`).

Reverting that commit to "undo Sylva" deletes the shared logger and schemas and
takes the server build down with it.

> **Removal must be surgical (`git rm` a directory), never historical (`git revert`).**

## Corrections to the architecture document

Two claims in the source architecture document were verified against the tree and
found inaccurate. The phase documents below carry the corrected version; the
architecture document has not been edited.

1. **`src/server/constants.ts` deletion range is `163–183`, not `164–183`.** The
   block's JSDoc comment opens at line 163 (`/**`). Deleting from 164 orphans a
   dangling `/**` and breaks the file. See [Phase 4](PHASE_4_CLEAN_THE_SHARED_SURFACE.md).

2. **The client does *not* read `IGraphNode.color`.** The architecture document
   claims removing it "is a client-side change too." It is not: the client never
   imports `IGraphNode` at all — it declares its own independent
   [GraphNodeData.d.ts](../../../../src/client/types/GraphNodeData.d.ts) type, and
   colors nodes via `nodeAutoColorBy('group')`. The recommendation (**keep the
   field**) is unchanged, but the reasoning is different, and the "it would be a
   client change" argument should not be used to justify it. See
   [Phase 4](PHASE_4_CLEAN_THE_SHARED_SURFACE.md).
