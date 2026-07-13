# Phase 6 — Post-Removal Verification

**Destructive:** No (verification only)
**Prerequisite:** [Phase 5 — Document](PHASE_5_DOCUMENT.md) complete (or at minimum Phases 3–4)
**Next phase:** None — this is the final gate
**Parent:** [Sylva Removal Solutions Architecture](../SYLVA_REMOVAL_SOLUTION_ARCHITECTURE.md)

---

## Orientation

**EventsGraph** is a VR graph-visualization engine: a Node/TypeScript server maps
structured data onto graph nodes and links and streams it over Socket.IO to a React +
A-Frame / three.js VR client. **Sylva** (formerly *Trellis*) was one of four **oracles**;
Phases 3–4 removed it entirely.

In the DDD model, an **Oracle** exposes a **Collection** (`IEventsGraphCollection`) that
owns N **Contexts** — each a named query shape returning `IGraphData { nodes, links }`,
wrapped by `Utils.buildResponse()` and pushed to the client over Socket.IO. Three oracles
remain: **Twitter**, **BasicNetwork**, **DummyData**.

---

## Goal of this phase

**Prove the *product* still works — not just that the compiler is happy.**

Everything up to now has been verified by `tsc` and `vitest`. Those prove *nothing dangles*.
They do **not** prove a user can still put a graph on screen. Sylva's removal touched the
oracle registry — the exact object every request flows through. This phase drives the real
app.

---

## Preconditions

- [ ] Phases 3–4 complete and committed
- [ ] Both typechecks clean; `npx vitest run` → 10 files / 131 tests / 0 failures
- [ ] `git grep -i sylva -- . ':!CHANGELOG.md' ':!docs/'` → zero hits

---

## ⚠️ Establish what "working" meant *before* you started

Two of the six dropdown contexts depend on **Twitter API credentials**
(`TWITTER_BEARER_TOKEN` etc. in `src/server/.env`). **If those credentials are absent or
expired, the Twitter contexts will error — and that has nothing to do with Sylva.**

Do not spend an afternoon debugging a "regression" that was already there.

**If you are unsure of the pre-existing state**, check the baseline first:

```bash
git stash                                       # or: git checkout sylva-connector-final
npm run dev                                     # exercise the 6 dropdown entries, note what worked
git checkout remove/sylva-connector             # return to the removal
```

**The bar for this phase is "no worse than baseline," not "everything works."**

---

## Steps

### 1. Boot the server — confirm the Sylva log lines are gone

```bash
npm run server
```

At **baseline** the server emitted:

```
Sylva Oracle: initialized with advanced features support (Phase 6)
SylvaEventBridge: SSE connected
Sylva: authenticated successfully
```

**None of these may appear.** Their absence is the runtime proof that the oracle is
genuinely unregistered — not merely uncompiled.

- [ ] Server starts cleanly
- [ ] Zero log lines matching `/sylva/i`
- [ ] No `ECONNREFUSED` to `localhost:3100` (Sylva's base URL) — the connector is no longer
      trying to reach a service that isn't there

### 2. Confirm the registry contains exactly three collections

The registry is [`EventsGraphDataRepo`](../../../../src/server/lib/repos/EventsGraphDataRepo.ts) —
a `Map<collectionID, IEventsGraphCollection>`. After removal it must hold exactly:

```
twitter, basicnetwork, dummydata
```

This is already asserted by
[`EventsGraphDataRepo.test.ts`](../../../../src/server/lib/repos/__tests__/EventsGraphDataRepo.test.ts)
(which checks `>= 3` collections containing those three, and — by design — never asserted
Sylva). It passed in Phase 3. Confirm at runtime if you want belt and braces.

### 3. Drive the real app — all six dropdown contexts

```bash
npm run dev        # concurrently: nodemon (server) + vite (client)
```

Open the VR client. The oracle dropdown is a **static 6-entry array** at
[`RequestControls.tsx:28-35`](../../../../src/client/components/controls/requests/RequestControls.tsx#L28-L35).

> **It never listed Sylva.** The client had *zero* Sylva references before this work began
> — no icons, no styles, no routes, no components, and node types are derived dynamically
> from arriving graph data rather than hardcoded. **Zero client files were edited in this
> entire operation.** The dropdown should look and behave exactly as it always did.

Issue a request from each entry and confirm the graph renders:

| # | Dropdown entry | Oracle | Notes |
|---|---|---|---|
| 1 | **Dummy Data Basic** | DummyData | ✅ No credentials needed — **this is your canary.** If this renders, the registry → collection → context → `buildResponse` → Socket.IO path is intact end to end. |
| 2 | **BasicNetwork Operations** | BasicNetwork | ✅ No credentials needed |
| 3 | **Twitter Filtered Stream** | Twitter | ⚠️ Needs Twitter API credentials. **This is the streaming context** — see step 4. |
| 4 | **Twitter Search Tweets** | Twitter | ⚠️ Needs Twitter API credentials |
| 5 | **Twitter Tweets Lookup** | Twitter | ⚠️ Needs Twitter API credentials |
| 6 | **Twitter User Lookup** | Twitter | ⚠️ Needs Twitter API credentials |

**Entries 1 and 2 are the ones that actually prove the removal is safe** — they exercise the
full request path with no external dependency. If either fails, you have a real regression.

If entries 3–6 fail **for credential reasons**, that is a pre-existing environment
condition, not a removal defect. Confirm by checking whether they failed at baseline too.

### 4. Confirm the streaming path still works

Sylva had its own SSE machinery (`SylvaEventBridge` — `fetch` + `ReadableStream` with manual
frame parsing, because `EventSource` cannot send an `Authorization` header). **That is gone.**

**But Socket.IO — the browser↔EventsGraph transport — is a completely separate thing, and it
was never touched.** So is `Utils.isStreamable()` and the `getDataStream()` path on
`EventsGraphDataRepo`.

Exercise **Twitter Filtered Stream** (the streamable context) and confirm nodes still arrive
incrementally over the socket.

- [ ] The socket connects
- [ ] Streamed graph updates arrive and render
- [ ] `getDataStream` does not throw `Unable to find collection ... that is streamable`

*(Credentials permitting — if Twitter creds are unavailable, note this as untestable in this
environment rather than as a pass or a fail. Sylva was **not** the streamable collection the
client exercises, so the risk here is genuinely low.)*

### 5. Check the browser console

- [ ] No client console errors referencing a missing `sylva` collection
- [ ] No failed requests to `localhost:3100`
- [ ] No `Unable to find collection sylva`

**You should not see any of these** — the client never knew Sylva existed. If you *do* see
one, something outside this plan's inventory is referencing the collection, and the "nothing
else in the system knows it exists" premise is wrong. Stop and investigate.

---

## Exit criteria

- [ ] Server boots with **zero** Sylva log lines
- [ ] **Dummy Data Basic** renders a graph *(the canary — this one is non-negotiable)*
- [ ] **BasicNetwork Operations** renders a graph
- [ ] The 4 Twitter contexts behave **no worse than baseline**
- [ ] Streaming / Socket.IO works (or is documented as untestable for credential reasons)
- [ ] No client console errors mentioning `sylva`
- [ ] No connection attempts to `localhost:3100`

---

## If something fails

| Symptom | Likely cause | Action |
|---|---|---|
| **Dummy Data Basic fails to render** | The registry unwiring in `EventsGraphDataRepo` broke the `Map` construction | Re-read [Phase 3 step 3](PHASE_3_EXCISE_THE_CONNECTOR.md). Most likely you removed the line-2 `IEventsGraphCollection` import, or inlined `new Map()` without the type parameter. |
| **Server won't start, module not found** | A dangling import survived | `npx tsc --noEmit -p tsconfig.server.json` will name the file. This *should* be impossible — that gate passed in Phase 3. |
| **Only the Twitter contexts fail** | Twitter API credentials — **almost certainly not Sylva** | Compare against baseline before investigating further |
| **`Unable to find collection sylva`** | Something still requests the `sylva` collection | Not in the inventory. Investigate — a premise of this plan is wrong. |

**Full rollback**, at any point:

```bash
git checkout sylva-connector-final -- src/server/lib/repos/oracles/sylva
```

then restore the import + registration in `EventsGraphDataRepo.ts` and the `SYLVA_*`
constants in `constants.ts`.

---

## Done

When this phase passes, the removal is complete:

| | Before | After |
|---|---|---|
| Oracles | 4 | **3** (Twitter, BasicNetwork, DummyData) |
| Test files / cases | 42 / 453 | **10 / 131** |
| Connector LOC | 10,515 | **0** |
| npm dependencies dropped | — | **0** (the connector imported none) |
| Client files changed | — | **0** |
| CI / Docker / build files changed | — | **0** (none exist) |
| Code files changed outside the connector | — | **2** (`EventsGraphDataRepo.ts`, `constants.ts`) |

The **Oracle / Collection / Context** extension point is unchanged, and
[`docs/instructions/ai/EVENTSGRAPH_API_CONNECTOR_SPEC.md`](../../ai/EVENTSGRAPH_API_CONNECTOR_SPEC.md)
remains authoritative for building a replacement. The connector itself is preserved at the
`sylva-connector-final` tag.
