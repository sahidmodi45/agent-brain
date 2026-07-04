---
name: testing-standards
description: Use when the Coder is about to hand work to the Reviewer, or is deciding whether a change is tested enough. Defines what "adequately tested" means here so half-tested work doesn't reach review.
---

# Testing Standards

"It ran once on my machine" is not tested. Before you move a task to In review, the work has to survive more than the path you happened to try.

## The bar

For anything beyond trivial, cover three cases:

1. **Happy path.** The normal, expected input produces the expected result. This is the minimum, not the finish line.
2. **At least one edge case.** The boundary where behavior changes — empty input, a single item, the max, zero, the first/last element, a duplicate. Edge cases are where correct-looking code quietly breaks.
3. **At least one failure case.** Bad input is handled the way you claim it is. If the spec says it fails loudly on missing input, prove it exits non-zero and doesn't corrupt state — don't just assume it.

## What "trivial" means

A pure rename, a comment, a constant tweak, a config value — no logic, no branches. If the change has a branch, a loop, parsing, or touches state, it isn't trivial. When in doubt, it isn't trivial.

## How to test here

This repo has no test framework by default, and that's fine — a test can be a script you run and observe, not a suite. The standard is *did you actually exercise these cases and watch the result*, not *is there a `.test.js` file*. (See `logs/2026-07-03-coder-status-json.md`: the generator was driven through all six valid states plus 0-checked and 2-checked failures, with output verified each time — that's what adequate looks like.)

## Before you hand off

- State in the task notes which cases you ran and what you observed. "Tested" without specifics is unverifiable.
- If you couldn't test something end-to-end, say so plainly and say why — don't let the Reviewer discover the gap. (The hook that could only be tested by direct invocation, not a real commit, was flagged, not hidden — that's the standard.)
