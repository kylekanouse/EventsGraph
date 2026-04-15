# Phase 1 — Stabilize Build Toolchain

**Parent Document:** [SOLUTIONS_ARCHITECTURE.md](../SOLUTIONS_ARCHITECTURE.md)  
**Companion Document:** [CODEBASE_ANALYSIS.md](../CODEBASE_ANALYSIS.md)  
**Prerequisite:** [Phase 0 — Pre-Flight](./PHASE_0_PRE_FLIGHT.md) completed and verified.  
**Objective:** Replace deprecated/broken build dependencies so `npm install && npm run build && npm run server` works on Node 20.

---

## Guiding Principles (Apply to All Phases)

1. **No regressions.** Every phase ends with a working server + client. Validate with runtime tests before proceeding.
2. **Incremental delivery.** Each phase is independently committable and deployable.
3. **Minimal blast radius.** Group related changes; avoid mixing build changes with logic changes.
4. **Preserve architecture strengths.** The Oracle pattern, Entity system, and streaming model are well-designed. Modernize tooling around them, not through them.
5. **One problem at a time.** Do not combine dependency upgrades with refactors. Upgrade first, refactor second.

---

## Prerequisites

- Phase 0 completed (`.nvmrc`, `.gitignore` fixed, lock file generated)
- Node 20 LTS active

---

## Tasks

### 1.1 Replace `node-sass` with `sass`

**Files modified:** `package.json`, `webpack.config.js`

```bash
npm uninstall node-sass
npm install --save-dev sass
```

`sass-loader` already supports Dart Sass — no config change needed in webpack. The `sass-loader` option `implementation` defaults to `sass` if `node-sass` is absent.

**Verification:** `npm run build` succeeds. The single `.scss` file (`src/client/styles/eventsgraph.scss`) is trivial CSS — no Sass-specific features used.

### 1.2 Replace `awesome-typescript-loader` with `ts-loader`

**Files modified:** `package.json`, `webpack.config.js`

```bash
npm uninstall awesome-typescript-loader
npm install --save-dev ts-loader
```

Update `webpack.config.js`:
```javascript
// Before
{
  test: /\.tsx?$/,
  use: [{ loader: 'awesome-typescript-loader' }],
  exclude: /node_modules/
}

// After
{
  test: /\.tsx?$/,
  use: [{ loader: 'ts-loader' }],
  exclude: /node_modules/
}
```

### 1.3 Replace `babel-polyfill` with `core-js`

**Files modified:** `package.json`, `webpack.config.js`

```bash
npm uninstall babel-polyfill
npm install core-js regenerator-runtime
```

Update `webpack.config.js` entry:
```javascript
// Before
entry: ['babel-polyfill', './src/client/index.tsx'],

// After
entry: ['core-js/stable', 'regenerator-runtime/runtime', './src/client/index.tsx'],
```

### 1.4 Replace `babel-eslint` with `@babel/eslint-parser`

```bash
npm uninstall babel-eslint
npm install --save-dev @babel/eslint-parser
```

Update any ESLint config referencing `babel-eslint` as parser.

### 1.5 Remove `less` and `less-loader`

No `.less` files exist in the source tree. These are dead weight.

```bash
npm uninstall less less-loader
```

Remove the less-loader rule from `webpack.config.js` if present (currently no less rule exists in webpack config, so just the package removal suffices).

### 1.6 Verify Full Build Cycle

```bash
npm install                    # Clean install on Node 20
npm run build                  # Webpack production build
npm run server                 # Start server
# Open http://localhost:8050   # Verify client loads
```

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Swap deprecated dependencies for replacements |
| `webpack.config.js` | Modify | Replace loader references (`awesome-typescript-loader` → `ts-loader`, `babel-polyfill` → `core-js`) |

---

## Dependency Changes Summary

| Remove | Add | Reason |
|--------|-----|--------|
| `node-sass` | `sass` (devDep) | `node-sass` breaks on Node >16 |
| `awesome-typescript-loader` | `ts-loader` (devDep) | `awesome-typescript-loader` requires webpack 4, unmaintained |
| `babel-polyfill` | `core-js` + `regenerator-runtime` (prod) | `babel-polyfill` deprecated |
| `babel-eslint` | `@babel/eslint-parser` (devDep) | `babel-eslint` deprecated |
| `less` + `less-loader` | — | No `.less` files in source tree |

---

## Known Constraints

| Constraint | Detail |
|-----------|--------|
| `babel-polyfill` | Imports `regenerator-runtime` globally. Webpack 5 / Vite don't bundle it the same way. The `core-js/stable` + `regenerator-runtime/runtime` combo is the direct replacement. |
| Webpack stays at 4.x | This phase only swaps loaders within the existing webpack 4 setup. Full Vite migration happens in Phase 4. |

---

## Verification Checkpoint

```
- [ ] npm install succeeds on Node 20 with no native compilation errors
- [ ] npm run build produces dist/ with index.html and js/main.bundle.js
- [ ] npm run server starts on port 8050
- [ ] Client loads in browser, 3D graph renders with DummyData
- [ ] npm run dev works (concurrent server + client dev mode)
- [ ] No console errors related to deprecated packages
```

### Quick Smoke Test

```bash
npm install
npm run build
npm run server
# Expected: "App listening on 8050"
# Open http://localhost:8050 — 3D graph interface loads without console errors
```

---

## Next Phase

Proceed to [Phase 2 — Security Hardening](./PHASE_2_SECURITY_HARDENING.md) after all checkpoints pass.
