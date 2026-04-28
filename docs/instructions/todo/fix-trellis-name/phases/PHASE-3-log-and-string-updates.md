# Phase 3 — Log / operator string updates

> **Parent plan:** [PLAN.md](../PLAN.md)
> **Branch:** `rename/trellis-to-sylva`
> **Status:** not started
> **Depends on:** Phase 2
> **Unblocks:** Phase 4

---

## 1. Purpose

Replace operator-facing strings (logger output, JSDoc, inline
comments) inside the renamed `sylva/` tree so logs, dashboards,
and grep workflows reflect the new name.

The known offenders include:

- `Trellis Oracle: initialized with advanced features support (Phase 6)`
- `Trellis: authenticated successfully`
- `Trellis: received 401, re-authenticating`
- `Trellis: token refresh failed`
- `Trellis auth failed: …`
- JSDoc comments referring to "Trellis API", "Trellis instance", etc.

This phase is committed **separately** from earlier phases so any
test failures caused by log-string assertions are isolated and
easy to bisect.

---

## 2. Scope

**In scope:**

- All `logger.*(...)` and `console.*(...)` strings inside
  `src/server/lib/repos/oracles/sylva/` containing the word
  `Trellis` (case-insensitive in operator prose; case-sensitive
  for identifier-like prefixes such as `Trellis:`).
- JSDoc / inline comments referring to "Trellis" inside the same
  folder.

**Out of scope:**

- Identifiers (already done in Phase 1).
- Constants (Phase 2).
- `.env.example`, env var reads (Phase 4).
- The wire string `'trellis'` (Phase 5).
- Comments that intentionally preserve historical context
  ("formerly Trellis"). Leave one such reference per file at most,
  on first occurrence.

---

## 3. Steps

1. Find any tests that assert on log substrings — fixing them
   first prevents red bisects:
   ```bash
   rg -n "Trellis" src/server/lib/repos/oracles/sylva/__tests__
   ```
   Note the files; you'll update assertions in step 3.
2. Sweep log strings in production code:
   ```bash
   rg -n "Trellis" src/server/lib/repos/oracles/sylva \
     --glob '!__tests__/**' --glob '!**/*.test.ts'
   ```
   For each hit, decide:
   - Operator log line (`logger.info('Trellis: …')`) → rewrite to `'Sylva: …'`.
   - Class header comment (`/** Trellis API client */`) → rewrite to `Sylva`.
   - Historical note → optionally rewrite to `Sylva (formerly Trellis)` on first
     occurrence per file; remove subsequent duplicates.
3. Update test assertions in `__tests__/` to match the new strings.
4. Validate:
   ```bash
   npm run lint
   npm test
   ```
5. Smoke-check the running server (optional but recommended):
   ```bash
   npm run server
   ```
   Confirm the startup log shows
   `Sylva Oracle: initialized with advanced features support (Phase 6)`
   instead of the legacy `Trellis Oracle: …`. Stop the server.
6. Commit:
   ```bash
   git add -A
   git commit -m "UPDATED: Replace operator-facing 'Trellis' strings with 'Sylva'"
   ```

---

## 4. Exit criteria

- [ ] `rg -n "Trellis" src/server/lib/repos/oracles/sylva` returns
      only intentional historical/comment references (zero or one
      per file, in "formerly Trellis" form).
- [ ] All test assertions reference the new `Sylva` strings.
- [ ] `npm run lint` exits 0.
- [ ] `npm test` exits 0.
- [ ] One commit landed: `UPDATED: Replace operator-facing 'Trellis' strings with 'Sylva'`.

---

## 5. Guardrails

- Do not modify env var names, constant values, or the wire
  collection id. Those belong to Phases 4 and 5.
- Do not perform a blanket repo-wide `sed` on the lowercase word
  `trellis` — that would catch the wire string literal and break
  Phase 5's gating.
- Keep changes confined to `src/server/lib/repos/oracles/sylva/`.
