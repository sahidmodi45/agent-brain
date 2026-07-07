# Project Overview

_One place to see what we're building and where it stands. Keep this true — the Manager owns the phase checklist, the Planner owns the overview._

## What this is

A tiny local demo, unrelated to the (now-shipped) `status.json` project: a Node HTTP server built with only built-in modules, exposing a `GET /quote` endpoint (random quote) and a `GET /random-fact` endpoint (random fact), plus a plain `index.html` page that fetches `/quote` and displays it, with a button to get another. No external dependencies, no database, no build step. Extended 2026-07-07 with a free-text feedback comment box (`POST /feedback` endpoint plus a comment form on `index.html`) — see `context/plan.md`. Persistence stays out of scope for this project; the feedback feature is explicitly ephemeral (no DB, no file) per human decision.

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

A new goal — "let users leave feedback somehow" — arrived 2026-07-07 while the project was already Shipped. It was under-specified enough (which product, what "feedback" means, whether it needs persistence) that the Planner paused and asked the human rather than guessing; all three questions were answered the same day (see `context/decisions.md`). The increment — a free-text `POST /feedback` endpoint (ephemeral, no persistence) plus a comment box on `index.html` — was then scoped, built, QA-passed, and review-passed, and **shipped 2026-07-07**. One open human-only item remains, tracked in the Done task in `context/tasks.md`: physically clicking "Submit feedback" in a real browser to confirm the on-page DOM behavior (same category of gap as the original "New quote" button, which a human closed on 2026-07-07). Everything else was verified end-to-end at runtime.
