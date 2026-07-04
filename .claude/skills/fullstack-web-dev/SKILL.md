---
name: fullstack-web-dev
description: Use when the Coder is building or extending a website or web API — creating routes, structuring frontend/backend folders, or handling client input. Sets baseline conventions for structure, API design, and security so each project doesn't reinvent them.
---

# Fullstack Web Dev

Conventions, not dogma. Follow the existing project's patterns first; use these when starting fresh or when the project has no answer.

## Structure

- **Separate frontend from backend.** Server code, routes, and data access on one side; static pages, client JS, and assets on the other (e.g. `public/` or `client/`). Don't let them bleed together.
- **One concern per file until it hurts.** A single `server.js` is fine for a small app; split by route group or domain once it stops fitting in your head.
- **Config and secrets out of code.** Read them from the environment (`.env`, never committed). A secret in the source is a leak waiting for `git push`.

## API design

- **REST conventions.** Nouns for resources (`/api/projects`, `/api/projects/:id`), verbs via HTTP methods: `GET` reads, `POST` creates, `PUT`/`PATCH` updates, `DELETE` removes. Don't put verbs in paths (`/getProjects`).
- **Right status codes.** `200` ok, `201` created, `400` bad input, `401` not authenticated, `403` authenticated but not allowed, `404` not found, `409` conflict, `500` your bug. Returning `200` with an error body hides failures from every caller.
- **Consistent shapes.** Same success envelope and same error envelope across endpoints. Callers shouldn't guess the format per route.

## Security baseline

- **Never trust client input.** Anything from the browser — body, query, params, headers, cookies — is attacker-controlled. Validate type, length, and range on the server before use. Client-side validation is UX, not security.
- **Parameterize queries.** Never build SQL (or any query) by string-concatenating input. Use bound parameters. Same for shell commands and file paths built from input.
- **Auth, then authorization.** First confirm *who* they are (valid session/token), then confirm they're *allowed* to do this specific thing. Check ownership on every resource access — don't assume a valid session means "can touch any record."
- **Don't leak internals.** Generic error messages to the client; details to the server log. Stack traces and DB errors in a response hand attackers a map.
