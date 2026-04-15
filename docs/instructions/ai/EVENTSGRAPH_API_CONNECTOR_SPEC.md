# EventsGraph: Data Connector & API Endpoint Specification

## Purpose

This document provides a complete technical specification for building an API endpoint that serves data to the EventsGraph VR rendering system. An AI or developer reading this document should be able to generate a fully functional data connector endpoint without needing to read the EventsGraph codebase.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Deep Dive](#2-architecture-deep-dive)
3. [Data Flow: End to End](#3-data-flow-end-to-end)
4. [Core Data Schemas](#4-core-data-schemas)
5. [VR Rendering Mapping: How Data Becomes Experience](#5-vr-rendering-mapping-how-data-becomes-experience)
6. [The Connector Pattern: Oracle + Collection + Context](#6-the-connector-pattern-oracle--collection--context)
7. [API Endpoint Specification](#7-api-endpoint-specification)
8. [Streaming Endpoint Specification](#8-streaming-endpoint-specification)
9. [Complete JSON Examples](#9-complete-json-examples)
10. [Validation Rules](#10-validation-rules)
11. [Implementation Checklist](#11-implementation-checklist)

---

## 1. System Overview

EventsGraph is a VR graph data visualization system that transforms arbitrary structured data into an immersive 3D environment using physics-based force-directed graphs, positional audio, color coding, visual indicators, and interactive navigation. The core insight is that human beings already have deep intuitive understanding of physics, spatial relationships, sound, and color — EventsGraph maps data dimensions onto these pre-existing perceptual domains so users can leverage their innate spatial reasoning to understand complex data.

### Core Technology Stack

| Layer | Technology | Role |
|-------|-----------|------|
| VR Runtime | A-Frame (WebXR) | VR scene management, camera, controls |
| 3D Rendering | Three.js (via super-three from A-Frame) | 3D objects, materials, lighting |
| Force-Directed Graph | 3d-force-graph-vr | Physics simulation, node/link layout |
| UI Panels | three-mesh-ui | In-VR text panels and UI elements |
| Text Rendering | three-spritetext, troika-three-text | 3D text labels in scene |
| Audio | Three.js PositionalAudio + AudioListener | Spatial sound tied to graph events |
| Client Framework | React 18 | HUD controls, form inputs |
| Transport | Socket.IO | Real-time bidirectional data transport |
| Server | Express.js + Node.js | HTTP API and WebSocket server |
| Validation | Zod | Request schema validation |
| State Management | @uboot/uboot (Observer pattern) | Event-driven reactive state |

### What Gets Rendered

Data flows into EventsGraph as **Nodes**, **Links**, and **Events**. These are mapped to VR experience as follows:

- **Nodes** → 3D sphere objects positioned in space by physics simulation
- **Links** → Lines connecting nodes, with directional particle effects
- **Events** → Animated particles traveling along links with positional audio
- **Node Groups** → Color differentiation (auto-colored by `group` field)
- **Node Values** → Physical size of the sphere (larger `val` = bigger sphere)
- **Node Types** → Link particle color mapping (e.g., `user` → green, `service` → red)
- **Node Icons** → 2D image textures rendered on plane geometry attached to nodes
- **Node Labels** → 3D text sprites floating near nodes
- **Node Descriptions** → VR panels (three-mesh-ui) shown on node activation
- **Node URLs** → Navigable links accessible from VR panels
- **Link Labels** → 3D text sprites centered on link midpoints
- **Link Values** → Currently available for color-based auto-coloring
- **Events/Sound** → Positional audio cues triggered by event data on links

---

## 2. Architecture Deep Dive

### Server-Side Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Express Server (:8050)                │
│                                                          │
│  ┌──────────────┐    ┌───────────────────────────────┐  │
│  │  REST API     │    │  Socket.IO Server              │  │
│  │  /api/        │    │                                │  │
│  │  graphdata    │    │  Events:                       │  │
│  └──────────────┘    │    getGraphData                │  │
│                       │    getGraphDataStream          │  │
│                       │    closeStream                 │  │
│                       │                                │  │
│                       │  Emits:                        │  │
│                       │    graphData                   │  │
│                       │    graphStream                 │  │
│                       │    error                       │  │
│                       └───────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              EventsGraphService                    │   │
│  │  - getData(request) → Promise<Response>           │   │
│  │  - getDataStream(request, callback) → void        │   │
│  └────────────────────┬─────────────────────────────┘   │
│                        │                                  │
│  ┌────────────────────▼─────────────────────────────┐   │
│  │            EventsGraphDataRepo                     │   │
│  │  Collections: Map<string, IEventsGraphCollection>  │   │
│  │                                                     │   │
│  │  ┌─────────┐  ┌──────────────┐  ┌───────────┐    │   │
│  │  │ Twitter │  │ BasicNetwork │  │ DummyData │    │   │
│  │  │ Oracle  │  │   Oracle     │  │  Oracle   │    │   │
│  │  └────┬────┘  └──────┬───────┘  └─────┬─────┘    │   │
│  │       │               │                │           │   │
│  │  Contexts:       Contexts:        Contexts:       │   │
│  │  - tweet-lookup  - basicnetwork   - dummydata     │   │
│  │  - tweets-lookup   -operations      -basic        │   │
│  │  - search-tweets                                   │   │
│  │  - user-lookup                                     │   │
│  │  - filtered-stream                                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Client-Side Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Browser / VR Headset                   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │  React App                                          │  │
│  │  ┌──────────┐  ┌────────────────────────────────┐  │  │
│  │  │  HUD     │  │  EventsGraph (Orchestrator)     │  │  │
│  │  │ Controls │  │                                  │  │  │
│  │  │          │  │  ┌──────────┐  ┌─────────────┐  │  │  │
│  │  │ Request  │  │  │  Graph   │  │  Audio      │  │  │  │
│  │  │ Controls │  │  │ (Force   │  │  Manager    │  │  │  │
│  │  │          │  │  │  Graph   │  │ (Positional │  │  │  │
│  │  │ Active   │  │  │  VR)     │  │  Audio)     │  │  │  │
│  │  │ Nodes    │  │  │          │  └─────────────┘  │  │  │
│  │  │ Display  │  │  │  Nodes   │  ┌─────────────┐  │  │  │
│  │  └──────────┘  │  │  Links   │  │  Scene      │  │  │  │
│  │                 │  │  Events  │  │  Manager    │  │  │  │
│  │  ┌──────────┐  │  └──────────┘  └─────────────┘  │  │  │
│  │  │ GraphData│  │                                  │  │  │
│  │  │ Service  │  │  ┌──────────────────────────┐   │  │  │
│  │  │ (Socket) │  │  │  Observer Controller      │   │  │  │
│  │  └──────────┘  │  │  (Event Bus via @uboot)   │   │  │  │
│  │                 │  └──────────────────────────┘   │  │  │
│  │                 └────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow: End to End

### One-Shot Data Request

```
1. User selects Collection + Context + Params in HUD
2. Client emits Socket.IO event: "getGraphData" with JSON request
3. Server validates request with Zod (GraphDataRequestSchema)
4. EventsGraphService.getData(request) called
5. EventsGraphDataRepo looks up Collection by ID
6. Collection.getData(request) delegates to matching Context
7. Context fetches/transforms external data into IGraphData + IEventData
8. Response wrapped in IEventsGraphCollectionContextResponse
9. Server emits "graphData" event with response
10. Client receives response, extracts graphData and meta
11. EventsGraph.loadGraphData(graphData) feeds data to ForceGraphVR
12. Physics simulation positions nodes in 3D space
13. Nodes rendered as spheres, links as lines, labels as sprites
14. Sound plays on initial load
```

### Streaming Data Flow

```
1. Client emits "getGraphDataStream" with JSON request
2. Server validates, finds streamable Context
3. Context calls back repeatedly with incremental data:
   - First callback: initial graphData (full graph structure)
   - Subsequent callbacks: eventData (individual events on links)
4. Server emits "graphStream" for each callback
5. Client merges new graph data with existing graph
6. Events trigger animated particles along links with positional audio
7. Stream continues until client emits "closeStream"
```

---

## 4. Core Data Schemas

### 4.1 Request Schema (What Your Endpoint Receives)

```typescript
// Zod-validated request schema
{
  collection: string    // min 1, max 100 chars — identifies the data source
  context: string       // min 1, max 100 chars — identifies the view/query type
  isStream: boolean     // optional, default false — whether to use streaming
  params: object        // optional, default {} — arbitrary parameters for the query
}
```

**Example Request:**
```json
{
  "collection": "my-api",
  "context": "network-topology",
  "isStream": false,
  "params": {
    "region": "us-east-1",
    "depth": 3
  }
}
```

### 4.2 Response Schema (What Your Endpoint Returns)

```typescript
interface IEventsGraphCollectionContextResponse {
  id: string                    // UUID — unique response identifier
  collection: string            // echoes the requested collection ID
  context: string               // echoes the requested context ID
  rootNodeID?: string           // optional — the "root" node ID for graph anchoring
  graphData?: IGraphData        // the nodes and links to render
  eventData?: IEventData        // optional — a single event to animate
  meta: IResponseMeta           // status and progress metadata
}
```

### 4.3 GraphData Schema (The Core Rendering Data)

```typescript
interface IGraphData {
  nodes: IGraphNode[]
  links: IGraphLink[]
}
```

### 4.4 GraphNode Schema (Individual Node)

This is the most important schema. Each field directly maps to a VR rendering property.

```typescript
interface IGraphNode {
  id: string          // REQUIRED — unique identifier for this node
  group: number       // REQUIRED — numeric group for auto-color assignment
  label: string       // REQUIRED — text displayed as 3D sprite near node
  val: number         // REQUIRED — determines physical size of the 3D sphere
  desc: string        // REQUIRED — description text shown in VR panel on activation
  icon: string        // REQUIRED — URL path to icon image (rendered as textured plane)
  type: string        // REQUIRED — type identifier, used for event particle coloring
  url: string         // REQUIRED — navigable URL shown in node's VR panel
  color?: string      // OPTIONAL — explicit hex color override (otherwise auto-colored by group)
  image?: string      // OPTIONAL — image URL for additional imagery
}
```

**VR Rendering Mapping for Node Fields:**

| Field | VR Effect | Details |
|-------|-----------|---------|
| `id` | Identity | Used for link source/target references. Must be unique across all nodes. |
| `group` | **Color** | Nodes with the same `group` value get the same auto-assigned color. Groups create visual clusters. |
| `label` | **3D Text** | Rendered as a SpriteText floating near the node. Auto-wrapped at ~10 words per line. Max ~150 words. |
| `val` | **Physical Size** | The sphere radius is derived from this value via normalization: `normalize(max(val, 0.8), 20, 0) * 5`. Default is 30. Range recommendation: 1-100. |
| `desc` | **VR Panel Content** | Shown in a three-mesh-ui panel when node is activated (clicked). Supports plain text. |
| `icon` | **3D Icon** | URL to a PNG/image file. Rendered as a 12x12 unit plane with the image texture, attached to the node's 3D object. If empty string, a default sphere mesh is used. |
| `type` | **Event Particle Color** | When events animate along links, the particle color is determined by the source node's `type`. Built-in mappings: `"user"` → green, `"service"` → red. Extendable. |
| `url` | **Clickable URL** | Displayed in the node's VR panel. Available for navigation. |
| `color` | **Explicit Color** | If provided, overrides the auto-color from `group`. Hex string (e.g., `"#FF6600"`). |

### 4.5 GraphLink Schema (Connections Between Nodes)

```typescript
interface IGraphLink {
  source: string      // REQUIRED — ID of the source node
  target: string      // REQUIRED — ID of the target node
  label?: string      // OPTIONAL — text rendered at link midpoint as 3D sprite
  val?: number        // OPTIONAL — used for auto-color-by-value on links
  type?: string       // OPTIONAL — type classification for the link
}
```

**VR Rendering Mapping for Link Fields:**

| Field | VR Effect | Details |
|-------|-----------|---------|
| `source` | **Origin** | Must match an existing node `id`. The link visually starts from this node. |
| `target` | **Destination** | Must match an existing node `id`. The link visually ends at this node. |
| `label` | **Midpoint Text** | Rendered as a SpriteText centered between source and target in 3D space. Color: lightgrey, height: 1.5 units. |
| `val` | **Link Color** | Links are auto-colored by this value. Used for `linkAutoColorBy`. |
| `type` | **Classification** | Available for filtering/categorization. Not currently rendered visually but available for extensions. |

### 4.6 EventData Schema (Animated Events on Links)

Events represent dynamic activity — things happening along the connections between nodes. They trigger animated particles traveling from source to target with positional audio.

```typescript
interface IEventData {
  action: string          // REQUIRED — describes what happened (e.g., "request", "transfer")
  source: string          // REQUIRED — source node ID (must match a link's source)
  target: string          // REQUIRED — target node ID (must match a link's target)
  id?: string             // OPTIONAL — unique event identifier
  category?: string       // OPTIONAL — event category for grouping
  label?: string          // OPTIONAL — human-readable event description
  val?: number            // OPTIONAL — numeric value (e.g., magnitude, count)
  type?: string           // OPTIONAL — type classification
  timestamp?: number      // OPTIONAL — Unix timestamp of the event
}
```

**VR Rendering Mapping for Event Fields:**

| Field | VR Effect | Details |
|-------|-----------|---------|
| `source` + `target` | **Particle Animation** | Directional particle travels along the matching link from source to target node |
| `action` | **Event Semantics** | Describes the nature of the event. Not visually rendered by default but available for conditional logic |
| `val` | **Magnitude** | Can influence visual weight of the event. Available for extensions |
| `source node type` | **Particle Color** | The particle color is derived from the source node's `type` field via the `eventTypeColors` map |
| *(all events)* | **Positional Audio** | Each event plays a positional audio cue (buzzing sound) at the link's 3D position. Volume attenuates with distance from the VR camera |

### 4.7 ResponseMeta Schema

```typescript
type ResponseStatus = "pending" | "error" | "completed"

interface IResponseMeta {
  status?: ResponseStatus   // "completed" for final data, "pending" for streaming progress
  progress?: number         // 0.0 to 1.0 for streaming progress, 1 for complete
  timeSent: string          // timestamp string (Date.now().toString())
}
```

---

## 5. VR Rendering Mapping: How Data Becomes Experience

### 5.1 Physics & Spatial Layout

The force-directed graph physics engine (d3-force-3d under 3d-force-graph-vr) positions nodes in 3D space based on:

- **Link connections** → connected nodes are pulled together
- **Node repulsion** → all nodes repel each other to prevent overlap
- **Node value (val)** → affects the collision radius (`nodeRelSize: 3`)

This means the spatial arrangement is emergent from the data topology — densely connected clusters form visible 3D groupings naturally.

**Mapping insight for API designers:** If you want certain data entities to cluster together physically, connect them with links. If you want hierarchical layouts, use a central root node with links radiating outward. The `CollectionAssociation` types (`"central"` vs `"linear"` vs `"none"`) describe how entity collections link to each other.

### 5.2 Color System

| Mechanism | Source Field | Effect |
|-----------|-------------|--------|
| Node auto-color | `node.group` (number) | Nodes with same group get same hue. Different groups get distinct colors |
| Node explicit color | `node.color` (string) | Overrides group auto-color with specific hex/CSS color |
| Link auto-color | `link.val` (number) | Links colored by value gradient |
| Event particle color | Source node's `type` | `"user"` → green, `"service"` → red. Custom types map to additional colors |
| Active node highlight | System-controlled | Active (clicked) node turns `0xff6600` (orange) and scales 1.3x |
| Default node color | System-controlled | `0x00ff00` (green) |

**Mapping insight:** Use `group` values strategically to create visual categories. For example, in a microservice architecture: group 1 = external providers, group 2 = core services, group 3 = support services. Each group auto-receives a distinct color.

### 5.3 Sound System

- **Load Sound**: A non-positional audio cue plays when graph data first loads
- **Event Sounds**: Each `IEventData` received triggers a `PositionalAudio` sound attached to the link's 3D position
  - Sound file: `./assets/audio/bee_buzz.ogg`
  - Audio is spatial — closer events are louder, distant events are quieter
  - Uses Three.js `PositionalAudio` with `refDistance: 300`
- **Sound caching**: Loaded audio buffers are cached by URL to avoid redundant loads

**Mapping insight:** High-frequency event streams create a "buzz" of activity. Areas with more events produce more ambient sound, giving an auditory sense of load/activity distribution.

### 5.4 Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| Sphere size | Node importance/value (`val` field) |
| Sphere color | Category/group membership |
| Orange highlight + 1.3x scale | Currently active/selected node |
| Link particles (directional) | Active data flow between nodes |
| Particle color | Type of activity (user vs service, etc.) |
| Link opacity (0.3) | Connection relationship (subtle/persistent) |
| Link width (0.8) | Connection presence |
| VR Panel appearance | Node detail view when activated |
| 3D text sprites | Node and link labels |
| Icon planes | Visual identity for node types |

### 5.5 Node Interaction

When a node is clicked/activated in VR:
1. Node scales to 1.3x and turns orange (`0xff6600`)
2. A `NodeDisplay` (VR Panel) appears adjacent to the node showing:
   - Title (from `label`)
   - Content (from `desc`)
   - URL (from `url`)
3. Camera smoothly tweens to face the node (Quadratic easing)
4. Previous active node resets to default state

---

## 6. The Connector Pattern: Oracle + Collection + Context

EventsGraph uses a layered abstraction for data sources:

### Layer Hierarchy

```
EventsGraphDataRepo
  └── Collection (Oracle)     — e.g., "twitter", "basicnetwork", "my-api"
       └── Context            — e.g., "tweet-lookup", "network-topology"
            └── getData()     — returns IEventsGraphCollectionContextResponse
            └── getDataStream() — pushes incremental responses via callback
```

### To Connect a New Data Source, You Implement:

1. **An Oracle class** extending `Oracle` (which implements `IEventsGraphCollection`)
   - Has a unique string ID (the `collection` in requests)
   - Contains one or more Contexts

2. **One or more Context classes** extending `Context` (which implements `IEventsGraphCollectionContext`)
   - Each has a unique string ID (the `context` in requests)
   - Implements `getData(request)` → returns `Promise<IEventsGraphCollectionContextResponse>`
   - Implements `getDataStream(request, callback)` → pushes data via callback
   - Reports `isStreamable()` → boolean

3. **Register the Oracle** in `EventsGraphDataRepo` constructor's `_repo` Map

### External API Alternative

Instead of implementing an Oracle inside EventsGraph, an external API can serve data in the expected response format. The Oracle/Context in EventsGraph would then simply fetch from your API and pass through the response. The critical requirement is that **the response matches `IEventsGraphCollectionContextResponse`**.

---

## 7. API Endpoint Specification

### 7.1 One-Shot Data Endpoint

Your API should expose an endpoint that accepts a request and returns graph data.

**Endpoint:** `POST /api/eventsgraph/data` (or any URL — EventsGraph connects via Oracle)

**Request Body:**
```json
{
  "collection": "your-collection-id",
  "context": "your-context-id",
  "isStream": false,
  "params": {
    // Arbitrary parameters specific to your data source
  }
}
```

**Response Body:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "collection": "your-collection-id",
  "context": "your-context-id",
  "rootNodeID": "root-node-1",
  "graphData": {
    "nodes": [
      {
        "id": "root-node-1",
        "group": 1,
        "label": "Root Node",
        "val": 50,
        "desc": "This is the root node of the visualization",
        "icon": "",
        "type": "root",
        "url": ""
      }
    ],
    "links": []
  },
  "eventData": {
    "action": "",
    "source": "",
    "target": "",
    "id": "",
    "category": "",
    "label": "",
    "val": 0,
    "type": ""
  },
  "meta": {
    "status": "completed",
    "progress": 1,
    "timeSent": "1713168000000"
  }
}
```

### 7.2 Content-Type

- Request: `application/json`
- Response: `application/json`

### 7.3 Transport

EventsGraph currently uses **Socket.IO** as its primary transport (not REST). The Socket.IO events are:

| Event | Direction | Payload |
|-------|-----------|---------|
| `getGraphData` | Client → Server | JSON string of request |
| `graphData` | Server → Client | `IEventsGraphCollectionContextResponse` object |
| `getGraphDataStream` | Client → Server | JSON string of request |
| `graphStream` | Server → Client | `IEventsGraphCollectionContextResponse` object (repeated) |
| `closeStream` | Client → Server | (no payload) |
| `error` | Server → Client | `{ message: string, errors?: object[] }` |

If you are building a bridging Oracle that calls an external HTTP API, the Oracle translates between Socket.IO and your REST endpoint.

---

## 8. Streaming Endpoint Specification

For real-time data visualization (live events, monitoring, IoT data), implement a streaming pattern:

### Flow

1. **Initial Response**: Send the full graph structure (nodes + links)
   - `meta.status: "pending"`, `meta.progress: 0`

2. **Incremental Updates**: Send event data for activity on the graph
   - Each update contains `eventData` with `source` and `target` matching existing node IDs
   - Events trigger particle animations along the matching link
   - Events trigger positional audio

3. **Progress Updates**: Optionally send progress-only responses
   - `meta.status: "pending"`, `meta.progress: 0.0-1.0`
   - No `graphData` or `eventData`

4. **Completion**: Final response with `meta.status: "completed"`, `meta.progress: 1`

### Streaming Response Sequence Example

**Message 1 (Initial Graph):**
```json
{
  "id": "stream-001",
  "collection": "monitoring",
  "context": "live-events",
  "rootNodeID": "server-main",
  "graphData": {
    "nodes": [
      {"id": "server-main", "group": 1, "label": "Main Server", "val": 40, "desc": "Primary application server", "icon": "./assets/images/server.png", "type": "service", "url": ""},
      {"id": "db-primary", "group": 2, "label": "Primary DB", "val": 30, "desc": "PostgreSQL primary", "icon": "./assets/images/database.png", "type": "service", "url": ""},
      {"id": "user-a", "group": 3, "label": "User Session A", "val": 10, "desc": "Active user session", "icon": "", "type": "user", "url": ""}
    ],
    "links": [
      {"source": "user-a", "target": "server-main", "label": "HTTP", "val": 1},
      {"source": "server-main", "target": "db-primary", "label": "Query", "val": 2}
    ]
  },
  "meta": {
    "status": "pending",
    "progress": 0,
    "timeSent": "1713168000000"
  }
}
```

**Message 2..N (Events):**
```json
{
  "id": "stream-002",
  "collection": "monitoring",
  "context": "live-events",
  "eventData": {
    "action": "request",
    "source": "user-a",
    "target": "server-main",
    "category": "http",
    "label": "GET /api/data",
    "val": 1,
    "type": "user"
  },
  "meta": {
    "status": "pending",
    "progress": 0.5,
    "timeSent": "1713168001000"
  }
}
```

### Streaming with New Nodes

Streaming can also add new nodes to the graph. When `graphData` is present in a stream message, the nodes and links are **merged** into the existing graph. The system automatically creates a link from the new data's first node to the last-added node, forming an expanding graph.

---

## 9. Complete JSON Examples

### 9.1 Minimal Valid Response (Single Node)

```json
{
  "id": "resp-001",
  "collection": "demo",
  "context": "single",
  "rootNodeID": "node-1",
  "graphData": {
    "nodes": [
      {
        "id": "node-1",
        "group": 1,
        "label": "Hello World",
        "val": 30,
        "desc": "A single node in VR space",
        "icon": "",
        "type": "default",
        "url": ""
      }
    ],
    "links": []
  },
  "meta": {
    "status": "completed",
    "progress": 1,
    "timeSent": "1713168000000"
  }
}
```

### 9.2 Network Topology Example

```json
{
  "id": "resp-002",
  "collection": "infrastructure",
  "context": "topology",
  "rootNodeID": "lb-main",
  "graphData": {
    "nodes": [
      {
        "id": "lb-main",
        "group": 1,
        "label": "Load Balancer",
        "val": 50,
        "desc": "HAProxy load balancer distributing traffic across web tier",
        "icon": "./assets/images/load-balancer.png",
        "type": "infrastructure",
        "url": "https://dashboard.example.com/lb"
      },
      {
        "id": "web-1",
        "group": 2,
        "label": "Web Server 1",
        "val": 30,
        "desc": "Nginx + Node.js application server. CPU: 45%, Memory: 2.1GB/4GB",
        "icon": "./assets/images/web-server.png",
        "type": "service",
        "url": "https://dashboard.example.com/web-1"
      },
      {
        "id": "web-2",
        "group": 2,
        "label": "Web Server 2",
        "val": 30,
        "desc": "Nginx + Node.js application server. CPU: 62%, Memory: 2.8GB/4GB",
        "icon": "./assets/images/web-server.png",
        "type": "service",
        "url": "https://dashboard.example.com/web-2"
      },
      {
        "id": "cache-1",
        "group": 3,
        "label": "Redis Cache",
        "val": 25,
        "desc": "Redis 7.0 - Hit rate: 94.2%, Memory: 1.2GB/2GB",
        "icon": "./assets/images/cache.png",
        "type": "service",
        "url": "https://dashboard.example.com/redis"
      },
      {
        "id": "db-primary",
        "group": 4,
        "label": "PostgreSQL Primary",
        "val": 40,
        "desc": "PostgreSQL 15 - Connections: 142/200, QPS: 3,400",
        "icon": "./assets/images/database.png",
        "type": "service",
        "url": "https://dashboard.example.com/db"
      },
      {
        "id": "db-replica",
        "group": 4,
        "label": "PostgreSQL Replica",
        "val": 35,
        "desc": "Read replica - Lag: 12ms, Connections: 89/200",
        "icon": "./assets/images/database.png",
        "type": "service",
        "url": "https://dashboard.example.com/db-replica"
      },
      {
        "id": "queue-1",
        "group": 5,
        "label": "Message Queue",
        "val": 20,
        "desc": "RabbitMQ - Queued: 1,204 messages, Consumer count: 8",
        "icon": "./assets/images/queue.png",
        "type": "service",
        "url": "https://dashboard.example.com/mq"
      },
      {
        "id": "worker-1",
        "group": 6,
        "label": "Background Worker",
        "val": 15,
        "desc": "Processing async jobs. Jobs/min: 340",
        "icon": "",
        "type": "worker",
        "url": ""
      }
    ],
    "links": [
      {"source": "lb-main", "target": "web-1", "label": "Round Robin", "val": 5},
      {"source": "lb-main", "target": "web-2", "label": "Round Robin", "val": 5},
      {"source": "web-1", "target": "cache-1", "label": "Cache Read", "val": 3},
      {"source": "web-2", "target": "cache-1", "label": "Cache Read", "val": 3},
      {"source": "web-1", "target": "db-primary", "label": "Write", "val": 2},
      {"source": "web-2", "target": "db-primary", "label": "Write", "val": 2},
      {"source": "web-1", "target": "db-replica", "label": "Read", "val": 4},
      {"source": "web-2", "target": "db-replica", "label": "Read", "val": 4},
      {"source": "db-primary", "target": "db-replica", "label": "Replication", "val": 1},
      {"source": "web-1", "target": "queue-1", "label": "Enqueue", "val": 2},
      {"source": "web-2", "target": "queue-1", "label": "Enqueue", "val": 2},
      {"source": "queue-1", "target": "worker-1", "label": "Consume", "val": 3}
    ]
  },
  "meta": {
    "status": "completed",
    "progress": 1,
    "timeSent": "1713168000000"
  }
}
```

### 9.3 Hierarchical Data (Organization Chart)

```json
{
  "id": "resp-003",
  "collection": "orgchart",
  "context": "department",
  "rootNodeID": "ceo",
  "graphData": {
    "nodes": [
      {"id": "ceo", "group": 1, "label": "CEO", "val": 60, "desc": "Chief Executive Officer", "icon": "", "type": "executive", "url": ""},
      {"id": "cto", "group": 2, "label": "CTO", "val": 45, "desc": "Chief Technology Officer - Engineering & Product", "icon": "", "type": "executive", "url": ""},
      {"id": "cfo", "group": 3, "label": "CFO", "val": 45, "desc": "Chief Financial Officer - Finance & Operations", "icon": "", "type": "executive", "url": ""},
      {"id": "eng-lead", "group": 2, "label": "Engineering Lead", "val": 30, "desc": "Leads platform engineering team of 12", "icon": "", "type": "manager", "url": ""},
      {"id": "prod-lead", "group": 2, "label": "Product Lead", "val": 30, "desc": "Leads product team of 8", "icon": "", "type": "manager", "url": ""},
      {"id": "dev-1", "group": 2, "label": "Developer 1", "val": 15, "desc": "Full-stack developer", "icon": "", "type": "individual", "url": ""},
      {"id": "dev-2", "group": 2, "label": "Developer 2", "val": 15, "desc": "Backend developer", "icon": "", "type": "individual", "url": ""},
      {"id": "fin-analyst", "group": 3, "label": "Financial Analyst", "val": 15, "desc": "Financial planning and analysis", "icon": "", "type": "individual", "url": ""}
    ],
    "links": [
      {"source": "ceo", "target": "cto", "label": "Reports To"},
      {"source": "ceo", "target": "cfo", "label": "Reports To"},
      {"source": "cto", "target": "eng-lead", "label": "Manages"},
      {"source": "cto", "target": "prod-lead", "label": "Manages"},
      {"source": "eng-lead", "target": "dev-1", "label": "Manages"},
      {"source": "eng-lead", "target": "dev-2", "label": "Manages"},
      {"source": "cfo", "target": "fin-analyst", "label": "Manages"}
    ]
  },
  "meta": {
    "status": "completed",
    "progress": 1,
    "timeSent": "1713168000000"
  }
}
```

---

## 10. Validation Rules

### Node Validation

- `id`: Must be a non-empty string. Must be unique across all nodes in the response.
- `group`: Must be a number. Use consistent group numbers across nodes that should share the same color.
- `label`: Should be concise. The system auto-wraps at ~10 words per line. Long labels are truncated/wrapped. Maximum recommended: ~150 words.
- `val`: Must be a number ≥ 0. Default: 30. Recommended range: 1–100. Values are normalized for sphere sizing.
- `desc`: Can be any string. Displayed in VR panel on node activation. Can be multi-line.
- `icon`: Either a valid URL path to an image (PNG recommended) or empty string `""`. If empty, node renders as a default green sphere.
- `type`: Non-empty string. Used for event particle coloring. Built-in types: `"user"` (green particles), `"service"` (red particles). Custom types will use default particle color.
- `url`: Valid URL string or empty string `""`.

### Link Validation

- `source`: Must reference an existing node `id`.
- `target`: Must reference an existing node `id`.
- `source` and `target` should not be the same node (self-links are technically possible but not well-supported visually).
- `label`: Optional. Rendered as midpoint text on the link.
- `val`: Optional number. Used for link color gradient.

### Event Validation

- `source` and `target`: Must match source/target of an existing link. If no matching link exists, the event is silently ignored.
- `action`: Required non-empty string.

### Response Validation

- `id`: Must be a non-empty string (UUID recommended).
- `collection` and `context`: Must echo the requested values.
- `meta.timeSent`: Must be a string representation of a timestamp (e.g., `Date.now().toString()`).
- `meta.status`: Must be `"pending"`, `"error"`, or `"completed"`.
- `meta.progress`: Number between 0 and 1.

---

## 11. Implementation Checklist

For an AI or developer building a data connector endpoint:

```
- [ ] 1. Define your collection ID (lowercase string, e.g., "my-datasource")
- [ ] 2. Define your context ID(s) (e.g., "overview", "detail-view", "live-monitor")
- [ ] 3. Define your params schema (what parameters your endpoint accepts)
- [ ] 4. Map your domain entities to IGraphNode objects:
        - Assign unique IDs
        - Choose group numbers for color categories
        - Set val for relative importance/size
        - Write desc for detail panels
        - Set type for event particle behavior
        - Provide icon URLs if available
- [ ] 5. Map your domain relationships to IGraphLink objects:
        - source and target reference node IDs
        - Add labels for relationship descriptions
- [ ] 6. Wrap in IEventsGraphCollectionContextResponse:
        - Generate UUID for id
        - Echo collection and context
        - Set rootNodeID to the primary/central node
        - Include graphData with nodes and links
        - Set meta with status and timeSent
- [ ] 7. (If streaming) Implement event generation:
        - First message: full graphData
        - Subsequent messages: eventData with source/target matching existing links
        - Events trigger visual particles and positional audio
- [ ] 8. (If streaming) Implement close/cleanup:
        - Respond to closeStream by stopping event generation
        - Clean up any open connections or intervals
- [ ] 9. Test with DummyData pattern:
        - Start with static JSON matching the schemas above
        - Verify rendering in EventsGraph
        - Then connect to live data
- [ ] 10. Register as Oracle in EventsGraphDataRepo (if internal)
         OR expose as HTTP API endpoint (if external, with a thin Oracle wrapper)
```

---

## Appendix A: Type Reference Summary

```typescript
// === REQUEST ===
interface IEventsGraphCollectionContextRequest {
  collection: string
  context: string
  isStream: boolean
  params: any
}

// === RESPONSE ===
interface IEventsGraphCollectionContextResponse {
  id: string
  collection: string
  context: string
  rootNodeID?: string
  graphData?: IGraphData
  eventData?: IEventData
  meta: IResponseMeta
}

// === GRAPH DATA ===
interface IGraphData {
  nodes: IGraphNode[]
  links: IGraphLink[]
}

interface IGraphNode {
  id: string
  group: number
  label: string
  val: number
  desc: string
  icon: string
  type: string
  url: string
  color?: string
  image?: string
}

interface IGraphLink {
  source: string
  target: string
  label?: string
  val?: number
  type?: string
}

// === EVENT DATA ===
interface IEventData {
  action: string
  source: string
  target: string
  id?: string
  category?: string
  label?: string
  val?: number
  type?: string
  timestamp?: number
}

// === META ===
type ResponseStatus = "pending" | "error" | "completed"

interface IResponseMeta {
  status?: ResponseStatus
  progress?: number
  timeSent: string
}
```

## Appendix B: Collection Association Types

When building entity collections server-side, the `CollectionAssociation` type controls how child entities link to each other:

| Type | Behavior | Use Case |
|------|----------|----------|
| `"central"` | All child entities link to the root collection node | Hub-and-spoke: one central entity with many peers |
| `"linear"` | Each entity links to the next in sequence, starting from root | Chain/pipeline: sequential flow of data or process |
| `"none"` | No automatic linking between entities | Custom: you control all links explicitly |

## Appendix C: Design Patterns for Different Data Domains

| Data Domain | Recommended Node Mapping | Recommended Link Mapping | Streaming Use |
|-------------|------------------------|--------------------------|---------------|
| **Microservices** | Each service = node, val = load/importance | Service-to-service calls = links | Events = API requests flowing between services |
| **Social Networks** | Users = nodes, val = follower count | Follows/mentions = links | Events = messages, likes, shares |
| **Knowledge Graphs** | Concepts = nodes, val = relevance score | Relationships = links with label | N/A (static) |
| **IoT/Monitoring** | Devices = nodes, val = priority | Data flows = links | Events = sensor readings, alerts |
| **Supply Chain** | Facilities = nodes, val = throughput | Logistics routes = links | Events = shipments, orders |
| **Code Dependencies** | Modules/packages = nodes, val = LOC or importance | Import/dependency = links | Events = build/deploy activity |
| **Network Security** | Hosts = nodes, val = risk score | Connections = links | Events = traffic, alerts, attacks |
| **Financial** | Accounts/entities = nodes, val = volume | Transactions = links | Events = individual transactions |

---

*This document version is aligned with the EventsGraph codebase as of the current state. The schemas and patterns described here are derived directly from the TypeScript interfaces and implementation in the `src/server/domain/` and `src/client/lib/` directories.*
