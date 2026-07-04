---
description: Kick off the Planner on a new goal. Usage: /plan <the goal in plain words>
---

A new goal has come in. Start the planning stage of the multi-agent flow.

Delegate to the `planner` subagent. Hand it the goal below verbatim and tell it to:

- Read `CLAUDE.md`, then `agents/planner.md`, then the four `context/` files and `.claude/skills/lessons-learned/SKILL.md`, before doing anything (per the read-order).
- Write a real plan into `context/plan.md` — goal, approach, constraints, open questions — and stop there. It does not write code, create tasks, or review.
- Surface any genuine question it needs a human to answer at the top of its response instead of guessing; relay those back to me.
- Set the `context/project.md` phase to **Planning** while it works, and advance it to **Delegated** on handoff.

When it finishes, show me exactly what changed in `context/plan.md` and `context/project.md`.

The goal:

$ARGUMENTS
