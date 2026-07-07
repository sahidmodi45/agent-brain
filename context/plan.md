# Plan

_Owned by the Planner. This is the current thinking on how we get from the goal to done. If it changes, add a revision-history line — don't quietly overwrite._

> **Supersedes:** the previous plan on this page (the `status.json` phase-mirror feature). That project shipped on 2026-07-03 and is recorded in `context/decisions.md`. This is a new, unrelated project starting fresh.

## Goal

Build a tiny, fully self-contained local demo: a Node HTTP server exposing one `GET /quote` endpoint that returns a random quote (from a small hardcoded list) as JSON, plus a plain `index.html` page that fetches `/quote` on load and displays the quote, with a button to fetch another. The point is a minimal, dependency-free, no-database reference example — not a production app.

## Approach

1. **Location.** Add a new, self-contained folder `quote-demo/` at the root of the `agent-brain` repo (sibling to `context/`, `scripts/`, `agents/`), containing just two files: `server.js` and `index.html`. This keeps the demo isolated from the repo's own tooling (`scripts/`) and from the unrelated `projects/pors` / `pors-analytics` codebases in the home directory.

2. **Server (`quote-demo/server.js`).**
   - Built with only Node's built-in `http` module (plus `fs`/`path` to read `index.html` off disk). No `express`, no router library, no npm install, no `package.json` needed at all — run directly with `node server.js`.
   - Hardcode a small list (8-10 entries) of quote objects, shape `{ text: string, author: string }`, as a constant array in `server.js`. No file, no DB.
   - Manual routing on `req.method` + `req.url`:
     - `GET /` → read and serve `index.html` with `Content-Type: text/html`.
     - `GET /quote` → pick one random entry from the hardcoded array (`Math.random()`), respond `200` with `Content-Type: application/json` and the single quote object as JSON.
     - Anything else → `404` with a small plain-text or JSON body. Server must not crash on unknown routes/methods.
   - Listen on a fixed port, log `Server running at http://localhost:<port>` to the console on startup so a human knows it's up.

3. **Frontend (`quote-demo/index.html`).**
   - Single static HTML file, plain `<script>` in-page (no build step, no framework, no separate JS file needed for something this small — though a separate `app.js` is an acceptable equivalent if the Coder prefers it, as long as it's still zero-dependency).
   - On page load: `fetch('/quote')`, then render `text` and `author` into the page.
   - A "New quote" button that re-runs the same fetch and re-renders on click.
   - Minimal inline styling only — enough to be legible, not a design deliverable.

4. **How it's run.** `node quote-demo/server.js`, then open `http://localhost:<port>/` in a browser. No install step of any kind. A short `quote-demo/README.md` (one command + one URL) is a nice-to-have for discoverability but is not required scope — Manager's call whether to include it.

5. **Verification before this is considered done.**
   - `node -c quote-demo/server.js` passes (and the repo's own `PostToolUse` syntax-check hook will already enforce this on write/edit).
   - Server actually starts (`node quote-demo/server.js`) without throwing.
   - `GET /` in a browser renders the page, not raw HTML source or a 404.
   - `GET /quote` (via browser devtools, `curl`, or equivalent) returns valid JSON shaped `{ text, author }`, and repeated calls return varying entries from the list (not always the same one).
   - The "New quote" button is actually exercised end-to-end (clicked in a real or simulated browser context and confirmed the displayed text changes) — not just eyeballed in the JS source. This project's own lessons-learned log (`.claude/skills/lessons-learned/SKILL.md`, 2026-07-03 entry) is explicit that a trigger that's supposed to fire on user action must be tested by firing it, not just by reading the code that would fire it.
   - Confirm `server.js` only ever `require()`s Node built-ins (`http`, `fs`, `path` — no third-party names), and no `package.json`/`node_modules` was introduced.
   - Hitting an undefined route/method returns a clean 404 rather than crashing the process.

## Constraints

- **No external dependencies.** Only Node built-in modules (`http`, `fs`, `path`, optionally `url`). No `express`, no `node-fetch`, no npm packages, no `package.json` required.
- **No database, no persistence.** The quote list lives as a hardcoded in-memory array inside `server.js`. Nothing is read from or written to disk except serving the static `index.html`.
- **No build step for the frontend.** `index.html` is served as-is; no bundler, no transpiler, no framework.
- **Scope isolation.** This is a new, unrelated demo project living inside the `agent-brain` repo (`quote-demo/`). It must not touch `projects/pors` or `pors-analytics` (separate codebases in the home directory, described in the home `CLAUDE.md`, governed by their own conventions) and must not touch this repo's own tooling (`scripts/`, `.claude/`, `context/` outside of the planning docs themselves).
- **Port collision awareness.** PORS (an unrelated app on this machine) defaults to port 3000. Since both could plausibly be running at once on this machine, this demo should default to a different port (Planner default: **4000** — see Open Questions).
- **Repo syntax gate.** The repo's `PostToolUse` hook runs `node --check` on any `.js` file written or edited (see `README.md` → "Automatic syntax gate"). `server.js` must parse cleanly; this is effectively enforced automatically as the Coder writes it, not just a manual verification step.
- **Standard repo rules apply.** `context/decisions.md` and `logs/` remain append-only; the Manager/Coder log this build once shipped, same as the status.json project did.

## Open questions

None of the below need human sign-off — all are low-stakes, reversible implementation defaults, made explicit so the Manager doesn't have to guess. Flagging them rather than silently deciding, per this repo's rules.

1. **Folder location.** Defaulted to a new top-level `quote-demo/` folder in `agent-brain`. Alternative would be putting it somewhere under `projects/` in the home directory alongside PORS, but the goal describes a throwaway demo, not a piece of an existing product, and `agent-brain` is the working repo for this system's own build-outs (the status.json feature was also built directly into this repo). Manager can relocate if they disagree.
2. **Port number.** Defaulted to **4000** specifically to avoid colliding with PORS's documented default of 3000, in case both are run on this machine at the same time. Trivially changeable by editing one constant in `server.js`.
3. **Quote count/content.** Defaulted to 8-10 generic hardcoded quotes (text + author) invented by the Coder — the goal doesn't specify content, only that the list be "small" and "hardcoded." No sourcing/attribution accuracy requirement implied for a demo like this.
4. **Single-file vs. split frontend JS.** Defaulted to inline `<script>` inside `index.html` for true minimalism (matches "one Node server + one index.html" framing in the goal). A separate `app.js` is an acceptable equivalent if the Coder finds it cleaner — either is fine as long as no dependency is added.
5. **README for the demo.** Defaulted to including a short `quote-demo/README.md` (run command + URL) as a nice-to-have, not required scope. Manager can drop it to keep the footprint to exactly the two files the goal names.

## Revision history

- _2026-07-04_ — Replaced the (shipped) status.json plan with a new plan for the quote-demo project: a dependency-free Node `http` server with `GET /quote` (random quote JSON from a hardcoded list) plus a static `index.html` that fetches and displays a quote with a "get another" button. New folder `quote-demo/` proposed as the location; open questions on folder placement, port number, quote content, and single-vs-split frontend files flagged as low-stakes defaults, not blockers.
