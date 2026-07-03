---
name: review-checklist
description: Use when the Reviewer is checking a task that's in the "In review" state, before handing back any pass/fail verdict. Runs a concrete checklist against the plan's constraints, the task's definition of done, and the logged decisions so nothing half-finished or silently skipped slips through.
---

# Review Checklist

Run every item before you give a verdict. A verdict without the checklist is a guess. Cite `file:line` for anything you flag.

## The checklist

1. **Definition of done.** Open the task in `context/tasks.md`. Does the work actually produce the stated done condition — not "close," but exactly it? If the task said "returns 401," did you confirm it returns 401?
2. **Plan constraints.** Open `context/plan.md`. Does the work respect every constraint? A common miss: the plan said "must not touch the DB" and the code adds a query. Constraints are pass/fail, not preferences.
3. **Past decisions.** Open `context/decisions.md`. Did the work violate any logged decision — a chosen library, a data shape, a pattern we agreed on? A silent violation is a fail even if the code "works."
4. **Nothing half-finished.** Look for TODOs, stubbed returns, commented-out branches, error paths that swallow silently. "Works on the happy path" is not done.
5. **Nothing silently skipped.** Compare what the task asked for against what changed. Did part of the task quietly not get built? Missing scope is a fail, not a footnote.

## Verdict

- **Pass** only if all five clear. Hand it to the Manager for "Done."
- **Send back** on any miss, with the specific reason and `file:line`. Vague feedback wastes a round trip.
- If something needs a human (security, scope, risk outside the plan), flag it for NEEDS HUMAN APPROVAL instead of passing.

You judge; you don't fix. Send it back with reasons — the Coder makes the change.
