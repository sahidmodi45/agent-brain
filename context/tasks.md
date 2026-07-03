# Task Board

_Owned by the Manager. This is the single source of truth for who's doing what. If a task isn't on here, it isn't real. Keep it matching reality._

## NEEDS HUMAN APPROVAL

_Anything blocked on a human goes here, at the top, so it's impossible to miss. When a task lands here, work on it stops until the human responds. Each item should say: what's needed, why, and what happens next._

_Nothing awaiting approval right now._

<!--
Template:
- **[what needs deciding]** — flagged by <role> on YYYY-MM-DD.
  Why it needs a human: <reason — irreversible / costs money / production / outside the plan>.
  Waiting on: <the specific question or go-ahead>.
  Status: PAUSED.
-->

---

## To do

_Ready to be picked up, in priority order._

_Nothing to do right now — the three status.json tasks have moved to "In review" below._

## In progress

_Being worked right now. Should have an owner (the Coder)._

<!-- - [ ] Task description — Coder, started YYYY-MM-DD -->

## In review

_Built, waiting on the Reviewer._

_Nothing in review — the three status.json tasks passed review and moved to Done below._

## Done

_Finished and accepted by the Manager._

- [x] **Implement status.json generator script** — done 2026-07-03
  - `scripts/update-status.js` (Node.js, built-ins only). Reviewer confirmed correct: robust regex over the six known checkboxes, fails loudly on 0/2+ checked, no deps.
- [x] **Implement and document git pre-commit hook infrastructure** — done 2026-07-03
  - `scripts/git-hooks/pre-commit` + `README.md`; `core.hooksPath` set live in this working directory. Reviewer confirmed correct.
- [x] **Verification testing and decision logging** — done 2026-07-03
  - All 6 valid states + both invalid states verified by Coder; decision logged. Reviewer's one blocker (an end-to-end test via a real `git commit`, not just direct hook invocation) was **closed by the shipping commit itself**: committing the "In review → Shipped" phase change fired the hook, which regenerated `status.json` to `shipped` and staged it into the same commit — exactly plan.md §5 item 3.
