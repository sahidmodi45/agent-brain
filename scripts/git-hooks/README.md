# Git hooks for agent-brain

This directory holds the source for repo-managed git hooks. Git's default
hooks directory (`.git/hooks/`) is **not** version-controlled, so the
scripts live here instead and are wired in via a one-time local config
step. This keeps the mechanism itself "written down," per this repo's own
philosophy of not relying on invisible local state.

## What the `pre-commit` hook does

Before every commit, it:

1. Runs `node scripts/update-status.js`, which regenerates `status.json`
   at the repo root from whichever phase is currently checked in
   `context/project.md`.
2. If the generator succeeds, stages the resulting `status.json` so it's
   included in the commit that's about to happen.
3. If the generator fails (for example, zero or more than one phase
   checkbox is checked in `context/project.md`), the hook **aborts the
   commit** and prints the generator's error message.

This guarantees `status.json` is correct as of every commit made in this
working directory. It does not guarantee correctness for an uncommitted,
in-progress edit to `context/project.md` — run
`node scripts/update-status.js` by hand at any time if you want to check
the current state before committing.

## One-time setup

Each local working directory needs to point git at this hooks folder once
(this setting is per-clone/per-working-directory, not per-repo, since
`.git/config` isn't tracked):

```sh
git config core.hooksPath scripts/git-hooks
```

Run this from the repo root. After this, git will use the hooks in
`scripts/git-hooks/` instead of `.git/hooks/` for every commit made in
this working directory, from now on — no per-commit action needed.

## Verifying it's active

1. Confirm the config took effect:

   ```sh
   git config core.hooksPath
   # should print: scripts/git-hooks
   ```

2. Make a trivial change to a tracked file and attempt a commit. You
   should see the generator's success line
   (`status.json updated: phase="...", last_updated="..."`) printed
   during the commit, and `status.json` should appear in the commit's
   diff (staged automatically by the hook) even if you didn't `git add`
   it yourself.

3. To verify the failure path, temporarily uncheck every phase box (or
   check two) in `context/project.md`, stage some change, and attempt a
   commit — it should be aborted with a clear error and `status.json`
   should not be modified. Restore `context/project.md` afterward.

## Platform notes

The hook is a POSIX `sh` script. Git for Windows ships its own bundled
`sh` and runs hooks through it regardless of your interactive shell
(PowerShell, cmd, bash), so this works unmodified on Windows, macOS, and
Linux checkouts of this repo.
