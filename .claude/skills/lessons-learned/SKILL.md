---
name: lessons-learned
description: Use at the START of every task, in every role (Planner, Manager, Coder, Reviewer) — read the log below before you begin so you don't repeat a mistake we already paid for. After finishing a task, append any hard-won insight from a real mistake or discovery.
---

# Lessons Learned

The compounding memory of the whole system. Every role reads this before starting work and may add to it after. Unlike the context files, this is **not** scoped to one project — it carries across every project this system ever runs. A lesson recorded once should never have to be relearned.

## How to use it

- **Read the log first.** Before you plan, break down, build, or review, skim the entries below. If one applies to what you're about to do, act on it.
- **Append after a real lesson — nothing else.** Add an entry only when you learned something the hard way: a mistake that cost a round trip, a wrong assumption that broke something, a non-obvious discovery about how this system behaves. Not generic advice. Not "remember to test." If it would fit in any engineering blog, it doesn't belong here.
- **The bar:** could a future agent, on a totally different project, avoid a real mistake because you wrote this? If not, don't add it.

## Entry format

Append to the bottom. Keep each entry to a few lines: dated, specific, and about *what to do differently*, not just what happened.

```
### YYYY-MM-DD — <short title> (<role that learned it>)
<What went wrong or was discovered, in one or two sentences.>
**Do differently:** <the concrete change in behavior for next time.>
```

---

<!-- New lessons go below, newest at the bottom. Append only; don't edit past entries. -->

### 2026-07-03 — A hook tested by direct invocation isn't tested (Reviewer)
The Coder verified a git pre-commit hook by running the hook script directly (`sh scripts/git-hooks/pre-commit`). That proves the script's logic but not that git actually *invokes* it on `git commit` — a separate thing (depends on `core.hooksPath`, file location, exec bit). The Reviewer caught the gap and sent it back.
**Do differently:** For anything that's supposed to fire automatically (git hooks, cron, CI, event handlers), test the trigger end-to-end, not just the handler in isolation. "I ran the script" ≠ "the system runs the script."
