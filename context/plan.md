# Plan

_Owned by the Planner. This is the current thinking on how we get from the goal to done. If it changes, add a revision-history line — don't quietly overwrite._

## Goal

Add a `status.json` file at the repo root that is a machine-readable mirror of the phase currently checked in `context/project.md`. Any tool or human should be able to read `status.json` — without parsing markdown — and get an accurate, up-to-date `phase` plus a `last_updated` timestamp showing when that phase was last confirmed. This is a generic mechanism: it mirrors whatever phase `context/project.md` says is current for whatever project is active, not a one-off snapshot for this particular feature.

## Approach

1. **Define the schema.**
   `status.json` at minimum:
   ```json
   { "phase": "<slug>", "last_updated": "<ISO-8601 UTC timestamp>" }
   ```
   - `phase` is a lowercase, hyphenated slug derived from the bold label of whichever checkbox in `context/project.md`'s phase list is checked. Mapping (fixed default, see Open Questions #1):
     - Planning → `planning`
     - Delegated → `delegated`
     - In progress → `in-progress`
     - In review → `in-review`
     - Awaiting approval → `awaiting-approval`
     - Shipped → `shipped`
   - `last_updated` is the UTC time the generator last ran, ISO-8601 (e.g. `2026-07-03T00:00:00Z`).
   - Additional fields (e.g. `source`, `available_phases`) are allowed later but not required for this goal — keep the first version minimal.

2. **Build a small, standalone generator.**
   A script that:
   - Reads `context/project.md`.
   - Finds the phase checklist block and requires exactly one `- [x]` line among the six known phase bullets.
   - If zero or more than one box is checked, the script fails loudly (non-zero exit, clear error message) and does **not** touch `status.json`. Silent guessing is worse than no file.
   - Writes `status.json` at the repo root with the current phase slug and current UTC timestamp, overwriting any previous content (status.json is fully derived — never hand-edited).
   - Is runnable on demand by any agent or human (`node scripts/update-status.js` or equivalent) so it can be checked at any time, not just at commit time.
   - Default implementation language: Node.js (no existing build tooling in `agent-brain`, but Node is already present on this machine per the sibling PORS project, needs no extra install, and is simple to run from a script on Windows). This is a default the Manager/Coder can override — see Open Questions #2.

3. **Wire it to run automatically so "always" is actually true.**
   Default mechanism: a **git pre-commit hook** that runs the generator and stages the resulting `status.json` before every commit, and **aborts the commit** if the generator errors (ambiguous/missing phase state). Because this repo is a single shared working directory used by all four agent roles (not routinely re-cloned), a one-time local setup is low-friction:
   - Track the hook's source in the repo (e.g. `scripts/git-hooks/pre-commit`) rather than only in the untracked `.git/hooks/` directory, so the mechanism itself is "written down" per this repo's own philosophy.
   - Document a one-time setup step (`git config core.hooksPath scripts/git-hooks`) so the hook is active for every future commit made in this working directory.
   - This guarantees `status.json` is correct as of every commit — the natural unit of durable state in this repo. It does **not** guarantee correctness for an uncommitted, in-progress edit to `context/project.md`; see Open Questions #3 for the trade-off and alternatives.

4. **Bootstrap the source of truth.**
   `context/project.md` currently has **no phase checked at all** ("_No active project yet_"). The generator has nothing valid to read until some phase is marked current. As part of picking this plan up, the Manager should check the appropriate box (likely "Planning", since this very plan is what's in flight) before or alongside the Coder's implementation work, so the first real run of the generator has valid input to parse.

5. **Verification.**
   Before this is considered done, confirm:
   - Running the generator against each of the six possible checked states produces the correct slug.
   - Running it against zero-checked and two-checked states fails loudly and leaves `status.json` untouched (or absent, on first run).
   - Committing a phase change to `context/project.md` (with the hook installed) results in `status.json` being updated and included in the same commit.
   - `status.json` is valid JSON with at least `phase` and `last_updated` present.

6. **Record the mechanism choice.**
   Whoever implements this (Coder, coordinated by Manager) should log the sync-mechanism choice (generator + pre-commit hook, and the language choice) as a new entry in `context/decisions.md` once built, so future agents don't have to re-derive why it works this way.

## Constraints

- `agent-brain` currently has no `package.json`, build step, or existing tooling at the repo root — whatever is added should stay minimal and not introduce a dependency chain for a one-file JSON generator.
- Primary shell is PowerShell on Windows; a Bash tool is also available. Git for Windows is installed (repo is already a git repo). Git hooks run through the bundled `sh` regardless of the user's interactive shell, so a POSIX-style hook script is safe to rely on here.
- `context/decisions.md` and `logs/` are append-only — nothing here should rewrite history in either; the mechanism choice gets logged as a *new* entry, not a rewrite.
- `context/project.md`'s phase checklist format (six specific bold-labeled checkboxes) is the fixed input format for the parser. If that wording or structure changes later, the slug mapping and parser need to change with it — this plan does not ask anyone to change the checklist's current wording.
- `context/project.md` currently has zero phases checked. The generator cannot produce a meaningful first run until the Manager marks a phase current (see Approach #4). This is a real gap that needs closing before/alongside implementation, not a blocker to planning.
- This plan covers producing and keeping `status.json` in sync only. It does not cover building any consumer of the file (dashboard, notification, etc.) — out of scope unless a future goal asks for it.
- Planner does not implement: no script, hook, or `status.json` content is being written as part of this plan. That's Coder work once the Manager breaks this into tasks.

## Open questions

1. **Phase slug naming.** I've defaulted to lowercase-hyphenated slugs derived directly from the existing bold labels (`planning`, `delegated`, `in-progress`, `in-review`, `awaiting-approval`, `shipped`). Low-stakes and reversible — Manager/Coder should confirm this convention rather than invent a different one mid-implementation, but no human sign-off needed.
2. **Generator language.** Defaulted to Node.js for zero extra dependencies and Windows-friendliness. A Python script would work equally well (also present on this machine per `pors-analytics`). Manager can pick either when breaking into tasks; whichever is chosen should be noted in `decisions.md`.
3. **Sync granularity — the core trade-off.** The git pre-commit hook default keeps `status.json` accurate as of every *commit*, not as of every *edit*. Between an edit to `context/project.md` and the next commit, `status.json` can be briefly stale. Alternatives considered and rejected as defaults (but worth knowing about):
   - *Pure manual convention* (edit project.md → immediately run the script by hand, no hook): zero infrastructure, but relies purely on discipline and is the kind of drift this feature exists to prevent.
   - *CI-based regeneration on push*: fully automatic but assumes hosted CI exists for this repo, which is unconfirmed, and adds push-to-fix latency.
   The pre-commit hook is the middle ground I'm defaulting to. If "always" needs to hold even for uncommitted edits, that requires a running watcher process, which isn't realistic for ephemeral agent sessions — flagging this in case the human wants a stronger (or explicitly looser, manual-only) guarantee than commit-time sync.
   - The `.git/hooks/` directory itself isn't version-controlled by default; the plan works around this by tracking the hook source in `scripts/git-hooks/` and requiring a one-time `git config core.hooksPath` setup step, documented so it isn't invisible state.
4. **Tracked vs. generated-only file.** Defaulting to committing `status.json` to the repo (tracked, kept current by the hook) rather than gitignoring it as a purely on-demand artifact, since "always reflects" reads more naturally as "a file that's there and correct" than "a file you have to remember to generate before trusting it."
5. **Schema surface.** Keeping the schema to just `phase` and `last_updated` for v1, per the stated minimum. Nothing stops extending it later (e.g. `available_phases`, `source`) if a future goal needs it — not doing so now to avoid over-building.

None of the above rose to the level of needing human approval under this repo's rules (nothing here is irreversible, costs money, touches production, or falls outside the stated goal) — they're ordinary implementation defaults, made explicit so the Manager doesn't have to guess what I meant, and flagged so a human can override any of them before work starts if they'd prefer differently.

## Revision history

- _2026-07-03_ — Initial plan created: generator script (default Node.js) + git pre-commit hook (default sync mechanism) to keep `status.json` mirroring `context/project.md`'s checked phase; open questions on slug naming, language, sync granularity, and file tracking flagged for Manager/human but not blocking handoff.
