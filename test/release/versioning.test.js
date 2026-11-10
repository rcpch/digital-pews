// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later

import { afterEach, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { assertReleaseStart, detectRelease, nextVersion, parseArguments, readVersion, updateVersions } from '../../s/version-release.mjs';

const directories = [];
afterEach(() => directories.splice(0).forEach(directory => rmSync(directory, { recursive: true, force: true })));

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'pews-release-'));
  directories.push(root);
  mkdirSync(path.join(root, 'chart'));
  writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'test', version: '0.1.0' }));
  writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify({ version: '0.1.0', packages: { '': { version: '0.1.0' }, other: { version: '9.0.0' } } }));
  writeFileSync(path.join(root, 'chart/version.js'), "// Retain this comment\nexport const CHART_VERSION = '0.1.0';\n");
  return root;
}

function git(root, ...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function initialiseGit(root) {
  git(root, 'init', '-b', 'main');
  git(root, 'config', 'user.name', 'Release test');
  git(root, 'config', 'user.email', 'test@example.invalid');
  git(root, 'config', 'commit.gpgsign', 'false');
  git(root, 'config', 'core.hooksPath', '/dev/null');
  git(root, 'add', '.');
  git(root, 'commit', '-m', 'feat: test baseline');
  return git(root, 'rev-parse', 'HEAD');
}

function copyTools(root) {
  mkdirSync(path.join(root, 's'));
  for (const file of ['version-release.mjs', 'release-ci.mjs']) {
    copyFileSync(new URL(`../../s/${file}`, import.meta.url), path.join(root, 's', file));
  }
}

describe('development version policy', () => {
  it('bumps patch/minor explicitly and refuses premature stable releases', () => {
    expect(nextVersion('0.1.0', 'patch')).toBe('0.1.1');
    expect(nextVersion('0.9.12', 'minor')).toBe('0.10.0');
    expect(() => nextVersion('0.1.0', 'major')).toThrow('1.0');
    for (const version of ['1.0.0', '0.01.0', '0.1.0-alpha', 'not-a-version']) {
      expect(() => nextVersion(version, 'patch')).toThrow();
    }
  });

  it('parses a default patch and rejects conflicting or unknown release arguments', () => {
    expect(parseArguments([])).toEqual({ bump: 'patch', mode: 'auto', dryRun: false });
    expect(parseArguments(['minor', '--dry-run', '--pr'])).toEqual({ bump: 'minor', mode: 'pr', dryRun: true });
    for (const args of [['--force'], ['--pr', '--direct'], ['patch', 'minor']]) {
      expect(() => parseArguments(args)).toThrow();
    }
  });

  it('updates all version mirrors without modifying dependency versions or comments', () => {
    const root = fixture();
    updateVersions(root, '0.2.0');
    expect(readVersion(root)).toBe('0.2.0');
    const lock = JSON.parse(readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
    expect(lock.packages.other.version).toBe('9.0.0');
    expect(readFileSync(path.join(root, 'chart/version.js'), 'utf8')).toContain('// Retain this comment');
  });

  it('fails before writing when an existing mirror has drifted', () => {
    const root = fixture();
    writeFileSync(path.join(root, 'chart/version.js'), "export const CHART_VERSION = '0.0.9';\n");
    expect(() => updateVersions(root, '0.2.0')).toThrow('drift');
    expect(JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')).version).toBe('0.1.0');
  });

  it('requires main and a clean working tree, including untracked files', () => {
    const root = fixture();
    initialiseGit(root);
    expect(() => assertReleaseStart(root)).not.toThrow();
    writeFileSync(path.join(root, 'untracked.txt'), 'do not discard');
    expect(() => assertReleaseStart(root)).toThrow('clean');
    rmSync(path.join(root, 'untracked.txt'));
    git(root, 'switch', '-c', 'other');
    expect(() => assertReleaseStart(root)).toThrow('main');
  });

  it('runs the actual dry-run CLI offline without files, commits or tags changing', () => {
    const root = fixture();
    copyTools(root);
    const head = initialiseGit(root);
    const output = execFileSync(process.execPath, ['s/version-release.mjs', 'patch', '--dry-run'], { cwd: root, encoding: 'utf8' });
    expect(output).toContain('0.1.0 -> 0.1.1');
    expect(git(root, 'status', '--porcelain')).toBe('');
    expect(git(root, 'rev-parse', 'HEAD')).toBe(head);
    expect(git(root, 'tag', '--list')).toBe('');
    expect(existsSync(path.join(root, 'CHANGELOG.md'))).toBe(false);
  });

  it('extracts only the release notes for the checked-out version with safety warnings', () => {
    const root = fixture();
    copyTools(root);
    writeFileSync(path.join(root, 'CHANGELOG.md'), '# Changelog\n\n## [0.1.0] - 2026-11-10\n\n### Added\n- Example\n\n## [0.0.9] - 2026-11-01\n- Older section\n');
    execFileSync(process.execPath, ['s/release-ci.mjs', 'notes'], { cwd: root, env: { ...process.env, RELEASE_TAG: 'v0.1.0' } });
    const notes = readFileSync(path.join(root, 'release-notes.md'), 'utf8');
    expect(notes).toContain('Not clinically approved');
    expect(notes).toContain('- Example');
    expect(notes).not.toContain('Older section');
    expect(() => execFileSync(process.execPath, ['s/release-ci.mjs', 'notes'], {
      cwd: root, env: { ...process.env, RELEASE_TAG: 'v0.2.0' }, stdio: 'pipe',
    })).toThrow();
  });
});

describe('CI release detection on immutable commits', () => {
  it('ignores unchanged versions and accepts a matching release commit', () => {
    const root = fixture();
    const base = initialiseGit(root);
    expect(detectRelease(root, base, base)).toBeNull();
    updateVersions(root, '0.2.0');
    git(root, 'add', '.');
    git(root, 'commit', '-m', 'chore(release): v0.2.0');
    expect(detectRelease(root, base, git(root, 'rev-parse', 'HEAD'))).toBe('v0.2.0');
  });

  it('rejects unmarked bumps, decreases, 1.0 and malformed SHAs', () => {
    for (const version of ['0.0.9', '1.0.0', '0.2.0']) {
      const root = fixture();
      const base = initialiseGit(root);
      updateVersions(root, version);
      git(root, 'add', '.');
      git(root, 'commit', '-m', 'chore: not a release');
      expect(() => detectRelease(root, base, git(root, 'rev-parse', 'HEAD'))).toThrow();
      expect(() => detectRelease(root, '--all', base)).toThrow('SHAs');
    }
  });
});
