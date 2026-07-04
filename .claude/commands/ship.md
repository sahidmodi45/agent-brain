---
description: Run the next To-do task in context/tasks.md through Manager -> Coder -> Reviewer.
---

Move the next piece of work through the handoff chain. Before anything, read `context/tasks.md` and `context/plan.md` so you know the real state.

Pick the target: the top task in the **To do** section of `context/tasks.md`. If To do is empty but something sits in **In progress** or **In review**, resume that instead. If there is genuinely nothing to ship, say so and stop — don't invent scope.

Then run it through the chain, one role at a time, delegating to each subagent and showing me what changed in the context files at every step:

1. **Manager** — confirm the task is well-formed (its `task-breakdown` skill), sequence it, and mark it In progress. Owns `context/tasks.md` and the phase marker.
2. **Coder** — build the task for real, run it, and move it to In review. It should follow `testing-standards` before handing off and must not commit or take irreversible actions without approval.
3. **Reviewer** — check the work against the plan, the task's definition of done, and `context/decisions.md`, running both `review-checklist` and `security-review`. Read-only: it passes or sends back with `file:line` reasons.

If the Reviewer sends it back, loop it to the Coder with the specific reasons, then re-review. If anything hits something irreversible, costly, or outside the plan, flag it under **NEEDS HUMAN APPROVAL** in `context/tasks.md` and pause.

On a pass, hand back to the Manager to mark the task **Done** and set the phase. Then report the outcome and stop — committing and pushing is a human call unless I say otherwise.

$ARGUMENTS
