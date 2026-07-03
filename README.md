# Agent Brain

Shared memory for a multi-agent system. Four Claude Code agents — **Planner**, **Manager**, **Coder**, and **Reviewer** — work on the same project without talking to each other directly. They coordinate by reading and writing the files in this repo. The files *are* the shared brain.

The idea: no agent works from memory or assumption. Everything that matters — the plan, the tasks, the decisions, what actually happened — is written down here, so every session starts from the same truth.

## How it fits together

```
CLAUDE.md          ← every agent reads this first
agents/            ← one file per role: what that agent does and doesn't do
context/           ← the live state of the project
  project.md         current overview + phase checklist
  plan.md            the Planner's plan
  tasks.md           the Manager's task board (+ human-approval flags)
  decisions.md       append-only log of decisions made
logs/              ← append-only record of what happened
```

## The flow

1. **Planner** takes a goal and writes `context/plan.md` — goal, approach, constraints, open questions.
2. **Manager** breaks that plan into tasks on `context/tasks.md` and hands them out.
3. **Coder** builds the tasks and marks them ready for review.
4. **Reviewer** checks the work against the plan and the decisions, then passes it or sends it back.

The Manager coordinates the whole loop. Handoffs happen through the context files — if it isn't written down, it didn't happen.

## Two hard rules

- **`context/decisions.md` and `logs/` are append-only.** You add to them; you never rewrite them. A wrong decision gets superseded by a new entry, not erased.
- **Anything needing a human pauses.** If work hits something irreversible, costly, or outside the plan, the agent flags it in the `NEEDS HUMAN APPROVAL` section of `context/tasks.md` and stops until the human responds.

## Starting a session

Tell the agent its role. It reads `CLAUDE.md`, then `agents/<role>.md`, then the four `context/` files, and only then starts working.
