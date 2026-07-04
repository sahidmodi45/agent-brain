---
description: Print the current project phase and a summary of the task board.
allowed-tools: Read
---

Give me a quick, read-only status snapshot. Do not change any files.

1. Read `context/project.md` and report the **current phase** — the one checkbox that's checked in the phase list. (For a cross-check, `status.json` holds the same phase in machine-readable form.)
2. Read `context/tasks.md` and summarize the board:
   - **NEEDS HUMAN APPROVAL** — list anything here first; if nothing, say so.
   - **To do / In progress / In review / Done** — a count per section plus a one-line title for each active (non-Done) task.

Keep it tight — a phase line, then the board. No prose beyond what's needed to read it at a glance.
