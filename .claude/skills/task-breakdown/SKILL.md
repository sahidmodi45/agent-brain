---
name: task-breakdown
description: Use when the Manager is turning a plan into tasks on context/tasks.md, or when a task is about to be handed to the Coder. Checks that each task is well-formed before it ships — clear definition of done, explicit dependencies, no ambiguity about what "finished" means.
---

# Task Breakdown

A task is ready for the Coder only when someone else could pick it up and know exactly when they're done. If you have to be in your head to understand it, it isn't ready.

## What every task needs

1. **A definition of done.** State the observable result, not the activity. "Returns 200 with `{status:"ok"}`" — not "work on the health route." If done can't be checked, it isn't defined.
2. **Explicit dependencies.** Name what must land first. If the task can start now, say "no dependencies" so it's clear you checked.
3. **No ambiguity.** One task, one outcome. If a word could mean two things ("update the config" — which keys?), pin it down or split it.
4. **Scoped to one sitting.** If it needs three unrelated changes, it's three tasks. Big fuzzy tasks hide their own edge cases.

If you can't write a clean definition of done, the gap is in the plan — send it back to the Planner, don't paper over it.

## "Additive-only" is a real boundary — spell it out

When a task should only *add* to an existing file and leave what's there alone, say **"additive-only"** (or "purely additive") in the scope — and know what it commits the Coder to: new lines only, no edits to existing lines, comments and formatting included (the 2026-07-07 decision in `context/decisions.md`). If some existing line genuinely has to change — a header comment goes stale, a constant needs a new value — scope that as its own named change rather than letting it ride along silently under an "additive" task. The Reviewer send-backs any unscoped in-place edit under an additive-only task, so a fuzzy "just add X" that quietly also rewrites existing lines will bounce. Be explicit up front and it won't.

## Bad

```
- [ ] Add auth to the API
```

No definition of done (which routes? what auth?), no dependencies, ambiguous scope. The Coder has to guess and will guess wrong.

## Good

```
- [ ] Require a valid session on all /api/ops/* routes.
      Done when: an unauthenticated request to any /api/ops/* route
      returns 401, and an authenticated ops session still gets 200.
      Depends on: session middleware task (done).
      Out of scope: /api/client/* routes — separate task.
```

Observable done condition, stated dependency, and an explicit boundary so scope can't creep.
