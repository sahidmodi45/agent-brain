# Project Overview

_One place to see what we're building and where it stands. Keep this true — the Manager owns the phase checklist, the Planner owns the overview._

## What this is

A tiny local demo, unrelated to the (now-shipped) `status.json` project: a Node HTTP server built with only built-in modules, exposing a single `GET /quote` endpoint that returns a random quote as JSON from a small hardcoded list, plus a plain `index.html` page that fetches `/quote` and displays it, with a button to get another. No external dependencies, no database, no build step.

## Current phase

Move the marker as work progresses. Only one phase is "current" at a time.

- [ ] **Planning** — Planner is working out the approach.
- [ ] **Delegated** — plan is done, Manager has broken it into tasks.
- [ ] **In progress** — Coder is building.
- [ ] **In review** — Reviewer is checking the work.
- [ ] **Awaiting approval** — blocked on a human (see `tasks.md` → NEEDS HUMAN APPROVAL).
- [x] **Shipped** — done and accepted.

## Notes

The original quote-demo scope (`GET /quote` + `index.html`) shipped 2026-07-07. A small follow-on increment — a `GET /random-fact` endpoint on `quote-demo/server.js`, reusing the `/quote` pattern — was scoped, built, QA-passed, and review-passed, and **shipped 2026-07-07** (backend only; wiring `index.html` to the new endpoint was explicitly out of scope and remains a possible future increment). See `context/plan.md` and the Done task in `context/tasks.md`.
