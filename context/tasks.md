# Task Board

_Owned by the Manager. This is the single source of truth for who's doing what. If a task isn't on here, it isn't real. Keep it matching reality._

## NEEDS HUMAN APPROVAL

_Anything blocked on a human goes here, at the top, so it's impossible to miss. When a task lands here, work on it stops until the human responds. Each item should say: what's needed, why, and what happens next._

_Nothing awaiting approval right now._

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

(Nothing to do right now.)

## In progress

_Being worked right now. Should have an owner (the Coder)._

<!-- - [ ] Task description — Coder, started YYYY-MM-DD -->

## In review

_Built, waiting on the Reviewer._

(Nothing in review right now.)

## Done

_Finished and accepted by the Manager._

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
