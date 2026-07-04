#!/usr/bin/env node
/**
 * check-file.js
 *
 * A lightweight lint/syntax gate wired to Claude Code's PostToolUse hook
 * (see .claude/settings.json). It runs right after a Write or Edit and
 * checks only the file that was just touched:
 *
 *   - .js / .cjs / .mjs  → `node --check` (parse/syntax check)
 *   - .json              → JSON.parse (valid JSON?)
 *   - anything else       → skipped (nothing to check, exits clean)
 *
 * This repo has no build tooling, so "lint" here means "does it parse."
 * That's enough to catch the cheap mistakes (a stray brace, a trailing
 * comma in JSON) before they reach the Reviewer.
 *
 * Contract with Claude Code:
 *   - exit 0 → all good, silent.
 *   - exit 2 → problem found; stderr is fed back to the agent to fix.
 *   - any of our own internal errors → exit 0 (never block on the
 *     checker's own bug; a broken linter shouldn't wedge the session).
 *
 * Built-ins only.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch (_) {
    return '';
  }
}

function main() {
  const raw = readStdin();
  if (!raw.trim()) return; // no payload → nothing to do

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (_) {
    return; // not our place to block on a malformed hook payload
  }

  const filePath =
    payload && payload.tool_input && payload.tool_input.file_path;
  if (!filePath) return;

  const ext = path.extname(filePath).toLowerCase();

  // Only check things that exist and that we know how to check.
  if (!fs.existsSync(filePath)) return;

  if (ext === '.js' || ext === '.cjs' || ext === '.mjs') {
    try {
      execFileSync(process.execPath, ['--check', filePath], {
        stdio: ['ignore', 'ignore', 'pipe'],
      });
    } catch (err) {
      const detail = (err.stderr && err.stderr.toString()) || err.message;
      process.stderr.write(
        'check-file: ' +
          filePath +
          ' failed the JS syntax check:\n' +
          detail +
          '\nFix the syntax error before moving on.\n'
      );
      process.exit(2);
    }
    return;
  }

  if (ext === '.json') {
    try {
      JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      process.stderr.write(
        'check-file: ' +
          filePath +
          ' is not valid JSON:\n' +
          err.message +
          '\nFix the JSON before moving on.\n'
      );
      process.exit(2);
    }
    return;
  }

  // Unknown extension → nothing to check.
}

main();
