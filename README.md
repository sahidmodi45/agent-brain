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

## Automatic syntax gate

Every time an agent writes or edits a file, a `PostToolUse` hook runs
`scripts/check-file.js` on just that file:

- `.js` / `.cjs` / `.mjs` → `node --check` (does it parse?)
- `.json` → `JSON.parse` (is it valid JSON?)
- anything else → skipped.

The repo has no build tooling, so "lint" here means "does it parse" —
enough to catch a stray brace or a trailing comma before it reaches the
Reviewer. If the check fails, the hook exits non-zero and hands the error
back to the agent to fix; on anything it doesn't know how to check, it
stays silent. It's wired up in `.claude/settings.json` and aimed at the
Coder (the only role that writes code), but it runs harmlessly after any
edit since it only acts on `.js`/`.json`.

## Starting a session

Tell the agent its role. It reads `CLAUDE.md`, then `agents/<role>.md`, then the four `context/` files, and only then starts working.

## Walkthrough: one task, start to finish

Say the human wants: *"Add a `/health` endpoint that returns 200 OK."* Here's how that moves through the brain. Each step, watch which file changes.

**1. Planner session.** Reads its role file and the context. The project is empty, so it writes `context/plan.md`:

```
## Goal
Expose a /health endpoint so uptime checks have something to hit.

## Approach
Add a GET /health route that returns 200 with a small JSON body.
No auth, no DB call — it must stay cheap enough to poll every few seconds.

## Constraints
- Existing Express app; follow the current route style.
- Must not touch the DB (a health check that hits the DB isn't a health check).

## Open questions
- Should the body include a version string? (minor — Manager can decide)
```

It sets `context/project.md` phase to **Planning → Delegated** and hands off.

**2. Manager session.** Reads the plan, breaks it into a task on `context/tasks.md`:

```
## To do
- [ ] Add GET /health route returning 200 + {"status":"ok"} — added by Manager 2026-07-03
```

It answers the minor open question itself (no version string for now) and logs that call in `context/decisions.md` as a new entry. Phase → **In progress**. Hands the task to the Coder.

**3. Coder session.** Moves the task to **In progress**, writes the route, then to **In review**. Drops a line in `logs/2026-07-03-coder.md`: *"Added /health, returns `{status:'ok'}`, no DB touch. Tested with curl → 200."* No new decisions needed.

**4. Reviewer session.** Checks the code against the plan and the decision log. The route matches the "no DB" constraint and the "no version string" decision — it passes. Notes the verdict in `logs/2026-07-03-reviewer.md` and hands back to the Manager, who marks the task **Done** and sets the project phase to **Shipped**.

### Where a human would step in

Suppose the Coder realized the health check needed a new production environment variable set on the live server. That's outside the plan and touches production — so instead of doing it, the Coder adds to the top of `context/tasks.md`:

```
## NEEDS HUMAN APPROVAL
- **Set HEALTHCHECK_TOKEN on the prod server** — flagged by Coder on 2026-07-03.
  Why it needs a human: changes production config.
  Waiting on: go-ahead + the token value.
  Status: PAUSED.
```

Then it stops. Nothing else on that thread moves until the human replies. That pause is the system working as designed — not a stall.
