# Plan

_Owned by the Planner. This is the current thinking on how we get from the goal to done. If it changes, add a revision-history line — don't quietly overwrite._

> **Supersedes:** the previous plan on this page (the `GET /random-fact` follow-on). That work shipped 2026-07-07 and is recorded in `context/tasks.md` → Done and `logs/2026-07-04-coder-quote-demo.md`. This is a new, small increment to the same `quote-demo` project — the existing constraints and shape carry forward unchanged except where explicitly extended below.

## Goal

Let a visitor to `quote-demo`'s page leave feedback: a simple free-text comment box on `index.html` that posts to a new server endpoint. The server acknowledges the submission but does **not** durably store it — nothing is written to a database or a file, and nothing submitted is retrievable later or survives a server restart. This is a deliberate, human-confirmed choice (see `context/decisions.md`, 2026-07-07): the standing "no database, no persistence" constraint on this project is being kept, not relaxed.

This goal arrived as the one-line "let users leave feedback somehow," which was ambiguous on three foundational points — which product, what "feedback" means, and whether it needs persistence. The Planner paused and asked rather than guessing (see the 2026-07-07 lessons-learned entry, which exists precisely because this exact goal was mishandled once already). All three were answered by the human:
1. **Product:** `quote-demo` (not `projects/pors`).
2. **Feedback type:** a simple free-text comment box — not per-item reactions, not star ratings, not a routed report form.
3. **Persistence:** none. Explicitly not a database, not a file. Ephemeral acknowledgment only (optionally console-logged server-side for demo visibility).

## Approach

1. **Where it goes.** Everything happens inside the two existing `quote-demo` files: `server.js` (new endpoint) and `index.html` (new form + script). No new files, no new folder, no `package.json` — same zero-dependency shape as the rest of the project.

2. **Server: new `POST /feedback` endpoint.**
   - Add one new `if` branch to the existing routing chain: `req.method === 'POST' && urlPath === '/feedback'`.
   - Since this is the first route in the project that needs a request *body*, it needs new body-reading logic that doesn't exist yet (`req.on('data' / 'end')`, accumulating chunks, built-ins only — no `body-parser`, no framework). This is new code, not a reuse of an existing helper the way `/random-fact` reused `sendJSON` — flagging this so the Manager/Coder don't expect a one-line addition the way the last increment was.
   - Expected request shape: JSON body, e.g. `{ "comment": "<string>" }` (exact field name is a Coder call — see Open Questions).
   - Validation: reject with `400` if the body isn't valid JSON, if the `comment` field is missing, or if it's empty/whitespace-only after trimming. Cap the accepted body size (e.g. ~10KB) and reject anything larger with `400`/`413` rather than buffering an unbounded stream — cheap protection against a trivial oversized-payload footgun, worth having even in a toy demo.
   - On success: respond `200` with a small JSON acknowledgment (e.g. `{ "status": "received" }`) via the existing `sendJSON` helper. Optionally `console.log` the received comment server-side — acceptable per the human's decision, since stdout isn't a queryable store the app exposes and doesn't survive/retrieve state across restarts the way a DB or file would.
   - **No storage.** Do not add an in-memory array, object, file write, or any other mechanism that makes a past submission retrievable by a later request. The comment is read, (optionally) logged, and forgotten. If a future task wants to list past feedback, that's a persistence decision that goes back to the human — it is explicitly not this task.
   - Any other method/path combination (including `GET /feedback`) continues to fall through to the existing 404 catch-all, unchanged — no special-casing needed.

3. **Frontend: comment box on `index.html`.**
   - Add new markup (new lines only) inside the existing `.card` div: a `<textarea>` for the comment, a submit button, and a small status/acknowledgment paragraph — all new elements, not modifications to the existing quote/author/button markup.
   - Add new CSS rules (new lines appended within the existing `<style>` block, or a second block — Coder's call) for the new elements, styled consistently with the existing card aesthetic. Do not edit the existing selectors.
   - Add new JavaScript: a submit handler that reads the textarea, does a basic non-empty check client-side (nice-to-have, not the authority — the server's `400` is the real validation), `fetch('/feedback', { method: 'POST', ... })` with a JSON body, and on response shows the acknowledgment message and clears the textarea; on failure, shows an inline error instead of failing silently. This can be a second `<script>` block appended after the existing one, or new functions/listeners appended within it — either way, the existing `loadQuote`/button-click code must not be touched.
   - The comment box is independent of the currently displayed quote/fact — it is not tied to "feedback on this specific quote." That's the simplest reading of the goal as given; a per-item reaction is a different, already-rejected feature (see Goal, point 2).

4. **Additive-only boundary, explicitly scoped (per the 2026-07-07 decision on what "additive-only" means).** The diff to both existing files should be pure line-addition: no existing line in `server.js` or `index.html` is modified. **One explicit exception, called out here rather than left to slip in silently:** updating `server.js`'s header comment (the route list at the top of the file) to document the new `POST /feedback` route is *in scope* for this task, matching the precedent set for `/random-fact`. Any other edit to an existing line (in either file) is out of scope and should come back as its own explicitly-scoped follow-up rather than being folded in.

5. **Verification before this is considered done.**
   - `node -c quote-demo/server.js` passes (also auto-enforced by the repo's `PostToolUse` syntax-check hook).
   - Server starts without throwing; existing routes are unaffected — `GET /` still renders the page, `GET /quote` and `GET /random-fact` still return their expected JSON, unknown routes/methods (including `GET /feedback`) still return a clean 404.
   - `POST /feedback` with a valid non-empty `comment` returns `200` and a JSON acknowledgment.
   - `POST /feedback` with a missing field, empty/whitespace-only comment, or malformed JSON body returns `400` (not a crash, not a hang).
   - `POST /feedback` with an oversized body is rejected cleanly (not a memory blowout, not a crash) — actually push a large payload, don't just eyeball the cap logic.
   - **No-persistence check, done for real, not assumed:** submit feedback, then restart the server and confirm there is no way to retrieve the previously submitted comment through any endpoint; confirm no new file appears anywhere under `quote-demo/` as a result of a submission.
   - Frontend: the submit button is actually exercised end-to-end (submitted in a real or simulated browser context, confirmed the acknowledgment appears and the textarea clears) — not just read in the JS source. Same standard the project's lessons-learned log already set for the original "New quote" button (2026-07-03 entry): a trigger that's supposed to fire on user action gets tested by firing it.
   - Confirm no new `require()`s were added beyond Node built-ins, and no `package.json`/`node_modules` appeared.
   - Confirm the diff to `server.js` and `index.html` is additive-only except for the one explicitly-scoped header-comment update named in point 4.

## Constraints

- **No external dependencies.** Only Node built-ins (`http`, `fs`, `path`) — no body-parsing library, no framework, no new `require()` targets, no `package.json`.
- **No database, no persistence — reaffirmed, not relaxed, for this feature specifically.** This is the load-bearing constraint of this task (see `context/decisions.md`, 2026-07-07). A submitted comment is acknowledged and may be console-logged, but must not be retrievable by any request, must not survive a restart, and must not be written to any file or database.
- **Additive-only,** with the single explicitly-scoped exception named above (the `server.js` header comment). Everything else in both existing files stays untouched — this is what most distinguishes "additive" from "rewrite" per the standing decision on the topic.
- **Scope isolation.** Stays inside `quote-demo/` in the `agent-brain` repo. Must not touch `projects/pors` or `pors-analytics`, and must not touch this repo's own tooling (`scripts/`, `.claude/`, `context/` outside the planning docs).
- **Port unchanged.** Still port **4000** — no reason to touch `PORT`.
- **Repo syntax gate.** The repo's `PostToolUse` hook runs `node --check` on any `.js` file written or edited; `server.js` must still parse cleanly.
- **Standard repo rules apply.** `context/decisions.md` and `logs/` remain append-only; log this increment once shipped.

## Open questions

None of the below need human sign-off — the foundational calls (product, feedback type, persistence) are already made by the human. These are low-stakes, reversible implementation details, flagged so the Manager/Coder don't have to guess and so the Reviewer knows they're deliberate defaults, not oversights.

1. **Exact request/response field names.** Planner default: request body `{ "comment": "<string>" }`, success response `{ "status": "received" }` (or similarly small ack shape). Coder can rename either without it being a plan deviation.
2. **Console-logging the received comment.** Planner default: yes, `console.log` the trimmed comment text server-side on receipt — purely for demo visibility while the server is running, not a form of storage (nothing is written anywhere, and this doesn't make a past submission retrievable via any request). Coder can omit this if they'd rather keep stdout clean; either is fine.
3. **Body-size cap.** Planner default: reject bodies over roughly 10KB. Exact threshold is a judgment call, not a hard requirement — the point is "don't buffer an unbounded body," not a specific number.
4. **Placement/copy on the page.** Where exactly the comment box sits relative to the existing quote card, and the exact wording of the acknowledgment/error messages, are cosmetic and left to the Coder.
5. **Client-side empty-comment guard.** Planner default: a light client-side check (e.g. disable submit on empty/whitespace) is a nice-to-have UX touch, but the server's `400` is the actual authority on validation — the client-side check is not required for correctness.

## Revision history

- _2026-07-04_ — Replaced the (shipped) status.json plan with a new plan for the quote-demo project: a dependency-free Node `http` server with `GET /quote` (random quote JSON from a hardcoded list) plus a static `index.html` that fetches and displays a quote with a "get another" button. New folder `quote-demo/` proposed as the location; open questions on folder placement, port number, quote content, and single-vs-split frontend files flagged as low-stakes defaults, not blockers.
- _2026-07-07_ — Original quote-demo (`server.js` + `index.html`) shipped; this page's Goal/Approach/Constraints/Open questions were rewritten (not the revision history) to scope a new, small follow-on: adding a `GET /random-fact` endpoint to the existing `server.js`, reusing the `/quote` pattern exactly (hardcoded list, random pick, `sendJSON`). Scoped as additive-only — no changes to existing routes, no frontend changes (flagged as an explicit open question, not assumed). New open question added on the JSON response shape for a fact, since a fact has no natural second field the way a quote has `author`.
- _2026-07-07 (later same day)_ — New goal arrived: "let users leave feedback somehow." Recognized as foundationally ambiguous (product, feedback type, and persistence were all undetermined, and one live reading would have narrowed a standing constraint), so the Planner paused and put the three questions to the human via `context/tasks.md` → NEEDS HUMAN APPROVAL instead of defaulting silently. Human answered same day: product is `quote-demo`, feedback is a free-text comment box, and persistence is explicitly declined — the no-DB/no-file constraint stands. This page's Goal/Approach/Constraints/Open questions were rewritten to scope that increment: a new `POST /feedback` endpoint on `server.js` (new body-parsing logic, validation, size cap, no storage) plus a new comment box on `index.html`, both additive except for one explicitly-scoped exception (the `server.js` header comment, matching the precedent and rule set by the 2026-07-07 "additive-only" decision). `context/tasks.md`'s blocking item was resolved and removed; `context/project.md`'s phase moved back to Planning; the human's constraint decision was logged in `context/decisions.md`.
