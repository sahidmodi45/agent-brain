# 2026-07-03 — Coder — status.json generator, pre-commit hook, verification

## Task

Built the three Manager-specified tasks for the `status.json` feature from
`context/tasks.md` (added 2026-07-03):

1. Generator script (`scripts/update-status.js`)
2. Git pre-commit hook + docs (`scripts/git-hooks/pre-commit`, `scripts/git-hooks/README.md`)
3. Verification testing and decision logging

## What I built

- **`scripts/update-status.js`** — Node.js, built-ins only (`fs`, `path`).
  Reads `context/project.md`, looks for exactly one `- [x]` among six
  hardcoded known phase labels (Planning, Delegated, In progress, In
  review, Awaiting approval, Shipped), maps to a lowercase-hyphenated
  slug, and writes `status.json` at the repo root as
  `{ "phase": "<slug>", "last_updated": "<ISO-8601 UTC>" }`. On 0-checked,
  2+-checked, or an unreadable/unparsable `project.md`, it prints a clear
  error to stderr, exits 1, and does not touch `status.json`.

- **`scripts/git-hooks/pre-commit`** — POSIX `sh`. Runs the generator via
  `node`; on success, `git add`s the resulting `status.json`; on failure,
  aborts the commit (propagates the generator's exit code and prints its
  own message on top of the generator's stderr output).

- **`scripts/git-hooks/README.md`** — explains why the hook lives in
  `scripts/git-hooks/` instead of `.git/hooks/` (the latter isn't
  version-controlled), documents the one-time
  `git config core.hooksPath scripts/git-hooks` setup, and how to verify
  it's active.

- Ran `git config core.hooksPath scripts/git-hooks` in this working
  directory — confirmed live via `git config core.hooksPath`.

## Verification performed

- Ran the generator against all six valid phase states (toggled one at a
  time via a scratch helper script, never hand-edited beyond that): each
  produced the correct slug (`planning`, `delegated`, `in-progress`,
  `in-review`, `awaiting-approval`, `shipped`) in `status.json`.
- Ran it with 0 boxes checked: exit 1, clear stderr message, `status.json`
  confirmed byte-for-byte unchanged via md5 before/after.
- Ran it with 2 boxes checked (Planning + Delegated): exit 1, clear
  message naming both, `status.json` unchanged (md5-verified).
- Confirmed `status.json` is valid JSON via `JSON.parse` and contains
  both `phase` and `last_updated` as strings.
- Restored `context/project.md` to its exact pre-test byte content after
  the toggling tests (md5 `c42c11e417918d8be24b11b7a5b46efb` matched
  before and after).
- Verified the pre-commit hook's success path by invoking
  `sh scripts/git-hooks/pre-commit` directly (not via `git commit` — see
  note below): it ran the generator and staged `status.json`
  (`git status` showed `A  status.json`).

## Deviation from the Manager's task spec — flagging for Reviewer/Manager

The Manager's "Verification testing" task (Test 3) calls for an
end-to-end test via an actual `git commit`. This build's instructions
explicitly said not to commit or push ("the human will handle that at
the very end"). I honored that and instead invoked
`scripts/git-hooks/pre-commit` directly to verify its logic, rather than
running it through a real commit. This verifies the hook script's own
behavior correctly, but does not prove the git wiring
(`core.hooksPath` → hook actually firing on `git commit`) end-to-end.
The Reviewer or a human should do one real test commit to close that
out fully before calling the pre-commit-hook task fully done.

## State changes to the shared brain

- `context/project.md`: phase marker moved from "Delegated" (its state at
  the start of this session, itself an uncommitted change already sitting
  in the working tree before I started) to "In review" — the honest state
  now that the build is done and awaiting the Reviewer.
- `context/tasks.md`: all three tasks moved from "To do" → "In progress"
  (at start) → "In review" (at end), with notes on what to check.
- `context/decisions.md`: new entry appended at the bottom recording the
  sync mechanism, language, slug convention, and file-tracking decision.
  Nothing above the new entry was edited.
- `status.json` (new, tracked): currently reflects
  `{ "phase": "in-review", "last_updated": "<time of last generator run>" }`.

## Explicitly not done

- No commit was created. The working tree has staged/unstaged changes
  (including a staged `status.json` from the manual hook-script test) for
  the human to review and commit.
- No real `git commit` was run to test the hook end-to-end (see deviation
  note above).
