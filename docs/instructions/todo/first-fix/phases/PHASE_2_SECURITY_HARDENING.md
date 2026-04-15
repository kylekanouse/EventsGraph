# Phase 2 — Security Hardening

**Parent Document:** [SOLUTIONS_ARCHITECTURE.md](../SOLUTIONS_ARCHITECTURE.md)  
**Companion Document:** [CODEBASE_ANALYSIS.md](../CODEBASE_ANALYSIS.md)  
**Prerequisite:** [Phase 1 — Stabilize Build Toolchain](./PHASE_1_STABILIZE_BUILD.md) completed and verified.  
**Objective:** Address the 163 vulnerabilities and add baseline security middleware (helmet, CORS, rate limiting, input validation, error boundary).

---

## Guiding Principles (Apply to All Phases)

1. **No regressions.** Every phase ends with a working server + client. Validate with runtime tests before proceeding.
2. **Incremental delivery.** Each phase is independently committable and deployable.
3. **Minimal blast radius.** Group related changes; avoid mixing build changes with logic changes.
4. **Preserve architecture strengths.** The Oracle pattern, Entity system, and streaming model are well-designed. Modernize tooling around them, not through them.
5. **One problem at a time.** Do not combine dependency upgrades with refactors. Upgrade first, refactor second.

---

## Prerequisites

- Phase 1 completed (`npm install && npm run build && npm run server` works on Node 20)
- Server starts and client loads successfully

---

## Tasks

### 2.1 Run `npm audit fix`

```bash
npm audit fix
```

This resolves auto-fixable transitive dependency vulnerabilities without breaking changes.

### 2.2 Install Security Middleware

```bash
npm install helmet cors express-rate-limit
npm install --save-dev @types/cors
```

### 2.3 Apply Security Middleware

**File:** `src/server/index.ts`

```typescript
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

// After app creation, before routes:
app.use(helmet({
  contentSecurityPolicy: false  // Disable CSP initially (Three.js needs inline scripts)
}))

app.use(cors({
  origin: process.env.CLIENT_BASE_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', apiLimiter)
```

### 2.4 Add Socket Request Validation

```bash
npm install zod
```

**File:** `src/server/domain/schemas.ts` (new file)

```typescript
import { z } from 'zod'

export const GraphDataRequestSchema = z.object({
  collection: z.string().min(1).max(100),
  context: z.string().min(1).max(100),
  isStream: z.boolean().optional().default(false),
  params: z.record(z.unknown()).optional().default({}),
})

export type ValidatedGraphDataRequest = z.infer<typeof GraphDataRequestSchema>
```

**File:** `src/server/socket.ts` — wrap request parsing:

```typescript
import { GraphDataRequestSchema } from './domain/schemas'

// In socket event handler:
const parseResult = GraphDataRequestSchema.safeParse(JSON.parse(data))
if (!parseResult.success) {
  socket.emit('error', { message: 'Invalid request', errors: parseResult.error.issues })
  return
}
const request = parseResult.data
```

### 2.5 Add React Error Boundary

**File:** `src/client/components/ErrorBoundary.tsx` (new file)

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('EventsGraph Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 20, color: '#fff', background: '#333' }}>
        <h2>Something went wrong</h2>
        <p>{this.state.error?.message}</p>
        <button onClick={() => this.setState({ hasError: false })}>Retry</button>
      </div>
    }
    return this.props.children
  }
}
```

Wrap the `App` component in `src/client/index.tsx`:
```typescript
// Before
ReactDOM.render(<App />, document.getElementById('root'))

// After
ReactDOM.render(
  <ErrorBoundary><App /></ErrorBoundary>,
  document.getElementById('root')
)
```

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add security packages |
| `src/server/index.ts` | Modify | Add helmet, CORS, rate limiter middleware stack |
| `src/server/socket.ts` | Modify | Add Zod validation for incoming socket requests |
| `src/server/domain/schemas.ts` | Create | Zod request schemas |
| `src/client/components/ErrorBoundary.tsx` | Create | React error boundary |
| `src/client/index.tsx` | Modify | Wrap App with ErrorBoundary |

---

## New Dependencies

| Package | Version | Type | Purpose |
|---------|---------|------|---------|
| `helmet` | ^8.0.0 | prod | Security headers |
| `cors` | ^2.8.5 | prod | CORS middleware |
| `express-rate-limit` | ^7.0.0 | prod | Rate limiting on `/api` routes |
| `zod` | ^3.23.0 | prod | Request validation for socket and API inputs |
| `@types/cors` | latest | dev | TypeScript types for cors |

---

## Target Server Architecture After This Phase

```
┌─────────────────────────────────────────────────────┐
│                  EXPRESS APPLICATION                  │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │            MIDDLEWARE STACK                   │    │
│  │  helmet → cors → rateLimiter → bodyParser    │    │
│  │  → logger → routes                          │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌──────────────────┐  ┌────────────────────────┐   │
│  │ Socket.IO        │  │ REST API /api/          │   │
│  │ + Zod validation │  │ + Zod validation        │   │
│  │ + throttling     │  │ + rate limiting         │   │
│  └────────┬─────────┘  └───────────┬────────────┘   │
│           │                        │                │
│  ┌────────┴────────────────────────┴────────────┐   │
│  │          EventsGraphService (Facade)          │   │
│  └────────────────────┬─────────────────────────┘   │
│                       │                             │
│  ┌────────────────────┴─────────────────────────┐   │
│  │          EventsGraphDataRepo (Repository)     │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Verification Checkpoint

```
- [ ] npm audit shows reduced vulnerability count
- [ ] Server responds with security headers (check with curl -I)
- [ ] CORS headers present on API responses
- [ ] Rate limiting active on /api routes (verify with rapid requests)
- [ ] Invalid socket requests return structured error messages
- [ ] React error boundary catches and displays errors gracefully
- [ ] All existing functionality still works (DummyData, BasicNetwork)
```

### Quick Smoke Test

```bash
npm run server
# In another terminal:
curl -I http://localhost:8050
# Expected: X-Content-Type-Options, X-Frame-Options, etc. headers present

# Test rate limiting:
for i in $(seq 1 105); do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8050/api/test; done
# Expected: 429 status after 100 requests

# Browser test:
open http://localhost:8050
# Expected: 3D graph interface loads, DummyData works, BasicNetwork works
```

---

## Next Phase

Proceed to [Phase 3 — Test Infrastructure](./PHASE_3_TEST_INFRASTRUCTURE.md) after all checkpoints pass.
