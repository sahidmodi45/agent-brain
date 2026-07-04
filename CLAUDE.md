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

## How the roles are wired up

Each role exists in two places. The `agents/*.md` files are the plain-English description for humans reading the repo. The real, executable versions live under `.claude/`:

- **Subagents** — `.claude/agents/{planner,manager,coder,reviewer}.md`. These are the actual Claude Code subagents, each with its own model, tool access, and a description that tells Claude when to delegate to it. The tool limits are real guardrails: the Manager can only edit, the Reviewer is read-only (Read/Grep/Glob — it can never modify code), the Coder has Bash, the Planner writes plans. When you're running as a role, you *are* the matching subagent.
- **Skills** — `.claude/skills/*/SKILL.md`, each triggered automatically when its situation comes up:
  - `task-breakdown` (Manager) — what makes a task well-formed before it goes to the Coder.
  - `review-checklist` (Reviewer) — the pass to run before giving any verdict.
  - `security-review` (Reviewer) — a focused security pass to run alongside the review checklist.
  - `commit-standards` (Coder) — what a good commit message looks like in this repo.
  - `debugging` (Coder) — the systematic approach when something breaks.
  - `fullstack-web-dev` (Coder) — baseline conventions for building websites and APIs.
  - `testing-standards` (Coder) — what "adequately tested" means before handing off to review.
  - `lessons-learned` (all roles) — the system's compounding memory: read it at the start of every task, append a hard-won insight after. Unlike the context files, it carries across every project, not just this repo.

You don't need to load these by hand — the subagent is selected when the session is delegated, and the skills fire on their triggers. This section is just so you know they exist and where to look.
