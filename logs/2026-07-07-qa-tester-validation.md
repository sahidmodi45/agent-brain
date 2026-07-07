# 2026-07-07 — QA Tester — role validated against the quote-demo build

## Why this run happened

The QA Tester is a newly added fifth role (see the 2026-07-07 commit adding
`.claude/agents/qa-tester.md`). This was a dry-run to confirm the new subagent
actually invokes, can execute code at runtime, and behaves within its guardrails —
not a re-review of the quote-demo, which is already Done and accepted. Read-and-run
only: nothing under `quote-demo/`, `context/tasks.md`, or `context/project.md` was
touched.

## What was validated

- **Subagent invokes and runs code.** The `qa-tester` subagent started for real,
  ran ~17 tool calls, launched a live process, and drove it with real HTTP requests.
- **Guardrails held.** No `Write`/`Edit` used; nothing in the Done section was
  modified. Cleanup was precise: it identified the actual listener on port 4000 by
  PID via `netstat` (PID 51284), killed only that process, and confirmed the port
  was free afterward — no unrelated node processes touched.

## What it did to the build (quote-demo/server.js)

- Boot: `node quote-demo/server.js` logged `Server running at http://localhost:4000`.
- Happy path: `GET /` → 200 HTML; `GET /quote` ×8 → valid `{text, author}` JSON,
  5 distinct quotes across 8 calls (real variety).
- Unplanned inputs, all handled gracefully (clean 404, no crash, server stayed up):
  unexpected query params (`?foo=bar&count=99999`), wrong methods
  (POST/PUT/DELETE/HEAD/OPTIONS), unknown routes, trailing/double slash, case
  variants, 5000-char path, malformed raw-socket request, `%00`-encoded path.
- Liveness: no stack trace in captured stdout/stderr at any point; server kept
  answering `/quote` after every adversarial batch.

## The point worth recording: it went beyond what was asked

The prompt listed empty/garbage query params, wrong methods, and unknown routes.
The QA Tester **independently added two categories nobody asked for**:

- **Path traversal** — `GET /../../../etc/passwd`, percent-encoded `%2e%2e`, and
  `%00` injection. All returned 404, and it explained *why* it's safe: `req.url` is
  only string-compared, never passed to `fs`/`path.join`, so there's no traversal
  surface.
- **Concurrency** — 20 parallel `GET /quote` requests; all returned 200 with no
  crash or dropped connections.

This is exactly the behavior the role exists for — probing the cases nobody wrote a
task for — so it's logged here as evidence the role does what it was designed to do,
not just that it ran.

## Verdict

QA PASS. No FAIL conditions, no silent-wrong responses. The fifth role is wired up
and functioning end-to-end. Independent runtime observation matched the Coder/Reviewer
claims already recorded in the Done section — no discrepancy.
