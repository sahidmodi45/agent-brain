---
name: security-review
description: Use when the Reviewer is checking a task that touches code, alongside the review-checklist skill. A focused security pass so the common, high-cost mistakes don't ship. Read-only, like all review work.
---

# Security Review

Run this in addition to `review-checklist`, not instead of it. These are the mistakes that are cheap to catch in review and expensive to catch in production. Cite `file:line` for anything you flag; a security concern without a location is noise.

## The checklist

1. **No hardcoded secrets.** Grep the diff for API keys, tokens, passwords, connection strings, private keys. Secrets belong in the environment, never in source — and once committed, they're in git history even after removal. A real key in the diff is an automatic send-back.
2. **No injection risk.** Any query, shell command, or eval built by concatenating input is a fail. SQL must use bound parameters; commands must not interpolate user strings. Look at every place input reaches a query, the shell, or the filesystem.
3. **No unsafe file/path handling.** Paths built from input must be validated and confined — reject `..`, absolute paths, and anything that escapes the intended directory. Path traversal lets a caller read or write files you never meant to expose.
4. **No logging of sensitive data.** Passwords, tokens, full card numbers, personal data — not in logs, not in error messages returned to the client. A log file is a plaintext copy; treat it like one.
5. **Input is validated server-side.** Confirm the server checks type, length, and range before trusting anything from the client. Client-side checks don't count — they're trivially bypassed.

## Verdict

- Any hardcoded secret or clear injection path is a **send-back**, even if the feature works. "Works" and "safe" are different questions.
- If something is genuinely risky but the call isn't yours to make — a real tradeoff, a design-level exposure, spending or production impact — flag it for **NEEDS HUMAN APPROVAL** rather than passing it through quietly.
- You judge; you don't fix. Name the risk and the location; the Coder makes the change.
