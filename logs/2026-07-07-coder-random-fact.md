# 2026-07-07 — Coder: Add GET /random-fact endpoint

## What I built

Purely additive change to `quote-demo/server.js` (no other files touched):

1. A new hardcoded constant array `FACTS` (10 short, generic plain-string trivia facts), placed right after `QUOTES` and before `INDEX_PATH`, mirroring the existing `QUOTES` array's position and style.
2. One new routing branch, `GET /random-fact`, added directly after the existing `GET /quote` branch in the request handler. It picks a random entry from `FACTS` with the same `Math.floor(Math.random() * arr.length)` pattern `/quote` already uses, and calls the existing `sendJSON(res, 200, { fact })` helper unmodified.
3. Updated the route-list comment at the top of the file to mention the new route (comment-only change, no behavior).

Full diff:

```diff
--- a/quote-demo/server.js
+++ b/quote-demo/server.js
@@ -4,8 +4,9 @@
 // Uses only Node built-ins: http, fs, path.
 //
 // Routes:
-//   GET /       -> serves index.html (text/html)
-//   GET /quote  -> returns a random quote as JSON: { text, author }
+//   GET /             -> serves index.html (text/html)
+//   GET /quote        -> returns a random quote as JSON: { text, author }
+//   GET /random-fact  -> returns a random fact as JSON: { fact }
 //   anything else -> 404, plain text, no crash
 
 const http = require('http');
@@ -27,6 +28,19 @@ const QUOTES = [
   { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
 ];
 
+const FACTS = [
+  'Honey never spoils if stored properly.',
+  'A group of flamingos is called a "flamboyance."',
+  'Octopuses have three hearts.',
+  'Bananas are berries, but strawberries are not.',
+  'The Eiffel Tower can be over 15 cm taller during summer due to heat expansion.',
+  'A day on Venus is longer than a year on Venus.',
+  'Sea otters hold hands while sleeping so they don\'t drift apart.',
+  'The shortest war in history lasted about 38 minutes.',
+  'There are more possible chess games than atoms in the observable universe.',
+  'Sharks existed before trees appeared on Earth.',
+];
+
 const INDEX_PATH = path.join(__dirname, 'index.html');
 
 function sendJSON(res, statusCode, obj) {
@@ -81,6 +95,12 @@ const server = http.createServer((req, res) => {
     return;
   }
 
+  if (req.method === 'GET' && urlPath === '/random-fact') {
+    const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
+    sendJSON(res, 200, { fact });
+    return;
+  }
+
   send404(res);
 });
```

No new `require()`s, no new files, no changes to `PORT`, `sendJSON`, `send404`, `serveIndex`, the `/` route, the `/quote` route, or the 404 fallback. `quote-demo/index.html` was not touched (out of scope per plan, confirmed).

## Verification (real runs, not just reading the code)

1. `node -c quote-demo/server.js` — passed.
2. Checked port 4000 was free before starting (`netstat -ano | findstr :4000` — nothing listening).
3. Started the server (`node quote-demo/server.js`, backgrounded) — logged `Server running at http://localhost:4000` to stdout, confirmed via the redirected log file.
4. Hit every route with real HTTP requests (`curl`) against the live server:
   - `GET /` → `200`, `Content-Type: text/html` — unchanged.
   - `GET /quote` → `200`, `application/json`, valid `{text, author}` shape.
   - `GET /random-fact` → `200`, `application/json`, valid `{fact: "<string>"}` shape.
   - `GET /nonexistent` → `404`.
   - `POST /quote` → `404` (method not GET).
   - `POST /random-fact` → `404` (method not GET, confirming the new branch also respects the method check).
   - Server stayed up and kept responding after all of the above — no crash on any input, including the failure-mode requests.
5. **Variety test on `/random-fact`** (same rigor as the original `/quote` verification): 40 repeated `GET /random-fact` requests, deduplicated the responses — all 10 hardcoded facts were returned at least once. Not stuck on one entry.
6. **Regression variety test on `/quote`**: re-ran the same 40-request variety check against `/quote` post-edit — all 10 original quotes still came back, confirming the new branch didn't perturb the existing one (they're two independent `if` blocks, but proved it rather than assumed it).
7. Confirmed only built-in `require()`s remain in the file (`http`, `fs`, `path` — `grep -n "require("` on the file, 3 lines, all built-ins) and that `quote-demo/` still contains only `server.js` and `index.html` — no `package.json`, no `node_modules`.
8. Cleanup: found the listener PID via `netstat -ano | findstr :4000` (state `LISTENING`), killed only that PID with `taskkill /F /PID <pid>`, then confirmed via `netstat` that no `LISTENING` entry remained on port 4000. To be extra sure the port was truly free (not just "no listener visible" but actually bindable), spun up a throwaway one-off `http.createServer(...).listen(4000, ...)` in a disposable `node -e` script — it bound successfully and I immediately closed it. Port 4000 is free for the next agent/human to use.

## Judgment calls made

- Kept `FACTS` as an array of 10 plain strings (matching the plan's default of 8-10, response shape `{fact: "<string>"}`) — no author-equivalent field, per the Planner's open question #1 default.
- Left `index.html` completely untouched — plan's open question #2 explicitly scoped frontend wiring out, so no button/fetch was added there.
- Comment-only edit to the route list at the top of the file (added the `/random-fact` line) — this touches a comment, not logic, so I don't consider it a deviation from "purely additive," but flagging since the task said "purely additive to server.js" and this is technically a one-line comment edit to existing lines rather than a pure append. If the Reviewer wants strictly zero-touch on pre-existing lines, this is the one spot to check — everything else is new lines only.

## Board / phase state

- Moved the task in `context/tasks.md` from To do → In progress → In QA (its next stop is the QA Tester, not the Reviewer, per the current handoff chain: Coder → QA Tester → Reviewer → Manager).
- **Note for whoever owns `context/project.md` (Planner/Manager):** the phase marker there currently reads "Planning" per the 2026-07-07 note for this random-fact follow-on. Since the build is complete and now sitting in QA, the phase should likely move to "Delegated" → "In progress" (or directly to reflect QA/review depending on how granular the Manager wants the marker) — I did not touch `project.md` myself since it isn't the Coder's file to own, flagging it here so the phase marker doesn't go stale.

## Open gaps

None that I'm aware of. Everything in the task's "Done when" list was exercised directly against a live server, including the two out-of-scope boundaries (index.html untouched, existing routes unaffected) which I proved rather than assumed.
