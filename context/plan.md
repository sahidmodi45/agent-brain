# Plan

_Owned by the Planner. This is the current thinking on how we get from the goal to done. If it changes, add a revision-history line — don't quietly overwrite._

> **Supersedes:** the previous plan on this page (the full `quote-demo` build — `server.js` with `GET /` and `GET /quote`, plus `index.html`). That work shipped 2026-07-07 and is recorded in `context/tasks.md` → Done and `logs/2026-07-04-coder-quote-demo.md`. This is a small follow-on increment to the same project, not a new project — the demo's existing constraints and shape carry forward unchanged.

## Goal

Add a second endpoint, `GET /random-fact`, to the already-shipped `quote-demo/server.js`. It should reuse the exact same pattern the existing `GET /quote` endpoint already uses: a small hardcoded in-memory list, pick one entry at random, return it as JSON. This is explicitly a tiny, additive change to one file — not a rewrite, not a redesign, and not (unless the Manager decides otherwise per the open question below) a frontend change.

## Approach

1. **Where it goes.** Everything happens inside the existing `quote-demo/server.js`. No new files, no new folder, no `package.json`. This mirrors how `/quote` was added — same file, same conventions, same request handler.

2. **Data.** Add a second hardcoded constant array, e.g. `FACTS`, sitting alongside the existing `QUOTES` array near the top of the file. Small list, similar size to `QUOTES` (8-10 entries), each entry a plain string (a "fact" doesn't naturally carry an `author` field the way a quote does — see Open Questions #1 for the response-shape call this implies).

3. **Route.** Add one more branch to the existing `if (req.method === 'GET' && urlPath === '/quote') { ... }` chain in the request handler: a `GET /random-fact` branch that picks a random entry from `FACTS` (same `Math.floor(Math.random() * arr.length)` approach already used for `/quote`) and calls the existing `sendJSON(res, 200, ...)` helper — reusing that helper as-is rather than writing a second JSON-response code path.

4. **Everything else stays untouched.** `GET /`, `GET /quote`, the 404 fallback, `PORT`, `sendJSON`, `send404`, `serveIndex` — none of this changes. The diff should be additive: one new constant, one new `if` branch. If the Coder finds themselves touching the existing `/quote` branch or the routing structure itself, that's a signal the change has grown past what was scoped here.

5. **Frontend.** Out of scope for this task as scoped (see Open Questions #2) — `index.html` is not touched. The goal as given only asks for the endpoint.

6. **Verification before this is considered done.**
   - `node -c quote-demo/server.js` passes (also auto-enforced by the repo's `PostToolUse` syntax-check hook).
   - Server starts without throwing.
   - The pre-existing routes are unaffected: `GET /` still renders the page, `GET /quote` still returns a valid `{ text, author }` quote, unknown routes/methods still return a clean 404.
   - `GET /random-fact` returns a `200` with valid JSON, and repeated calls return varying entries from the list (not always the same one) — same variety check the original `/quote` verification used.
   - Confirm no new `require()`s were added beyond Node built-ins, and no `package.json`/`node_modules` appeared.

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

- **No external dependencies.** Only Node built-in modules (`http`, `fs`, `path`). Still true, unchanged — no new `require()` targets, no `package.json`.
- **No database, no persistence.** `FACTS`, like `QUOTES`, is a hardcoded in-memory array inside `server.js`. Nothing new is read from or written to disk.
- **Additive, not a rewrite.** The task is one new constant array plus one new `if` branch reusing the existing `sendJSON` helper. The existing `/`, `/quote`, and 404 behavior must not change. This is the constraint that most distinguishes this task from the original build: last time the whole file was new; this time almost all of it is a diff against something already shipped and reviewed.
- **Scope isolation.** Unchanged from the original plan: stays inside `quote-demo/` in the `agent-brain` repo. Must not touch `projects/pors` or `pors-analytics` (separate codebases, home-directory `CLAUDE.md`) and must not touch this repo's own tooling (`scripts/`, `.claude/`, `context/` outside the planning docs).
- **Port unchanged.** Still port **4000** (see prior decision) — this task has no reason to touch `PORT`.
- **Repo syntax gate.** The repo's `PostToolUse` hook runs `node --check` on any `.js` file written or edited. `server.js` must still parse cleanly after the edit.
- **Standard repo rules apply.** `context/decisions.md` and `logs/` remain append-only; log this increment once shipped.

## Open questions

None of the below need human sign-off — all are low-stakes, reversible implementation defaults, flagged so the Manager doesn't have to guess.

1. **JSON response shape for a fact.** A quote naturally has two fields (`text`, `author`); a "fact" doesn't have an obvious second field. Planner default: respond with a single-key JSON object, `{ "fact": "<string>" }`, keeping the response an object (not a bare string) for consistency with `/quote`'s object shape and for forward compatibility if a field is ever added. Manager/Coder can pick a different key name, but should keep it an object rather than a bare JSON string.
2. **Frontend integration.** The goal as stated is backend-only ("add a `GET /random-fact` endpoint... reusing the same pattern"), with no mention of wiring it into `index.html`. Planner default: **out of scope for this task** — `index.html` is not touched, no new button, no new fetch call. If the human/Manager actually wants a "random fact" button on the page too, that's a distinct, equally small follow-on task, not implied by this goal as worded. Flagging so it isn't silently assumed either way.
3. **Fact content.** Defaulted to 8-10 short, generic hardcoded trivia-style strings invented by the Coder, same spirit as the original quote list. No sourcing/accuracy requirement for a demo like this.
4. **Naming of the new constant/variable.** Defaulted to `FACTS` for the array, mirroring `QUOTES`. Purely cosmetic — Coder can rename without it being a plan deviation.

## Revision history

- _2026-07-04_ — Replaced the (shipped) status.json plan with a new plan for the quote-demo project: a dependency-free Node `http` server with `GET /quote` (random quote JSON from a hardcoded list) plus a static `index.html` that fetches and displays a quote with a "get another" button. New folder `quote-demo/` proposed as the location; open questions on folder placement, port number, quote content, and single-vs-split frontend files flagged as low-stakes defaults, not blockers.
- _2026-07-07_ — Original quote-demo (`server.js` + `index.html`) shipped; this page's Goal/Approach/Constraints/Open questions were rewritten (not the revision history) to scope a new, small follow-on: adding a `GET /random-fact` endpoint to the existing `server.js`, reusing the `/quote` pattern exactly (hardcoded list, random pick, `sendJSON`). Scoped as additive-only — no changes to existing routes, no frontend changes (flagged as an explicit open question, not assumed). New open question added on the JSON response shape for a fact, since a fact has no natural second field the way a quote has `author`.
