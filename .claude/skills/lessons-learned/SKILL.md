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

### 2026-07-07 — Why the QA Tester role exists (system change)
Twice now, "verification" meant checking the work against the plan on paper, and the one thing nobody could do inside the build environment was independently *run* the software and try to break it. On the quote-demo, the Coder honestly flagged that it couldn't click the button in a real browser, the Reviewer's compliance pass couldn't close that either, and a **human** had to be the one to actually exercise it. That's the gap: a build can match the plan exactly and still fail the moment a real input hits it, and "does it work" was falling between the Coder (who can't impartially test their own work) and the Reviewer (who checks compliance, not runtime behavior). So we added a fifth role, the **QA Tester**, between Coder and Reviewer — it runs the built thing for real, pushes inputs nobody planned for, and confirms failure modes fail gracefully. It also spot-checks the other agents' own output, since the same "looks fine on paper" blind spot applies to vague plans, ambiguous tasks, and rubber-stamped reviews.
**Do differently:** Treat "matches the plan" and "actually works when run" as two separate gates, and don't let a build reach Done until something *other than its author* has run it against an unplanned input. If you're the QA Tester, the whole point of you is the case nobody wrote a task for.

### 2026-07-07 — A vague goal is a question, not a blank check to guess (Planner)
Given the deliberately under-specified goal "let users leave feedback somehow," the Planner didn't ask anything — it silently decided *what feedback even was* (free-text vs. reactions), and quietly narrowed the project's documented "no persistence" constraint to add in-memory storage, filing both under "Open Questions" as low-stakes defaults and handing over a finished plan. The human wanted to be asked; instead the plan was built on a stack of the Planner's own guesses about the core of the feature. The pause bar was scoped only to irreversible/costly/production actions, so anything "cheap to change later" sailed through — even a decision that determined what was being built.
**Do differently:** Separate *reversible details* (default them, note them, move on) from *foundational ambiguity* — what the feature fundamentally is, or a default that breaks a stated constraint/decision. The second kind is the human's call: stop and ask before writing the plan, don't bury it in Open Questions. The test for any role, not just the Planner: would a good employee handed this one sentence start building, or turn around and ask? If a person would ask, ask — "I picked a reasonable default" is the wrong instinct when the default decides what the thing is.
