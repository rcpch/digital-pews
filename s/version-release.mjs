// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const FILES = ['package.json', 'package-lock.json', 'chart/version.js', 'CHANGELOG.md'];
const json = (root, file) => JSON.parse(readFileSync(path.join(root, file), 'utf8'));
const run = (root, command, args, options = {}) => execFileSync(command, args, {
  cwd: root, encoding: 'utf8', ...options,
});

export function versionParts(version) {
  if (!VERSION.test(version)) throw new Error(`Expected a plain semantic version, got ${version}`);
  const parts = version.split('.').map(Number);
  if (!parts.every(Number.isSafeInteger)) throw new Error('Version numbers exceed safe integer limits');
  return parts;
}

export function nextVersion(current, bump) {
  const parts = versionParts(current);
  if (parts[0] !== 0) throw new Error('Only the development 0.x release policy is configured');
  if (bump === 'major') throw new Error('1.0 requires a separate stability/governance decision; use patch or minor for now');
  if (!['patch', 'minor'].includes(bump)) throw new Error(`Unknown bump: ${bump}`);
  if (bump === 'minor') { parts[1] += 1; parts[2] = 0; }
  else parts[2] += 1;
  const version = parts.join('.');
  versionParts(version);
  return version;
}

export function readVersion(root = ROOT) {
  const version = json(root, 'package.json').version;
  versionParts(version);
  const lock = json(root, 'package-lock.json');
  const runtime = readFileSync(path.join(root, 'chart/version.js'), 'utf8');
  if (lock.version !== version || lock.packages?.['']?.version !== version ||
      !runtime.includes(`export const CHART_VERSION = '${version}';`)) {
    throw new Error('Version drift between package.json, package-lock.json and chart/version.js');
  }
  return version;
}

export function updateVersions(root, version) {
  readVersion(root); // Fail before changing any file if the baseline is inconsistent.
  versionParts(version);
  for (const file of ['package.json', 'package-lock.json']) {
    const data = json(root, file);
    data.version = version;
    if (file === 'package-lock.json') data.packages[''].version = version;
    writeFileSync(path.join(root, file), `${JSON.stringify(data, null, 2)}\n`);
  }
  const runtime = path.join(root, 'chart/version.js');
  writeFileSync(runtime, readFileSync(runtime, 'utf8').replace(
    /export const CHART_VERSION = '[^']+';/, `export const CHART_VERSION = '${version}';`,
  ));
}

export function assertReleaseStart(root = ROOT) {
  if (run(root, 'git', ['branch', '--show-current']).trim() !== 'main') throw new Error('Start a release from main');
  if (run(root, 'git', ['status', '--porcelain']).trim()) throw new Error('Release requires a clean working tree');
}

export function parseArguments(args) {
  let bump = 'patch';
  let selectedBump = false;
  let mode = 'auto';
  let dryRun = false;
  for (const arg of args) {
    if (['patch', 'minor', 'major'].includes(arg) && !selectedBump) { bump = arg; selectedBump = true; }
    else if (arg === '--dry-run') dryRun = true;
    else if (['--pr', '--direct'].includes(arg) && mode === 'auto') mode = arg.slice(2);
    else throw new Error(`Unknown or conflicting argument: ${arg}`);
  }
  return { bump, mode, dryRun };
}

function api(root, endpoint) {
  try { return JSON.parse(run(root, 'gh', ['api', endpoint])); }
  catch (error) {
    // Only a confirmed 404 means absent. Auth/network/rate-limit errors must
    // never silently choose a direct push or treat an existing tag as absent.
    if (String(error.stderr).includes('(HTTP 404)')) return null;
    throw error;
  }
}

function protectedMain(root, repository) {
  const classic = api(root, `repos/${repository}/branches/main/protection`);
  const rules = api(root, `repos/${repository}/rules/branches/main`);
  return classic !== null || (rules ?? []).length > 0;
}

export function detectRelease(root, base, head) {
  for (const sha of [base, head]) {
    if (!/^[0-9a-f]{40}$/.test(sha) || /^0+$/.test(sha)) throw new Error('Expected existing base and head commit SHAs');
  }
  const previous = JSON.parse(run(root, 'git', ['show', `${base}:package.json`])).version;
  const current = JSON.parse(run(root, 'git', ['show', `${head}:package.json`])).version;
  if (previous === current) return null;
  const old = versionParts(previous);
  const next = versionParts(current);
  const firstDifference = next.findIndex((value, index) => value !== old[index]);
  if (firstDifference === -1 || next[firstDifference] < old[firstDifference] || next[0] !== 0) {
    throw new Error('Release version must increase and remain 0.x');
  }
  const tag = `v${current}`;
  const subjects = run(root, 'git', ['log', '--format=%s', `${base}..${head}`]).trim().split('\n');
  if (!subjects.includes(`chore(release): ${tag}`)) throw new Error(`Missing release commit: chore(release): ${tag}`);
  return tag;
}

async function release(args) {
  const { bump, mode, dryRun } = parseArguments(args);
  assertReleaseStart();
  const current = readVersion();
  const next = nextVersion(current, bump);
  const tag = `v${next}`;
  console.log(`${current} -> ${next}; ${mode} landing mode${dryRun ? ' (dry run, no changes or network calls)' : ''}`);
  if (dryRun) return;

  for (const command of ['gh', 'npm', 'git-cliff']) run(ROOT, command, ['--version']);
  if (!existsSync(path.join(ROOT, '.venv-docs/bin/zensical'))) throw new Error('Install the docs environment first (see s/README.md)');
  const cliffVersion = readFileSync(path.join(ROOT, '.git-cliff-version'), 'utf8').trim();
  if (run(ROOT, 'git-cliff', ['--version']).trim() !== `git-cliff ${cliffVersion}`) {
    throw new Error(`Install git-cliff ${cliffVersion} before releasing (see spec/releases.md)`);
  }
  run(ROOT, 'git', ['fetch', 'origin', 'main', '--tags'], { stdio: 'inherit' });
  if (run(ROOT, 'git', ['rev-parse', 'HEAD']) !== run(ROOT, 'git', ['rev-parse', 'origin/main'])) {
    throw new Error('Local main must exactly match origin/main before releasing');
  }
  if (run(ROOT, 'git', ['tag', '--list', tag]).trim()) throw new Error(`${tag} already exists`);
  const repository = run(ROOT, 'gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner']).trim();
  const protectedBranch = protectedMain(ROOT, repository);
  if (protectedBranch && mode === 'direct') throw new Error('Direct mode cannot bypass protected main');
  const usePr = mode === 'pr' || protectedBranch;

  // A clean lockfile install first; no source mutation until all preflights pass.
  run(ROOT, 'npm', ['ci'], { stdio: 'inherit' });
  updateVersions(ROOT, next);
  run(ROOT, 'git-cliff', ['--config', 'cliff.toml', '--tag', tag, '--output', 'CHANGELOG.md'], { stdio: 'inherit' });
  for (const command of [['npm', ['test']], ['npm', ['run', 'generate:scoring:check']], ['bash', ['s/build-site']]]) {
    run(ROOT, command[0], command[1], { stdio: 'inherit' });
  }
  run(ROOT, 'git', ['diff', '--check'], { stdio: 'inherit' });
  if (usePr) run(ROOT, 'git', ['switch', '-c', `release/${tag}`], { stdio: 'inherit' });
  run(ROOT, 'git', ['add', '--', ...FILES]);
  run(ROOT, 'git', ['commit', '-m', `chore(release): ${tag}`], { stdio: 'inherit' });
  if (usePr) {
    run(ROOT, 'git', ['push', '-u', 'origin', `release/${tag}`], { stdio: 'inherit' });
    run(ROOT, 'gh', ['pr', 'create', '--base', 'main', '--head', `release/${tag}`, '--title', `chore(release): ${tag}`,
      '--body', `Prepare development prerelease ${tag}. This is not clinical approval.\n\nMerge with a merge commit after required checks pass; CI then tags and publishes the prerelease.`], { stdio: 'inherit' });
  } else run(ROOT, 'git', ['push', 'origin', 'main'], { stdio: 'inherit' });
  console.log('No local tag created. CI will validate the landed commit before tagging and publishing a development prerelease.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: s/version++ [patch|minor|major] [--dry-run] [--pr|--direct]\nMajor/1.0 releases are currently blocked by policy.');
  } else {
    release(args).catch(error => {
      console.error(`Release stopped: ${error.message}\nIf version files were changed, inspect them before retrying. No automatic rollback is performed.`);
      process.exitCode = 1;
    });
  }
}
