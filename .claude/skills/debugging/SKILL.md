---
name: debugging
description: Use when the Coder hits a failure — a crash, wrong output, a failing test, or "it doesn't work." Enforces a systematic approach (reproduce, isolate, check the obvious first) instead of random guess-and-check.
---

# Debugging

A bug is a gap between what you believe the code does and what it actually does. You close it by observing, not by guessing. Random edits until it works aren't a fix — they're a new bug you haven't found yet.

## The order

1. **Reproduce it first.** You cannot fix what you can't trigger on demand. Find the exact input, state, or command that makes it fail every time. If it's intermittent, that's the first thing to pin down — a fix you can't verify isn't a fix.
2. **Isolate the smallest failing case.** Strip away everything that still fails. Delete inputs, comment out code, hardcode values until you have the minimal thing that breaks. The bug is usually obvious once it has nowhere to hide.
3. **Check the obvious before the exotic.** Typos, wrong variable, off-by-one, wrong type (string vs. number, `null` vs. `undefined`), stale cache, wrong file, didn't save, didn't restart. Ninety percent of bugs live here. Rule these out before you theorize about a framework bug or a race condition.
4. **Read the actual error.** The message and the stack trace name the file and line. Read them literally before inventing a theory that ignores them.
5. **Change one thing at a time.** Form a hypothesis, make one change, observe. If it didn't help, revert it before trying the next. Stacking blind edits means you won't know what fixed it — or what you just broke.

## Don't

- Don't guess-and-check randomly. Every change should test a specific hypothesis.
- Don't assume something exotic (compiler bug, "the library is broken") until you've ruled out your own code. It's almost always your own code.
- Don't declare it fixed without reproducing the original failure and confirming it's gone. Run the exact repro from step 1.

## When you're truly stuck

Explain the problem out loud, line by line, to no one. State what you expect each line to do. The wrong assumption usually surfaces the moment you say it. If it still doesn't, you've probably been trusting something you never verified — go check it.
