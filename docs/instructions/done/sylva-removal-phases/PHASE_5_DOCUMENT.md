# Phase 5 — Document

**Destructive:** No (rewrites a CHANGELOG entry; moves docs)
**Prerequisite:** [Phase 4 — Clean the Shared Surface](PHASE_4_CLEAN_THE_SHARED_SURFACE.md) complete; `git grep -i sylva` returns zero hits outside CHANGELOG/docs
**Next phase:** [Phase 6 — Post-Removal Verification](PHASE_6_POST_REMOVAL_VERIFICATION.md)
**Parent:** [Sylva Removal Solutions Architecture](../SYLVA_REMOVAL_SOLUTION_ARCHITECTURE.md)

---

## Orientation

**EventsGraph** is a VR graph-visualization engine. **Sylva** (formerly *Trellis*) was one
of its four **oracles** — a read-only external governed-multi-agent platform. Phases 3 and 4
deleted the connector (67 files, 10,515 LOC, 322 tests) and its residue.

By this point the code is done. What remains is the **trail**.

---

## Goal of this phase

Leave a record that lets a reader six months from now answer two questions **from the
CHANGELOG alone**:

1. **Where did Sylva go, and why?**
2. **How do I get it back?**

Ten thousand lines vanishing from a repo with no explanation is how institutional knowledge
dies. This is the phase that prevents that.

---

## Preconditions

- [ ] Phase 4 complete: `git grep -i sylva -- . ':!CHANGELOG.md' ':!docs/'` → zero hits
- [ ] The `sylva-connector-final` tag exists (Phase 1) — the recovery command below depends on it

Confirm the tag one more time, because you are about to publish the incantation that
relies on it:

```bash
git tag -l | grep sylva-connector-final
git ls-tree -r --name-only sylva-connector-final -- src/server/lib/repos/oracles/sylva | wc -l   # 67
```

---

## Steps

### 1. Rewrite the `[Unreleased]` section of `CHANGELOG.md`

The current `[Unreleased]` section (lines 7–34) documents the **Trellis → Sylva rename** —
which is now **moot**, because the thing that was renamed no longer exists.

> **Replace it. Do not append to it.** A changelog entry describing a rename of code that
> was deleted in the same unreleased cycle is noise that will actively mislead. The two
> entries are not both true from a consumer's point of view — only the removal is.

**Replace lines 7–34 with:**

```markdown
## [Unreleased]

### Removed (BREAKING)

- **Removed the Sylva oracle connector** (formerly Trellis). The
  `sylva` collection is gone from the socket.io API. Clients sending
  `{ collection: 'sylva', ... }` will now receive
  `Unable to find collection sylva`.

  Removed in full:
  - `src/server/lib/repos/oracles/sylva/` — 67 files, 10,515 LOC,
    322 tests: the Collection root, the REST/JWT connection manager,
    the SSE event bridge, 14 contexts, 9 mappers, and 8 services.
  - The 15 `SYLVA_*` constants in `src/server/constants.ts`.
  - The 5 `SYLVA_*` environment variables (`SYLVA_ENABLED`,
    `SYLVA_BASE_URL`, `SYLVA_DID`, `SYLVA_WORKSPACE_ID`,
    `SYLVA_PARTICIPANT_NAME`). Any still set in a deployment are now
    inert and can be dropped.

  This supersedes the Trellis→Sylva rename previously recorded in this
  section; that rename is moot, as the renamed code has been removed.

### Unchanged

- **The Oracle / Collection / Context extension point is untouched.**
  Twitter, BasicNetwork, and DummyData are unaffected, and the generic
  connector spec at `docs/instructions/ai/EVENTSGRAPH_API_CONNECTOR_SPEC.md`
  remains authoritative for building a replacement oracle.
- No npm dependency was orphaned by the removal — the connector imported
  zero packages (networking used the global `fetch`).
- `IGraphNode.color` is deliberately retained. Sylva was its only
  producer, but the field predates the connector and remains a valid
  capability for a future oracle.

### Recovery

The connector is preserved at the `sylva-connector-final` tag. To restore it:

    git checkout sylva-connector-final -- src/server/lib/repos/oracles/sylva

Re-registering it also requires restoring the `SYLVA_*` constants in
`src/server/constants.ts` and the import + registration block in
`src/server/lib/repos/EventsGraphDataRepo.ts`.
```

**Why the "Unchanged" section is not filler.** The single most likely misreading of this
removal is *"EventsGraph dropped support for external oracles."* It did not. It dropped
**one** oracle. Saying so explicitly, next to the deletion, is what stops a future engineer
from concluding the extension point was abandoned.

**Why the recovery note names the constants and the registration.** `git checkout <tag> --
<dir>` restores the connector *directory* but **not** the two files outside it that wire it
in. A reader who runs only the one-liner gets a tree that does not compile and no
explanation. Naming both is the difference between a working incantation and a frustrating
one.

### 2. Move the planning docs to `done/`

```bash
mkdir -p docs/instructions/done
git mv docs/instructions/todo/SYLVA_REMOVAL_SOLUTION_ARCHITECTURE.md docs/instructions/done/
git mv docs/instructions/todo/phases docs/instructions/done/sylva-removal-phases
```

> **Note:** the phase documents (including this one) are currently **untracked**
> (`git status` shows `?? docs/instructions/todo/`). If you have not committed them yet,
> `git mv` will fail — just move them with `mv` and `git add` the destination.

### 3. Verify the docs still say true things

The architecture document contains **two claims that were found to be inaccurate** during
execution. They are corrected in
[Phase 4](PHASE_4_CLEAN_THE_SHARED_SURFACE.md) and in the
[phases README](README.md), but the parent document itself was not edited.

**Before archiving, either fix the parent or leave the corrections discoverable.** The
corrections:

1. **`constants.ts` deletion range is `163–183`, not `164–183`** — line 163 is the JSDoc
   opener; deleting from 164 orphans it.
2. **The client does not read `IGraphNode.color`** — it never imports `IGraphNode` and has
   its own `GraphNodeData.d.ts`. The doc's claim that removing the field "is a client-side
   change too" is false. (The *recommendation* to keep the field still stands, for a
   different reason.)

An archived document that misleads the next reader is worse than no document.

---

## Verification / Exit criteria

- [ ] `CHANGELOG.md` `[Unreleased]` describes the **removal**, not the rename
- [ ] The CHANGELOG contains the working recovery command **and** notes that constants +
      registration must also be restored
- [ ] The CHANGELOG states that the Oracle/Collection/Context extension point is unchanged
- [ ] The architecture doc + phases live under `docs/instructions/done/`
- [ ] The two corrections are either applied to the parent doc or clearly flagged in it

**The real test:** hand the CHANGELOG to someone who has never seen this work and ask them
*"where did Sylva go, and how would you bring it back?"* If they can answer both from that
file alone, this phase is done.

---

## Rollback

`git revert` the commit. Documentation-only; no runtime impact.

---

## Note on scope

Nothing else needs rewriting. This was verified repo-wide:

- [`docs/instructions/ai/EVENTSGRAPH_API_CONNECTOR_SPEC.md`](../../ai/EVENTSGRAPH_API_CONNECTOR_SPEC.md)
  (948 lines) documents the **generic** Oracle/Collection/Context pattern and contains
  **zero** Sylva references. It stays exactly as it is — and it is what a future engineer
  will use to build a replacement.
- There is no `README` section, architecture diagram, or API doc that names Sylva.
- There is no `.github/`, Dockerfile, docker-compose, Makefile, or `scripts/` — nothing in
  CI or infra to update.
