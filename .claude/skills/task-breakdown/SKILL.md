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
