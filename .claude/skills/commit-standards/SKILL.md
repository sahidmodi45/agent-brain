---
name: commit-standards
description: Use when the Coder is about to commit finished work in this repo. Defines what a good commit message looks like here — what changed, why, and any tradeoffs — matching the style already used in this repo's history.
---

# Commit Standards

A commit message explains a change to whoever reads it in six months — usually you. Say what changed, why, and anything non-obvious about how.

## Shape

```
<summary line: imperative, ~50 chars, no trailing period>

<body: what changed and why it changed. Wrap ~72 cols. Use bullets
when several distinct things moved. Call out tradeoffs, constraints,
or anything the diff alone won't explain.>

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```

## Rules

- **Summary is imperative:** "Add review checklist skill," not "Added" or "Adds."
- **Body says why, not just what.** The diff already shows what. Explain the reason and any tradeoff you made — that's the part that gets lost.
- **Note what the field can't enforce.** If you worked around a limitation or left something scoped out on purpose, say so (see the manager subagent commit, where the tools-field path limitation was spelled out).
- **One commit, one coherent change.** Don't bundle unrelated work.
- Keep the `Co-Authored-By` trailer.

## Example (from this repo)

```
Add Claude Code subagents for the four roles

Create .claude/agents/{planner,manager,coder,reviewer}.md with proper
frontmatter: name, a description written as a routing rule, per-role
tools, and model.

- manager (haiku): Read, Edit — prompt enforces edits only to
  context/tasks.md (path scoping isn't expressible in the tools field)
- reviewer (haiku): Read, Grep, Glob — no write/exec, so it can never
  modify code

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```

It names what was added, and — the useful part — records the tradeoff the diff can't show: why the manager's file restriction lives in the prompt instead of the tools field.
