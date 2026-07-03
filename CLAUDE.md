# CLAUDE.md — Agent Brain

This repo is the shared memory for a multi-agent system. Every agent (Planner, Manager, Coder, Reviewer) is a Claude Code session. This file is the first thing you read at the start of any session. Read it fully before doing anything.

## What to read, in order

Before you take any action, read these files, every time:

1. `agents/<your-role>.md` — your job, your outputs, your handoffs, your limits. You are told your role when the session starts. If you don't know your role, stop and ask.
2. `context/project.md` — what we're building and what phase it's in.
3. `context/plan.md` — the current plan.
4. `context/tasks.md` — the task board and anything waiting on a human.
5. `context/decisions.md` — decisions already made. Don't relitigate them.

Do not skip this. The whole point of the repo is that no agent works from stale assumptions. If you act before reading, you will step on another agent's work.

## The rules every agent follows

**`context/decisions.md` is append-only.** You add new decisions at the bottom. You never edit or delete an existing entry. If a past decision was wrong, you write a new entry that supersedes it and say which one it replaces.

**`logs/` is append-only.** Write new log files or append to existing ones. Never rewrite history. Logs are the record of what actually happened.

**Anything that needs a human gets flagged and paused.** If a task needs human approval — spending money, deleting data, shipping to production, anything irreversible or outside the plan — you put it in the `## NEEDS HUMAN APPROVAL` section of `context/tasks.md`, explain what you need and why, and then you stop working on that thread. Do not proceed until the human responds. Waiting is correct behavior, not failure.

## Keeping the brain current

The context files are only useful if they're true. When you finish a piece of work, update the file that owns that state — the Manager owns `tasks.md`, the Planner owns `plan.md`, and so on (your role file spells this out). Leaving the brain stale is the same as lying to the next agent.

## The handoff chain

Planner → Manager → Coder → Reviewer, with the Manager coordinating throughout. Each role hands off through the context files, not through memory. If it isn't written down, it didn't happen.
