---
name: functional-verification
description: Use when the QA Tester is verifying a built task before it goes to the Reviewer's compliance check. Defines what "actually verified" means here — run it for real, push at least one input nobody planned for, and confirm failure modes fail gracefully instead of crashing or silently returning garbage. Read-and-run, never fix.
---

# Functional Verification

"It matches the plan" is the Reviewer's question. Yours is narrower and harder to fake: **does it actually work when you run it, including on inputs nobody planned for.** Reading the code doesn't count. Trusting the Coder's log doesn't count. You run it yourself.

## What "actually verified" means

1. **Run it for real.** Start the server, call the endpoint, invoke the script, drive the exact path a user would. Observe the real output — not what the code *should* return, what it *did* return. If you can't run it, that's a finding, not a pass.
2. **Try at least one input nobody planned for.** The task and the tests cover the cases someone thought of. Your value is the ones they didn't: empty, missing, huge, malformed, the wrong type, a negative, a duplicate, the boundary value, a second concurrent call. One unplanned input, minimum — more if the surface is bigger.
3. **Confirm failure modes fail gracefully.** Feed it the bad input and watch *how* it breaks. A clean, loud failure (non-zero exit, clear error, no state touched) is a pass. A crash, a hang, a stack trace to the user, corrupted state, or — worst — a silently wrong answer that looks fine is a fail. Silent-wrong is the most dangerous outcome there is; hunt for it specifically.
4. **Record exact reproduction steps.** Every finding gets the precise command or input, the expected result, and the actual result — enough that the Coder reproduces it on the first try. A bug report you can't reproduce from is noise.

## You run and probe; you never fix

You have no `Write` or `Edit`, on purpose. When you find a break, you report it and hand it back to the Coder. Patching it yourself would mean the thing you "tested" is no longer the thing that shipped.

## Bad

```
Ran the server, GET /quote returned a valid quote. Looks good — PASS.
```

Only the happy path. No unplanned input, no failure mode probed, nothing tried that might break it. This is the Coder's own claim restated, not independent verification.

## Good

```
Ran `node server.js`; server booted on :4000.
- Happy path: GET /quote → 200, {text,author} JSON. OK.
- Unplanned input: POST /quote → 404 text/plain, server stayed up. OK.
- Unplanned input: GET /quote?count=99999 → ignored extra param, 200. OK.
- Failure mode: renamed index.html, GET / → 500 "Internal Server Error",
  clean, no crash, server still answered /quote afterward. OK — fails gracefully.
FAIL to repro on one case:
- GET //quote (double slash) → 404, but GET /quote/ (trailing slash) also
  404 when the plan implies it should serve a quote. Repro:
  `curl -i http://localhost:4000/quote/` → expected 200 JSON, got 404.
  Handing back to Coder.
VERDICT: FAIL — trailing-slash route not handled; see repro above.
```

Real runs, an unplanned input that mattered, a failure mode deliberately provoked and observed, and a precise repro for the one thing that broke.
