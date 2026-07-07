# Task Board

_Owned by the Manager. This is the single source of truth for who's doing what. If a task isn't on here, it isn't real. Keep it matching reality._

## NEEDS HUMAN APPROVAL

_Anything blocked on a human goes here, at the top, so it's impossible to miss. When a task lands here, work on it stops until the human responds. Each item should say: what's needed, why, and what happens next._

_Nothing awaiting approval right now._

_(Resolved 2026-07-07: the "let users leave feedback somehow" item that was here was answered by the human — product is `quote-demo`, feedback means a free-text comment box, and persistence is explicitly out — no database, no file, nothing retrievable after the fact. See `context/plan.md` and the 2026-07-07 entry in `context/decisions.md`.)_

<!--
Template:
- **[what needs deciding]** — flagged by <role> on YYYY-MM-DD.
  Why it needs a human: <reason — irreversible / costs money / production / outside the plan>.
  Waiting on: <the specific question or go-ahead>.
  Status: PAUSED.
-->

---

## To do

_Ready to be picked up, in priority order._

_Nothing to do right now — the feedback task below moved through In progress straight to In QA._

<!--
Task template — every task carries these fields, and the two verdicts travel with the task down the board:
- [ ] <one-line title, imperative>.
      Done when: <observable, checkable result — not an activity>.
      Depends on: <what must land first, or "no dependencies">.
      Out of scope: <explicit boundary, if any>.
      Model: <omit for the Sonnet default; note "Opus — <why>" if it's a genuinely hard task>.
      QA: <pending → filled in by the QA Tester: PASS, or FAIL with exact repro steps, on YYYY-MM-DD. Answers "does it actually work at runtime".>
      Review: <pending → filled in by the Reviewer: PASS, or SEND-BACK with file:line, on YYYY-MM-DD. Answers "does it match the plan and follow the rules".>

QA and Review are separate lines on purpose: a task can pass one and fail the other. Both must read PASS before the Manager moves a task to Done.
-->

## In progress

_Being worked right now. Should have an owner (the Coder)._

(Nothing in progress right now.)

## In QA

_Built, waiting on the QA Tester to prove it actually works at runtime — real runs, unplanned inputs, graceful failure. The task's `QA:` line gets filled in here before it moves on._

(Nothing in QA right now.)

## In review

_Passed QA, waiting on the Reviewer's compliance check against the plan, the definition of done, and the logged decisions. The task's `Review:` line gets filled in here._

(Nothing in review right now.)

## Done

_Finished and accepted by the Manager._

- [x] **Implement POST /feedback endpoint and comment box for quote-demo** — built by Coder 2026-07-07, QA PASS 2026-07-07, Review PASS 2026-07-07
  - **What was built:**
    - `quote-demo/server.js`: new `POST /feedback` route branch (added after the `/random-fact` branch, before the 404 fallthrough). Reads the body via `req.on('data'/'end')` with a running byte count, cap of 10KB (`MAX_FEEDBACK_BYTES`) enforced by destroying the request and returning 400 the moment the cap is exceeded (no unbounded buffering). On `end`, parses JSON (400 on parse failure), requires `comment` to be a string that's non-empty after `.trim()` (400 otherwise), `console.log`s the trimmed comment for demo visibility only, and responds 200 `{"status":"received"}` via the existing `sendJSON` helper. Added a `req.on('error', ...)` handler for connection-level errors. Header comment (the routes list at the top of the file) updated with one new line documenting `POST /feedback` — the single pre-approved exception to additive-only, matching the `/random-fact` precedent.
    - `quote-demo/index.html`: new `.feedback-section` block appended inside the existing `.card` div (textarea + submit button + status paragraph), new CSS rules appended inside the existing `<style>` block (no existing selectors touched), and new JS appended inside the existing `<script>` block after `loadQuote()` (a `submitFeedback()` handler wired to the new button's click event — existing `loadQuote`/button code untouched).
    - Diff confirmed via `git diff --stat`: 142 insertions, 0 deletions across both files.
  - **Verification performed (all 10 definition-of-done items):**
    1. `node -c quote-demo/server.js` → passed.
    2. Started the server; `GET /` → 200, `GET /quote` → 200 valid JSON, `GET /random-fact` → 200 valid JSON, `GET /nonexistent` → 404, `GET /feedback` (wrong method) → 404. Server stayed up through the entire session.
    3. `POST /feedback` with `{"comment":"This demo is great!"}` → 200 `{"status":"received"}`.
    4. Missing field (`{}`), empty string (`{"comment":""}`), whitespace-only (`{"comment":"   \t  "}`) → all 400 with a descriptive `error` message.
    5. Malformed JSON (`{comment: not valid json`) → 400 `{"error":"Malformed JSON body"}`.
    6. Pushed a real 20,014-byte JSON payload against the 10KB cap → 400 `{"error":"Request body too large"}`; confirmed the server was still responsive immediately after (`GET /quote` → 200).
    7. **No-persistence, done for real:** submitted a comment with a unique probe string, confirmed no new file appeared in `quote-demo/` as a result. Killed the server process (found its PID via `netstat`, `taskkill /F`), restarted it fresh. Post-restart: directory contains only `index.html` and `server.js` (nothing new), `GET /feedback` returns 404 (no retrieval route exists), the served `GET /` HTML contains zero occurrences of the probe string, and `GET /quote` still works. Confirms no retrieval path and no restart-survival.
    8. **Frontend — flagged gap, not blocking:** no GUI browser is available in this environment; gap deferred to human (see Accepted note below). Coder drove the exact `fetch('/feedback')` path via real HTTP requests, cross-checked JS logic against server responses, and confirmed behavior. All paths validated.
    9. Confirmed only `require('http')`, `require('fs')`, `require('path')` in `server.js`; no `package.json` or `node_modules` anywhere in `quote-demo/`.
    10. `git diff --stat` shows 142 insertions(+), 0 deletions across `server.js` and `index.html`. Only pre-existing touch: header-comment insertion (one new line added within the existing routes list) — the pre-approved exception.
  - **Cleanup:** server process killed, port 4000 confirmed clear, test artifacts deleted. `git status --short quote-demo/` shows only `server.js` and `index.html` as modified.
  - QA: PASS (2026-07-07) — ran it at runtime, full validation battery, exact-byte body-cap boundary check, independent no-persistence proof (probe + restart + grep), type-confusion and __proto__ inputs handled, regression on existing routes clean.
  - Review: PASS (2026-07-07) — all 6 checklist items + security pass. Additive-only verified (142 insertions, 0 deletions; only the pre-approved header-comment line touched). No-persistence and validation confirmed. No security issues.
  - **Accepted note:** All gates cleared. One open human-only item, not a blocker: **physical browser-click verification of the feedback form.** No safe GUI browser is available in this environment. The button's code path was validated end-to-end via HTTP probing and JS logic inspection at runtime; no code defect. This gap matches the original quote-button gap (logged 2026-07-04), which was closed by human manual verification. Deferred to human: run the server, load `http://localhost:4000/`, type a comment, click "Submit feedback," confirm the acknowledgment appears and textarea clears. No code changes required.
  - **Intended phase change for context/project.md:** Planning → Shipped (work complete, all gates cleared; human reserves the final ship/commit decision).

- [x] **Add GET /random-fact endpoint to quote-demo/server.js** — built by Coder 2026-07-07, QA PASS 2026-07-07, Review PASS 2026-07-07
  - Added hardcoded `FACTS` array (10 entries) and new `if` branch for `GET /random-fact` handler, reusing existing `sendJSON` helper. Diff is purely additive; no changes to existing routes or structure.
  - QA: PASS (2026-07-07) — ran at runtime, regression-checked existing routes (`GET /`, `GET /quote`, 404s), pushed unplanned inputs (`POST /random-fact`, non-existent routes), no breaks. Confirmed variety across repeated calls; no new dependencies or artifacts.
  - Review: PASS (2026-07-07) — meets definition of done, respects all plan constraints (additive-only, reuses helpers as-is, no frontend changes, single-file edit), clean security pass. Noted one in-scope documentation edit (server.js comment header updated to document the new route).
  - **Intended phase change for context/project.md:** Planning → Shipped (work complete, all gates cleared; human reserves the final ship/commit decision).
- [x] **Implement status.json generator script** — done 2026-07-03
  - `scripts/update-status.js` (Node.js, built-ins only). Reviewer confirmed correct: robust regex over the six known checkboxes, fails loudly on 0/2+ checked, no deps.
- [x] **Implement and document git pre-commit hook infrastructure** — done 2026-07-03
  - `scripts/git-hooks/pre-commit` + `README.md`; `core.hooksPath` set live in this working directory. Reviewer confirmed correct.
- [x] **Verification testing and decision logging** — done 2026-07-03
  - All 6 valid states + both invalid states verified by Coder; decision logged. Reviewer's one blocker (an end-to-end test via a real `git commit`, not just direct hook invocation) was **closed by the shipping commit itself**: committing the "In review → Shipped" phase change fired the hook, which regenerated `status.json` to `shipped` and staged it into the same commit — exactly plan.md §5 item 3.
- [x] **Implement quote-demo server (server.js)** — built by Coder 2026-07-04, Reviewer PASS 2026-07-07
  - Built `quote-demo/server.js`: Node HTTP server, built-ins only (`http`, `fs`, `path`). `GET /` serves `index.html` (`text/html`); `GET /quote` returns a random entry from a hardcoded 10-quote array as JSON (`{text, author}`); all other routes/methods return a clean `404 text/plain` without crashing. Listens on port 4000, logs `Server running at http://localhost:4000` on startup.
  - Verified for real: `node -c` syntax check passed; server booted and logged the startup line; `GET /` returned 200/text-html/correct body; `GET /quote` returned valid `{text, author}` JSON (shape-checked programmatically) with confirmed variety across repeated real requests; `GET /nonexistent` and `POST /quote` both returned clean 404s with the server staying up afterward; confirmed only built-in `require()`s and no `package.json`/`node_modules` anywhere in `quote-demo/`. Full detail in `logs/2026-07-04-coder-quote-demo.md`.
  - No open gaps on this task.
- [x] **Implement quote-demo frontend (index.html) and end-to-end verification** — built by Coder 2026-07-04, Reviewer PASS 2026-07-07
  - Built `quote-demo/index.html`: static page, inline CSS, inline `<script>`. `loadQuote()` runs on page load and is re-run by the "New quote" button; both paths call the same `fetch('/quote')` logic and render `text`/`author` into the page. No dependencies.
  - Verified for real (not just by reading the code): drove the exact code path the button triggers by issuing real, repeated HTTP `GET /quote` requests against the running server the way the browser's `fetch` would — confirmed varied, correctly-shaped JSON came back every time (40-request run hit all 10 hardcoded quotes at least once). Confirmed the button's click handler and the page-load handler call the identical function, so this server-side proof covers the button's actual behavior.
  - ~~**Residual gap, flagged not hidden:** no GUI browser is available in this environment, so I did not physically click the button and visually watch the on-page text change.~~ **GAP CLOSED 2026-07-07 by human verification:** the human ran the server, loaded `http://localhost:4000/` in a real browser, clicked "New quote", and confirmed the displayed quote changes on each click. No open gaps remain. See the 2026-07-07 entry in `logs/2026-07-04-coder-quote-demo.md`.
