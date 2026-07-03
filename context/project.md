# Project Overview

_One place to see what we're building and where it stands. Keep this true — the Manager owns the phase checklist, the Planner owns the overview._

## What this is

Add `status.json` — a machine-readable mirror of the phase currently checked in `context/project.md`. The file contains `{ "phase": "<slug>", "last_updated": "<ISO-8601 UTC timestamp>" }` and stays in sync automatically via a generator script and git pre-commit hook. This enables any tool or human to read the repo's current phase from JSON without parsing markdown, and trust that the file is always up-to-date as of the last commit.

## Current phase

Move the marker as work progresses. Only one phase is "current" at a time.

- [ ] **Planning** — Planner is working out the approach.
- [ ] **Delegated** — plan is done, Manager has broken it into tasks.
- [ ] **In progress** — Coder is building.
- [ ] **In review** — Reviewer is checking the work.
- [ ] **Awaiting approval** — blocked on a human (see `tasks.md` → NEEDS HUMAN APPROVAL).
- [x] **Shipped** — done and accepted.

## Notes

<!-- Anything about the project as a whole that doesn't fit the plan or the task board. -->
