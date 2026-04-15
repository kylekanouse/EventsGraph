# Trellis → EventsGraph Connector: Analysis & Recommendations

## Executive Summary

This document analyzes the Trellis codebase to identify all data sources, entity relationships, and activity streams that can be mapped into the EventsGraph VR visualization system. Trellis is fundamentally **graph-native** — its core domain consists of hierarchical agent trees, chained governance receipts, channel-participant bipartite graphs, cross-channel reference networks, federated peer meshes, and governed filesystem trees. Every one of these structures maps naturally to the EventsGraph `IGraphNode` / `IGraphLink` / `IEventData` schema.

The recommendation is to build a dedicated **EventsGraph Connector API** as a new set of REST endpoints on the Trellis server, organized as a collection of **Contexts** that each expose a different graph perspective of the same Trellis instance. This API would serve data in the `IEventsGraphCollectionContextResponse` format, allowing the EventsGraph Oracle to consume it directly.

---

## Table of Contents

1. [Data Source Inventory](#1-data-source-inventory)
2. [Graph Mapping Analysis: Nine Contexts](#2-graph-mapping-analysis-nine-contexts)
3. [Streaming Opportunities](#3-streaming-opportunities)
4. [API Design Recommendations](#4-api-design-recommendations)
5. [VR Experience Design Notes](#5-vr-experience-design-notes)
6. [Implementation Plan](#6-implementation-plan)
7. [Schema Mapping Reference](#7-schema-mapping-reference)

---

## 1. Data Source Inventory

### 1.1 Core Entities Available

| Entity | Source Service | Key Properties | Graph Potential |
|--------|--------------|----------------|-----------------|
| **GPARegistration** | `gpaRegistry` | id, name, status, parentGpaId, budgetUsed/Total, eigenstate, runtimeMode, agentRole | **Hierarchical tree** — delegation chains, budget visualization |
| **Channel** | `channelManager` | id, name, channelType, topology, governanceTier, visibility | **Hub nodes** — connected to participants and GPAs |
| **Participant** | `participantRegistry` | id, name, participantType (human/agent/service/webhook), governanceDepth, status | **Actor nodes** — bipartite with channels |
| **Message** | `messageService` | id, channelId, senderId, contentHash, receiptHash, gpaId | **Activity edges** — flow between participants via channels |
| **GovernanceReceipt** | `receiptVerification` | receiptId, actor, verdict (PASS/FAIL), coherenceProfile, previousRecordHash, executionMetrics | **Chained timeline** — linked list with integrity proofs |
| **GovernedStep** | `governedStepExecutor` | id, parentStepId, stepType, status, consequenceLevel, depth | **Execution tree** — nested up to depth 5 |
| **ExecutionRecord** | `executionHistory` | id, gpaId, status, budgetConsumed, durationMs, llmModel, tokenCounts | **Activity events** — GPA executions over time |
| **CrossChannelReference** | `governanceBinding` | sourceMessageId, targetMessageId, referenceType (endorse/annotate/cross-ref) | **Knowledge graph** — cross-channel knowledge links |
| **GovernedNode** | `governedFilesystem` | id, parentId, path, isDirectory, accessPolicy, contentHash, owner | **File tree** — hierarchical with access policies |
| **FederationPeer** | `federationService` | instanceDid, effectiveTier, status, serviceEndpoint | **Network topology** — distributed instance mesh |
| **TopicTrend** | `topicService` | topic, governedScore, messageCount, avgCoherence, verificationRate | **Clustering nodes** — topic activity heatmap |
| **CoherenceHistory** | `observabilityQuery` | channelId, coherenceScore, t1/t2/t3, trend, healthStatus | **Health overlay** — trajectory with convergence/breach projections |
| **Workspace** | `workspaceService` | id, name, governanceTier, storageUsed/Quota | **Root container** — top-level graph anchor |
| **Organization** | `organizationService` | id, name, governanceTier, consequenceCeiling | **Org container** — multi-workspace anchor |
| **Person** | `personService` | id, displayName, orgRole, maxConsequenceLevel | **Human identity** — linked to participants |
| **Webhook** | `webhookRouter` | id, name, direction, targetUrl, events, requireReceipt | **Integration nodes** — external system connections |
| **ArtifactTransfer** | `artifactTransfer` | sourceParticipantId, targetParticipantId, contentHash, status | **Transfer events** — governed file movement |
| **Reaction** | `reactionService` | messageId, participantId, emoji, governanceSignal | **Signal events** — approve/reject/attention/acknowledge |
| **CapabilityToken** | `governanceGate` | participantId, scope, pathPrefix, constraints, delegatedFrom | **Permission edges** — capability delegation graph |

### 1.2 Pre-Built Aggregations

| Aggregation | Source | Description |
|-------------|--------|-------------|
| **AgentTopology** | `agentTopology.buildTopology()` | Complete GPA tree with delegation chains, status distribution, max depth |
| **ComplianceSummary** | `observabilityQuery` | Receipt coverage %, chain continuity %, verdict distribution, broken chains |
| **SystemManifest** | `systemInspection` | Instance overview — GPA counts, channel counts, storage, governance metrics |
| **CoherenceTrajectory** | `coherenceTrending` | Per-channel coherence history with trend analysis and projections |
| **TrajectoryAnalysis** | `coherenceTrajectory.service` | Slope, trend, consecutive declines, recommended aperture state |
| **AgentContextSnapshot** | `systemInspection` | Per-request context: instance + LLM + GPAs + channels + participants + governance |

### 1.3 Real-Time Event Streams

The existing SSE endpoint (`GET /api/events/stream`) already publishes these event types:

| Event Type | Data | Streaming Potential |
|-----------|------|---------------------|
| `governance.receipt` | Full receipt data | Animate receipt production along GPA→channel links |
| `governance.coherence` | Score + channel | Pulse channel nodes with coherence health color |
| `governance.verification` | Verification result | Flash verification status on receipt chain |
| `governance.alert` | Alert details | Highlight alert source with attention animation |
| `governance.lifecycle` | GPA lifecycle change | Animate GPA status transitions |
| `governance.link-change` | Link verification | Flash link integrity changes |
| `gpa.execution.started` | GPA + execution ID | Trigger execution animation on agent node |
| `gpa.execution.completed` | GPA + result | Complete execution animation with verdict color |
| `gpa.artifact.created` | Artifact details | Animate artifact creation in filesystem view |
| `message.new` | Message data | Animate message flow along channel links |

---

## 2. Graph Mapping Analysis: Nine Contexts

Each context represents a distinct VR visualization perspective of the Trellis instance.

### Context 1: `agent-topology` — GPA Delegation Tree

**Purpose**: Visualize the hierarchical agent architecture — which GPAs delegate to which, their status, budget health, and runtime configuration.

**Node Mapping**:

| Trellis Entity | IGraphNode Field | Mapping |
|---------------|-----------------|---------|
| `GPARegistration.id` | `id` | Direct |
| `GPARegistration.status` | `group` | `deployed=1, running=2, paused=3, stopped=4, expired=5` |
| `GPARegistration.name` | `label` | Direct |
| `executionBudgetTotal - executionBudgetUsed` | `val` | Normalize remaining budget to 1-100 scale |
| Description + budget + eigenstate | `desc` | Composite: `"{description}\nBudget: {used}/{total}\nEigenstate: {current}\nRole: {agentRole}"` |
| Agent role icon | `icon` | Map agentRole to icon: system-agent→shield, governance→scale, scheduled→clock, default→bot |
| `GPARegistration.scheduleType` | `type` | `"event-driven"` or `"on-demand"` — controls event particle color |
| Status-based override | `color` | `running=#00FF00, paused=#FFD700, stopped=#FF4444, expired=#666666` |

**Link Mapping**:

| Relationship | IGraphLink Field | Mapping |
|-------------|-----------------|---------|
| `parentGpaId → id` | `source → target` | Parent delegates to child |
| `"delegates"` | `label` | Static label |
| Delegation depth | `val` | Depth in tree (1-5) |

**Root Node**: Workspace node as anchor, with GPAs radiating outward.

**Streaming Events**: `gpa.execution.started/completed`, `governance.lifecycle` → animate execution pulses along delegation edges.

```
Workspace (root)
  ├── System Agent (GPA)
  │     ├── Sub-Agent A
  │     └── Sub-Agent B
  ├── Governance Agent (GPA)
  └── Scheduled Reporter (GPA)
```

---

### Context 2: `governance-receipt-chain` — Audit Trail Visualization

**Purpose**: Visualize the cryptographic governance receipt chain for a specific GPA or channel — showing how each execution links to the previous via `previousRecordHash`, verdict pass/fail ratios, and coherence profiles.

**Node Mapping**:

| Trellis Entity | IGraphNode Field | Mapping |
|---------------|-----------------|---------|
| `GovernanceReceipt.receiptId` | `id` | Direct |
| Verdict result | `group` | `PASS=1, FAIL=2` |
| Timestamp + action | `label` | `"{actionId}\n{timestamps.actionPerformedAt}"` |
| Coherence total score | `val` | `(tier1.passed + tier2.passed + tier3.passed) / total * 100` |
| Full receipt details | `desc` | Actor, verdict summary, coherence T1/T2/T3, execution metrics, artifacts |
| Verdict icon | `icon` | PASS→checkmark, FAIL→cross |
| `actor.type` | `type` | `"human"`, `"agent"`, `"service"` |
| Verdict color | `color` | `PASS=#00FF00, FAIL=#FF4444` |

**Link Mapping**:

| Relationship | IGraphLink Field | Mapping |
|-------------|-----------------|---------|
| `previousRecordHash → current` | `source → target` | Chain link |
| `"chain"` | `label` | Static |
| Chain integrity status | `val` | `verified=1, broken=0` |

**Streaming Events**: New receipts append to the chain in real-time — animate the chain extending.

---

### Context 3: `channel-network` — Communication Topology

**Purpose**: Visualize the channel-participant membership graph — who participates in which channels, what types of channels exist, governance tiers, and message activity.

**Node Mapping (Channels)**:

| Trellis Entity | IGraphNode Field | Mapping |
|---------------|-----------------|---------|
| `Channel.id` | `id` | Direct |
| `Channel.governanceTier` | `group` | Tier 1=1, 2=2, 3=3, 4=4 |
| `Channel.name` | `label` | Direct |
| Message count or member count | `val` | Scale by activity |
| Channel details | `desc` | Type, topology, tier, visibility, member count |
| Channel type icon | `icon` | standard→chat, direct→dm, gpa-bound→bot, session→clock |
| `Channel.channelType` | `type` | For event particle coloring |

**Node Mapping (Participants)**:

| Trellis Entity | IGraphNode Field | Mapping |
|---------------|-----------------|---------|
| `Participant.id` | `id` | Direct |
| `Participant.participantType` | `group` | human=10, agent=11, service=12, webhook=13 |
| `Participant.name` | `label` | Direct |
| `Participant.governanceDepth` | `val` | Depth 1-4 → scale 15-60 |
| Participant details | `desc` | Type, DID, identity verified, governance depth badge (○◉◈✦) |
| Participant type icon | `icon` | human→person, agent→bot, service→gear, webhook→lightning |
| `Participant.participantType` | `type` | Controls event color |

**Link Mapping**:

| Relationship | IGraphLink Field | Mapping |
|-------------|-----------------|---------|
| `ChannelMember` | `source=participantId, target=channelId` | Membership |
| `ChannelMember.role` | `label` | `"owner"`, `"admin"`, `"member"`, `"guest"` |
| Role weight | `val` | owner=4, admin=3, member=2, guest=1 |

**Streaming Events**: `message.new` → animate message particles from sender (participant) through channel node. `governance.receipt` → flash governance verification on the channel.

---

### Context 4: `execution-tree` — GPA Execution Deep Dive

**Purpose**: Visualize a single GPA execution as a nested step tree — showing the parent-child step hierarchy, step types, statuses, consequence levels, and receipt linkage.

**Node Mapping**:

| Trellis Entity | IGraphNode Field | Mapping |
|---------------|-----------------|---------|
| `GovernedStep.id` | `id` | Direct |
| Step type | `group` | gpa-execution=1, sua-execution=2, tool-call=3, file-operation=4 |
| Step type + entry point | `label` | `"{stepType}: {entryPoint}"` |
| Consequence severity | `val` | low=20, medium=40, high=60, critical=80 |
| Full step details | `desc` | Status, depth, pre-check result, metadata, receipt hash |
| Step type icon | `icon` | gpa→bot, sua→shield, tool→wrench, file→document |
| `GovernedStep.consequenceLevel` | `type` | Controls event particle color |
| Status color | `color` | pending=#FFD700, running=#00BFFF, completed=#00FF00, halted=#FF8C00, failed=#FF4444 |

**Link Mapping**:

| Relationship | IGraphLink Field | Mapping |
|-------------|-----------------|---------|
| `parentStepId → id` | `source → target` | Step delegation |
| `consequenceLevel` | `label` | Consequence level label |
| Step depth | `val` | 1-5 |

---

### Context 5: `cross-channel-knowledge` — Reference Network

**Purpose**: Visualize how knowledge flows between channels through endorsements, annotations, and cross-references — revealing the institutional knowledge topology.

**Node Mapping (Messages)**:

| Trellis Entity | IGraphNode Field | Mapping |
|---------------|-----------------|---------|
| `Message.id` | `id` | Direct |
| Channel-based grouping | `group` | Hash channelId to group number |
| Message preview | `label` | First ~50 chars of contentText |
| Receipt presence | `val` | Has receipt = 40, no receipt = 20 |
| Message details | `desc` | Full content, sender, timestamp, channel name |
| Content type icon | `icon` | text→document, blocks→layout, system→gear, ctp→handshake |
| `Message.contentType` | `type` | Controls event particle color |

**Link Mapping**:

| Relationship | IGraphLink Field | Mapping |
|-------------|-----------------|---------|
| `CrossChannelReference` | `source=sourceMessageId, target=targetMessageId` | Reference edge |
| `referenceType` | `label` | `"endorse"`, `"annotate"`, `"cross-ref"` |
| Reference type weight | `val` | endorse=3, annotate=2, cross-ref=1 |

**Visual Insight**: Dense endorsement clusters reveal trusted knowledge hubs. Isolated messages with no references may indicate siloed information.

---

### Context 6: `filesystem-tree` — Governed File Hierarchy

**Purpose**: Visualize the governed filesystem — directory trees with access policies, ownership, and file operation activity.

**Node Mapping**:

| Trellis Entity | IGraphNode Field | Mapping |
|---------------|-----------------|---------|
| `GovernedNode.id` | `id` | Direct |
| Access policy | `group` | owner-only=1, workspace-read=2, workspace-write=3, instance-read=4, governed-transfer=5 |
| `GovernedNode.name` | `label` | File/directory name |
| `GovernedNode.sizeBytes` | `val` | Normalize to 1-100 |
| Node details | `desc` | Path, owner, content type, access policy, content hash, timestamps |
| File type icon | `icon` | directory→folder, .ts→code, .json→data, .md→document, etc. |
| `GovernedNode.accessPolicy` | `type` | Controls event particle color |

**Link Mapping**:

| Relationship | IGraphLink Field | Mapping |
|-------------|-----------------|---------|
| `parentId → id` | `source → target` | Directory containment |
| `"contains"` | `label` | Static |

**Streaming Events**: `gpa.artifact.created` → animate new file creation. File operations → animate CRUD activity along parent links.

---

### Context 7: `federation-mesh` — Distributed Instance Topology

**Purpose**: Visualize the federation network — peer Trellis instances, their governance tiers, agreement status, and cross-instance activity.

**Node Mapping**:

| Trellis Entity | IGraphNode Field | Mapping |
|---------------|-----------------|---------|
| `FederationPeer.instanceId` + self | `id` | Direct |
| `FederationPeer.effectiveTier` | `group` | Tier 1-4 |
| Instance name / DID | `label` | instanceDid or friendly name |
| Tier level | `val` | tier * 25 (25-100) |
| Peer details | `desc` | Endpoint, tiers (local/peer/effective), negotiated/expires, status |
| Tier icon | `icon` | Tier badge |
| `FederationPeer.status` | `type` | active/expired/revoked |
| Status color | `color` | active=#00FF00, expired=#FFD700, revoked=#FF4444 |

**Link Mapping**:

| Relationship | IGraphLink Field | Mapping |
|-------------|-----------------|---------|
| Self instance → peer | `source → target` | Federation agreement |
| `"tier {effectiveTier}"` | `label` | Negotiated governance tier |
| `effectiveTier` | `val` | For link color gradient |

**Root Node**: The local Trellis instance.

---

### Context 8: `coherence-landscape` — Health & Governance Overview

**Purpose**: Visualize the governance health of all channels — coherence scores, trends, eigenstate proximity, and compliance metrics as a landscape.

**Node Mapping**:

| Trellis Entity | IGraphNode Field | Mapping |
|---------------|-----------------|---------|
| Channel ID | `id` | Direct |
| Trend status | `group` | converging=1, at-eigenstate=2, diverging=3 |
| Channel name + score | `label` | `"{name} (γ={score})"` |
| `coherenceScore * 100` | `val` | Direct (0-100) |
| Trajectory details | `desc` | Current score, T1/T2/T3, trend, slope, projected convergence/breach, window size |
| Trend icon | `icon` | converging→arrow-up, at-eigenstate→target, diverging→arrow-down |
| `healthStatus` | `type` | improving/stable/declining |
| Score-based color | `color` | Green (>0.8) → Yellow (>0.5) → Red (<0.5) gradient |

**Link Mapping**:

Connect channels that share participants (channels with overlapping membership are related):

| Relationship | IGraphLink Field | Mapping |
|-------------|-----------------|---------|
| Shared participant | `source=channelA, target=channelB` | Participant overlap |
| Shared member count | `label` | `"{count} shared members"` |
| Overlap ratio | `val` | Jaccard similarity of member sets |

**Streaming Events**: `governance.coherence` → pulse coherence updates on channel nodes, updating color and size in real-time. `obs.coherence.diverging` → flash warning on diverging channels.

---

### Context 9: `instance-overview` — Full System Graph

**Purpose**: The "god view" — a unified visualization showing the complete Trellis instance topology: organization, workspaces, channels, GPAs, participants, and their interconnections. This is the default/landing context.

**Node Mapping (Composite)**:

| Entity Type | `group` | `val` | `type` | `icon` |
|------------|---------|-------|--------|--------|
| Organization | 1 | 80 | `"organization"` | org-logo |
| Workspace | 2 | 60 | `"workspace"` | workspace |
| Channel | 3 | 30 + memberCount | `"channel"` | channel-type icon |
| GPA | 4 | budgetRemaining normalized | `"agent"` | agent-role icon |
| Participant (human) | 5 | governanceDepth * 15 | `"user"` | person |
| Participant (agent) | 6 | governanceDepth * 15 | `"service"` | bot |

**Link Mapping (Composite)**:

| Relationship | Label | Source → Target |
|-------------|-------|-----------------|
| Org → Workspace | `"contains"` | organizationId → workspaceId |
| Workspace → Channel | `"hosts"` | workspaceId → channelId |
| Channel → Participant | `"member"` | channelId → participantId |
| GPA → Channel | `"bound to"` | gpaId → channelId |
| GPA → GPA | `"delegates"` | parentGpaId → childGpaId |
| GPA → Participant | `"identity"` | gpaId → participantId |

**Streaming Events**: All event types — `message.new` flows between participants and channels, `gpa.execution.*` animates agent activity, `governance.receipt` flashes receipt production.

---

## 3. Streaming Opportunities

### 3.1 Real-Time Event Mapping

The existing SSE infrastructure (`GET /api/events/stream`) already publishes the events needed for live VR animation. Here's how each maps to `IEventData`:

| SSE Event | IEventData.action | source | target | Visual Effect |
|-----------|-------------------|--------|--------|---------------|
| `governance.receipt` | `"receipt-produced"` | GPA node | Channel node | Green/red particle (PASS/FAIL) with coherence magnitude |
| `governance.coherence` | `"coherence-measured"` | System | Channel node | Pulse channel size/color to reflect new score |
| `governance.alert` | `"alert-raised"` | Source entity | Alert target | Orange attention particle |
| `governance.lifecycle` | `"lifecycle-change"` | GPA node | Workspace | Status transition particle |
| `gpa.execution.started` | `"execution-started"` | GPA node | Channel node | Blue "starting" particle |
| `gpa.execution.completed` | `"execution-completed"` | GPA node | Channel node | Green/red result particle |
| `gpa.artifact.created` | `"artifact-created"` | GPA node | File node | Yellow creation particle |
| `message.new` | `"message-sent"` | Sender participant | Channel node | Message flow particle |
| `obs.budget.low` | `"budget-warning"` | GPA node | Workspace | Orange warning particle |
| `obs.coherence.diverging` | `"coherence-diverging"` | Channel node | Workspace | Red divergence particle |

### 3.2 Streaming Protocol

For each streaming context:

1. **Initial payload**: Full graph structure (`graphData` with all nodes + links)
2. **Event stream**: Subscribe to relevant SSE events, transform to `IEventData`, push via `graphStream`
3. **Graph mutations**: When events imply structural changes (new GPA deployed, new channel created), push updated `graphData` in stream message to merge new nodes/links
4. **Heartbeat**: Periodic progress updates with `meta.status: "pending"`

### 3.3 Recommended Streaming Contexts

| Context | Event Sources | Update Frequency |
|---------|--------------|------------------|
| `agent-topology` | `gpa.execution.*`, `governance.lifecycle` | Medium (per-execution) |
| `governance-receipt-chain` | `governance.receipt` | Medium (per-receipt) |
| `channel-network` | `message.new`, `governance.receipt` | High (per-message) |
| `coherence-landscape` | `governance.coherence`, `obs.coherence.diverging` | Low (per-measurement) |
| `instance-overview` | All events | High (everything) |

---

## 4. API Design Recommendations

### 4.1 Endpoint Structure

```
Collection ID: "trellis"
Base URL: POST /api/eventsgraph/data

Contexts:
  - "agent-topology"              GPA delegation tree
  - "governance-receipt-chain"    Receipt chain timeline
  - "channel-network"             Channel-participant graph
  - "execution-tree"              Single execution step tree
  - "cross-channel-knowledge"     Cross-channel reference network
  - "filesystem-tree"             Governed filesystem hierarchy
  - "federation-mesh"             Federated instance topology
  - "coherence-landscape"         Governance health overview
  - "instance-overview"           Full system composite graph
```

### 4.2 Request Parameters by Context

```typescript
// agent-topology
{ collection: "trellis", context: "agent-topology", params: { workspaceId: string, includeExpired?: boolean } }

// governance-receipt-chain
{ collection: "trellis", context: "governance-receipt-chain", params: { gpaId: string, limit?: number } }

// channel-network
{ collection: "trellis", context: "channel-network", params: { workspaceId: string, includeArchived?: boolean } }

// execution-tree
{ collection: "trellis", context: "execution-tree", params: { executionId: string, gpaId: string } }

// cross-channel-knowledge
{ collection: "trellis", context: "cross-channel-knowledge", params: { workspaceId: string, referenceTypes?: string[] } }

// filesystem-tree
{ collection: "trellis", context: "filesystem-tree", params: { workspaceId: string, ownerId?: string, rootPath?: string } }

// federation-mesh
{ collection: "trellis", context: "federation-mesh", params: { organizationId: string } }

// coherence-landscape
{ collection: "trellis", context: "coherence-landscape", params: { workspaceId: string, windowSize?: number } }

// instance-overview
{ collection: "trellis", context: "instance-overview", params: { workspaceId: string, depth?: "shallow" | "full" } }
```

### 4.3 Streaming Request

```typescript
{ collection: "trellis", context: "instance-overview", isStream: true, params: { workspaceId: string, eventFilter?: string[] } }
```

### 4.4 Architecture Recommendation

```
┌─────────────────────────────────────────────────────────┐
│  Trellis Server                                          │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  NEW: EventsGraph Connector API                     │  │
│  │  Route: /api/eventsgraph/data                       │  │
│  │  Route: /api/eventsgraph/stream (WebSocket)         │  │
│  │  Route: /api/eventsgraph/contexts (discovery)       │  │
│  │                                                      │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │  EventsGraphService                          │    │  │
│  │  │  - getData(request) → Response               │    │  │
│  │  │  - getDataStream(request, callback)          │    │  │
│  │  │  - listContexts() → ContextDescriptor[]      │    │  │
│  │  └──────────┬──────────────────────────────────┘    │  │
│  │              │                                        │  │
│  │  ┌──────────▼──────────────────────────────────┐    │  │
│  │  │  Context Mappers (one per context)           │    │  │
│  │  │  - AgentTopologyMapper                       │    │  │
│  │  │  - ReceiptChainMapper                        │    │  │
│  │  │  - ChannelNetworkMapper                      │    │  │
│  │  │  - ExecutionTreeMapper                       │    │  │
│  │  │  - CrossChannelKnowledgeMapper               │    │  │
│  │  │  - FilesystemTreeMapper                      │    │  │
│  │  │  - FederationMeshMapper                      │    │  │
│  │  │  - CoherenceLandscapeMapper                  │    │  │
│  │  │  - InstanceOverviewMapper                    │    │  │
│  │  └──────────┬──────────────────────────────────┘    │  │
│  │              │ reads from                             │  │
│  │  ┌──────────▼──────────────────────────────────┐    │  │
│  │  │  Existing Trellis Services                   │    │  │
│  │  │  gpaRegistry, channelManager, messageService │    │  │
│  │  │  agentTopology, observabilityQuery, ...      │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  EXISTING: SSE Event Stream                         │  │
│  │  GET /api/events/stream                             │  │
│  │  (Used by streaming contexts via EventBus)          │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
          │
          ▼  HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│  EventsGraph VR System                                   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  TrellisOracle (Collection: "trellis")            │   │
│  │  - Connects to Trellis API endpoint               │   │
│  │  - Contexts: 9 registered views                   │   │
│  │  - Streaming: subscribes to SSE or WebSocket      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ForceGraphVR                                      │   │
│  │  - Renders IGraphData as 3D force-directed graph  │   │
│  │  - Animates IEventData as directional particles   │   │
│  │  - Spatial audio tied to event frequency           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 4.5 Discovery Endpoint

Provide a metadata endpoint so EventsGraph can auto-discover available contexts:

```typescript
// GET /api/eventsgraph/contexts
{
  collection: "trellis",
  contexts: [
    {
      id: "agent-topology",
      label: "Agent Topology",
      description: "GPA delegation tree with status, budget, and eigenstate",
      isStreamable: true,
      requiredParams: ["workspaceId"],
      optionalParams: ["includeExpired"]
    },
    {
      id: "governance-receipt-chain",
      label: "Governance Receipt Chain",
      description: "Cryptographic receipt chain with verdict and coherence profiles",
      isStreamable: true,
      requiredParams: ["gpaId"],
      optionalParams: ["limit"]
    },
    // ... etc
  ]
}
```

---

## 5. VR Experience Design Notes

### 5.1 Color Language

Establish a consistent color vocabulary across all contexts:

| Meaning | Color | Hex | Usage |
|---------|-------|-----|-------|
| Healthy / PASS / Active | Green | `#00FF00` | Running GPAs, PASS verdicts, active peers |
| Warning / Paused | Gold | `#FFD700` | Paused GPAs, budget warnings, pending |
| Error / FAIL / Stopped | Red | `#FF4444` | FAIL verdicts, stopped GPAs, broken chains |
| Expired / Inactive | Grey | `#666666` | Expired GPAs, revoked peers |
| In Progress | Blue | `#00BFFF` | Running executions, pending transfers |
| Attention Required | Orange | `#FF8C00` | Halted steps, alerts |
| Human Activity | Teal | `#00CED1` | Human participant events |
| Agent Activity | Purple | `#9370DB` | Agent participant events |

### 5.2 Group Number Conventions

Reserve group ranges for entity types across contexts:

| Range | Entity Type |
|-------|------------|
| 1-9 | Primary entities (GPAs by status, channels by tier, etc.) |
| 10-19 | Participants by type |
| 20-29 | Governance states (verdict, coherence tier, consequence) |
| 30-39 | Structural relationships (federation, organization) |

### 5.3 Sound Design Recommendations

| Event Frequency | Audio Character | Context |
|----------------|-----------------|---------|
| High (messages) | Soft clicks, short buzz | Channel network — busy channels "hum" |
| Medium (receipts) | Chime (pass) / thud (fail) | Receipt chain — governance rhythm |
| Low (lifecycle) | Deep tone transition | Agent topology — status changes |
| Alert | Sharp attention tone | All contexts — divergence, budget depletion |

### 5.4 Node Size Guidelines

| Entity | Recommended `val` Range | Scaling Logic |
|--------|------------------------|---------------|
| Organization | 70-90 | Fixed high |
| Workspace | 50-70 | Fixed medium-high |
| Channel | 20-60 | Scale by member count or message volume |
| GPA | 15-80 | Scale by budget remaining (% of total) |
| Participant | 10-40 | Scale by governance depth (×10) |
| Message | 10-30 | Scale by reference count |
| Receipt | 15-45 | Scale by coherence score × 45 |
| File/Directory | 5-50 | Scale by size (log scale) |
| Federation Peer | 25-100 | Scale by effective tier × 25 |

---

## 6. Implementation Plan

### Phase 1: Foundation (Core API + 3 Contexts)

1. **Create `EventsGraphService`** — service class with `getData()` and `getDataStream()` methods
2. **Create mapper interfaces** — `IContextMapper` with `map(services, params) → IEventsGraphCollectionContextResponse`
3. **Implement `AgentTopologyMapper`** — leverages existing `agentTopology.buildTopology()`
4. **Implement `ChannelNetworkMapper`** — queries channels + participants + memberships
5. **Implement `InstanceOverviewMapper`** — composite of topology + channels + participants
6. **Create REST route** — `POST /api/eventsgraph/data` and `GET /api/eventsgraph/contexts`
7. **Register in service container** — wire into existing DI pattern

### Phase 2: Governance Depth (3 More Contexts)

8. **Implement `ReceiptChainMapper`** — reads governance receipts, builds chain graph
9. **Implement `ExecutionTreeMapper`** — queries governed steps, builds execution tree
10. **Implement `CoherenceLandscapeMapper`** — uses coherence trajectory + compliance data
11. **Add streaming support** — WebSocket or SSE-based stream endpoint for real-time contexts

### Phase 3: Knowledge & Files (3 Final Contexts)

12. **Implement `CrossChannelKnowledgeMapper`** — queries cross-channel references
13. **Implement `FilesystemTreeMapper`** — reads governed filesystem tree
14. **Implement `FederationMeshMapper`** — queries federation peers

### Phase 4: Polish & Integration

15. **Add context discovery endpoint** — auto-describe available contexts
16. **Add Zod validation** — validate incoming requests per context
17. **Add rate limiting** — protect expensive queries (full instance overview)
18. **Write integration tests** — validate response schema compliance
19. **Document** — update API docs with EventsGraph connector specification

### File Structure

```
src/
  api/
    rest/
      eventsgraph.ts                    # Route handler
  services/
    eventsgraph/
      eventsgraph.service.ts            # Main service
      mappers/
        types.ts                        # IContextMapper interface
        agent-topology.mapper.ts
        receipt-chain.mapper.ts
        channel-network.mapper.ts
        execution-tree.mapper.ts
        cross-channel-knowledge.mapper.ts
        filesystem-tree.mapper.ts
        federation-mesh.mapper.ts
        coherence-landscape.mapper.ts
        instance-overview.mapper.ts
```

---

## 7. Schema Mapping Reference

### 7.1 Response Template

Every context response follows this structure:

```typescript
{
  id: crypto.randomUUID(),
  collection: "trellis",
  context: request.context,
  rootNodeID: "<context-specific root>",
  graphData: {
    nodes: IGraphNode[],
    links: IGraphLink[]
  },
  eventData: undefined,  // Only populated in streaming messages
  meta: {
    status: "completed",
    progress: 1,
    timeSent: Date.now().toString()
  }
}
```

### 7.2 Node Type → Event Particle Color Map

Configure on the EventsGraph client side:

```typescript
const eventTypeColors = {
  "user": "#00CED1",        // Teal — human activity
  "agent": "#9370DB",       // Purple — agent activity
  "service": "#FF6347",     // Tomato — service activity
  "organization": "#FFD700",// Gold — org-level events
  "workspace": "#4682B4",   // Steel blue — workspace events
  "channel": "#32CD32",     // Lime green — channel events
  "governance": "#FF8C00",  // Dark orange — governance events
  "receipt": "#00FF7F",     // Spring green — receipt events
  "alert": "#FF4444",       // Red — alert events
};
```

### 7.3 Complete Node Factory Example

```typescript
function gpaToGraphNode(gpa: GPARegistration, eigenstate: EigenstateMetrics | null): IGraphNode {
  const statusGroups: Record<GPAStatus, number> = {
    deployed: 1, running: 2, paused: 3, stopped: 4, expired: 5
  };
  const statusColors: Record<GPAStatus, string> = {
    deployed: "#4682B4", running: "#00FF00", paused: "#FFD700",
    stopped: "#FF4444", expired: "#666666"
  };
  const budgetRemaining = gpa.executionBudgetTotal - gpa.executionBudgetUsed;
  const budgetPercent = gpa.executionBudgetTotal > 0
    ? (budgetRemaining / gpa.executionBudgetTotal) * 100
    : 0;

  return {
    id: gpa.id,
    group: statusGroups[gpa.status] ?? 1,
    label: gpa.name,
    val: Math.max(10, Math.min(80, budgetPercent)),
    desc: [
      gpa.description ?? "No description",
      `Status: ${gpa.status}`,
      `Budget: ${gpa.executionBudgetUsed}/${gpa.executionBudgetTotal} (${budgetPercent.toFixed(0)}% remaining)`,
      `Schedule: ${gpa.scheduleType}`,
      `Role: ${gpa.agentRole ?? "default"}`,
      `Runtime: ${gpa.runtimeMode}`,
      eigenstate ? `Eigenstate: ${eigenstate.trend} (γ=${eigenstate.currentCoherence.toFixed(3)})` : "",
      `DID: ${gpa.did}`,
    ].filter(Boolean).join("\n"),
    icon: "",
    type: gpa.scheduleType === "event-driven" ? "agent" : "service",
    url: "",
    color: statusColors[gpa.status],
  };
}
```

### 7.4 Link Factory Example

```typescript
function delegationToGraphLink(parent: GPARegistration, child: GPARegistration): IGraphLink {
  return {
    source: parent.id,
    target: child.id,
    label: "delegates",
    val: 1,
    type: "delegation",
  };
}
```

### 7.5 Event Factory Example

```typescript
function executionToEventData(gpaId: string, channelId: string, status: string): IEventData {
  return {
    action: status === "started" ? "execution-started" : "execution-completed",
    source: gpaId,
    target: channelId,
    id: crypto.randomUUID(),
    category: "gpa-execution",
    label: `GPA execution ${status}`,
    val: status === "completed" ? 1 : 0,
    type: "agent",
    timestamp: Date.now(),
  };
}
```

---

## Appendix A: Trellis Data Relationship Map

```
Organization ─── 1:N ──→ Workspace ─── 1:N ──→ Channel ─── N:M ──→ Participant
     │                       │                     │                     │
     │                       │                     │                     │
     │                  1:N  │                1:N  │                1:N  │
     │                       ▼                     ▼                     ▼
     │               GPARegistration          Message ◄───────── Reaction
     │                   │    │                  │  │
     │              1:N  │    │ 1:N         1:N  │  │ N:M
     │                   ▼    ▼                  ▼  ▼
     │           GovernedStep  ExecutionRecord  CrossChannelReference
     │                   │                        MessageTopic
     │              1:1  │
     │                   ▼
     │           GovernanceReceipt ──chain──→ GovernanceReceipt
     │
     └─── 1:N ──→ FederationPeer
     │
     └─── 1:N ──→ Person ─── 1:N ──→ Participant

Workspace ─── 1:N ──→ GovernedNode ─── 1:N ──→ GovernedNode (tree)
                           │
                      1:N  │
                           ▼
                     FileOperation
                     ArtifactTransfer
```

## Appendix B: Governance Depth Badges in VR

The governance depth badge system (○ ◉ ◈ ✦) maps to increasing sphere detail:

| Depth | Badge | VR Representation | Meaning |
|-------|-------|-------------------|---------|
| 1 | ○ | Simple sphere, low opacity | Basic participant |
| 2 | ◉ | Sphere with subtle glow | Identity verified |
| 3 | ◈ | Sphere with ring (Saturn-like) | GPA-bound, receipt-verified |
| 4 | ✦ | Sphere with star particles | Full eigenstate declaration |

## Appendix C: Coherence Score Visualization

The three-tier coherence model (γ₁=0.6827, γ₂=0.2718, γ₃=0.0455) maps to visual layers:

| Tier | Weight | VR Representation |
|------|--------|-------------------|
| T1 (68.27%) | Core | Inner sphere color intensity |
| T2 (27.18%) | Middle | Ring/halo brightness |
| T3 (4.55%) | Outer | Ambient glow radius |

A node with high T1 but low T3 would appear as a bright core with dim ambiance — structurally sound but lacking edge refinement.

---

*Generated from analysis of the Trellis codebase at `/pcn-channel-server-trellis/`. All type references correspond to actual TypeScript interfaces in `src/domain/` and service method signatures in `src/services/`.*
