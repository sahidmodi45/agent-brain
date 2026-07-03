#!/usr/bin/env node
/**
 * update-status.js
 *
 * Generates status.json at the repo root as a machine-readable mirror of
 * whichever phase is currently checked in context/project.md's phase
 * checklist.
 *
 * Usage:
 *   node scripts/update-status.js
 *
 * Behavior:
 *   - Reads context/project.md (relative to the repo root, i.e. one level
 *     up from this script's directory).
 *   - Looks for exactly one `- [x]` line among the six known phase bullets.
 *   - On success, writes status.json at the repo root with:
 *       { "phase": "<slug>", "last_updated": "<ISO-8601 UTC timestamp>" }
 *   - On failure (zero or more than one box checked, or the file/section
 *     can't be found), prints a clear error to stderr, exits non-zero, and
 *     does NOT touch status.json.
 *
 * Built-ins only — no npm dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const PROJECT_MD_PATH = path.join(REPO_ROOT, 'context', 'project.md');
const STATUS_JSON_PATH = path.join(REPO_ROOT, 'status.json');

// Fixed set of known phase labels, in the order they appear in
// context/project.md, mapped to their lowercase-hyphenated slug.
// This mapping is a documented convention (see context/decisions.md) —
// if the wording of the checklist in project.md changes, this list must
// change with it.
const KNOWN_PHASES = [
  { label: 'Planning', slug: 'planning' },
  { label: 'Delegated', slug: 'delegated' },
  { label: 'In progress', slug: 'in-progress' },
  { label: 'In review', slug: 'in-review' },
  { label: 'Awaiting approval', slug: 'awaiting-approval' },
  { label: 'Shipped', slug: 'shipped' },
];

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function fail(message) {
  process.stderr.write('update-status.js: ' + message + '\n');
  process.exitCode = 1;
}

function main() {
  let contents;
  try {
    contents = fs.readFileSync(PROJECT_MD_PATH, 'utf8');
  } catch (err) {
    fail(
      'could not read ' +
        PROJECT_MD_PATH +
        ' (' +
        err.message +
        '). status.json was not touched.'
    );
    return;
  }

  const results = KNOWN_PHASES.map(({ label, slug }) => {
    // Matches lines like: "- [x] **Planning** — ..." or "- [ ] **Planning** — ..."
    const pattern = new RegExp(
      '^-\\s\\[( |x)\\]\\s+\\*\\*' + escapeRegExp(label) + '\\*\\*',
      'm'
    );
    const match = contents.match(pattern);
    return {
      label,
      slug,
      found: !!match,
      checked: !!match && match[1] === 'x',
    };
  });

  const missing = results.filter((r) => !r.found);
  if (missing.length > 0) {
    fail(
      'could not find the expected phase checkbox line(s) for: ' +
        missing.map((r) => r.label).join(', ') +
        ' in ' +
        PROJECT_MD_PATH +
        '. Expected format: "- [ ] **<Label>** — ...". status.json was not touched.'
    );
    return;
  }

  const checked = results.filter((r) => r.checked);

  if (checked.length === 0) {
    fail(
      'no phase is checked in ' +
        PROJECT_MD_PATH +
        ' (expected exactly one `- [x]` among: ' +
        KNOWN_PHASES.map((p) => p.label).join(', ') +
        '). status.json was not touched.'
    );
    return;
  }

  if (checked.length > 1) {
    fail(
      'more than one phase is checked in ' +
        PROJECT_MD_PATH +
        ': ' +
        checked.map((r) => r.label).join(', ') +
        '. Exactly one must be checked. status.json was not touched.'
    );
    return;
  }

  const phase = checked[0].slug;
  const lastUpdated = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

  const status = {
    phase,
    last_updated: lastUpdated,
  };

  try {
    fs.writeFileSync(STATUS_JSON_PATH, JSON.stringify(status, null, 2) + '\n');
  } catch (err) {
    fail('failed to write ' + STATUS_JSON_PATH + ' (' + err.message + ').');
    return;
  }

  process.stdout.write(
    'status.json updated: phase="' + phase + '", last_updated="' + lastUpdated + '"\n'
  );
}

main();
