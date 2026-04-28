# Phase 6 — Documentation & cleanup

> **Parent plan:** [PLAN.md](../PLAN.md)
> **Branch:** `rename/trellis-to-sylva`
> **Status:** not started
> **Depends on:** Phase 5 (or Phase 4, if D1 deferred)
> **Unblocks:** Phase 7 (after at least one release cycle)

---

## 1. Purpose

Wrap the rename initiative: update user-facing docs, archive the
planning artifacts, and publish release notes that capture the
deprecation timeline for `TRELLIS_*` env vars and (if Phase 5
landed) the `collection: 'trellis'` alias.

This phase ships no production code changes.

---

## 2. Scope

**In scope:**

- [README.md](../../../../README.md) — add a Sylva section if/when
  one is warranted (currently no docs reference Trellis).
- This planning folder
  `docs/instructions/todo/fix-trellis-name/` — move to
  `docs/instructions/done/rename-trellis-to-sylva/`.
- `docs/instructions/todo/fix-trellis-name/prompt.txt` — remove
  once the work has shipped.
- `CHANGELOG` (or release notes file) — add an entry covering env
  var migration and, if Phase 5 ran, the wire id change with its
  one-release alias.

**Out of scope:**

- Removing the `TRELLIS_*` env var fallback shim — Phase 7.
- Removing the `'trellis'` collection alias — Phase 7.

---

## 3. Steps

1. Audit user-facing docs for stale references:
   ```bash
   rg -n 'Trellis|TRELLIS|trellis' README.md docs/ \
     --glob '!docs/instructions/todo/fix-trellis-name/**' \
     --glob '!docs/instructions/done/rename-trellis-to-sylva/**'
   ```
   Update any production-facing prose to `Sylva` (mention
   "formerly Trellis" once, if helpful for newcomers).
2. Add or update the changelog / release notes:
   - Headline: `Renamed Trellis integration to Sylva.`
   - Note: `TRELLIS_* env vars are deprecated; rename to SYLVA_*.
     Legacy names continue to work and emit a warning. Removal
     scheduled for the next major release (Phase 7).`
   - If Phase 5 landed: `Socket.io collection id 'trellis' is
     deprecated; use 'sylva'. Legacy id continues to route to
     Sylva for one release.`
3. Archive the planning folder:
   ```bash
   mkdir -p docs/instructions/done
   git mv docs/instructions/todo/fix-trellis-name \
          docs/instructions/done/rename-trellis-to-sylva
   git rm docs/instructions/done/rename-trellis-to-sylva/prompt.txt
   ```
4. Validate:
   ```bash
   npm run lint
   npm test
   ```
   (No code changes expected, but run anyway as a regression check.)
5. Commit:
   ```bash
   git add -A
   git commit -m "DOCS: Archive Trellis→Sylva rename plan and publish release notes"
   ```

---

## 4. Exit criteria

- [ ] No user-facing docs reference `Trellis` outside intentional
      "formerly Trellis" historical context.
- [ ] Changelog / release-notes entry exists and lists the
      deprecation timeline.
- [ ] Folder `docs/instructions/todo/fix-trellis-name/` no longer
      exists; equivalent content lives at
      `docs/instructions/done/rename-trellis-to-sylva/`.
- [ ] `prompt.txt` is removed from the archived folder.
- [ ] `npm run lint` exits 0.
- [ ] `npm test` exits 0.
- [ ] One commit landed:
      `DOCS: Archive Trellis→Sylva rename plan and publish release notes`.

---

## 5. Guardrails

- Do not remove fallback shims or aliases — that is Phase 7's job.
- Use `git mv` so the archived planning folder retains history.
