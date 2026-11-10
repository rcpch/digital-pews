// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later

import { readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function markdownFiles(directory) {
  // Test repository sources, including new files, not generated docs, virtual
  // environments, private materials or dependencies excluded by .gitignore.
  return execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '*.md'], {
    cwd: directory, encoding: 'utf8',
  }).split('\0').filter(Boolean).map(file => resolve(directory, file));
}

function localLinks(markdown) {
  return [...markdown.matchAll(/!?\[[^\]]*\]\(([^\s)]+)(?:\s+['"][^'"]*['"])?\)/g)]
    .map(([, target]) => target)
    .filter((target) => !target.startsWith('#') && !/^(https?:|mailto:|~\/)/.test(target));
}

function githubAnchors(markdown) {
  const seen = new Map();
  return [...markdown.matchAll(/^#{1,6}\s+(.+)$/gm)].map(([, heading]) => {
    const base = heading
      .toLowerCase()
      .replace(/<[^>]*>/g, '')
      .replace(/[\[\]`*_]/g, '')
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .trim()
      .replace(/\s+/g, '-');
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  });
}

describe('Markdown links', () => {
  it('resolves every local Markdown link and heading fragment from its source file', () => {
    const broken = [];

    for (const source of markdownFiles(repositoryRoot)) {
      for (const target of localLinks(readFileSync(source, 'utf8'))) {
        const [path, fragment] = decodeURIComponent(target).split('#', 2);
        const destination = path ? resolve(dirname(source), path) : source;
        if (!statSync(destination, { throwIfNoEntry: false })) {
          broken.push(`${relative(repositoryRoot, source)} -> ${target}`);
          continue;
        }
        if (fragment && !githubAnchors(readFileSync(destination, 'utf8')).includes(fragment)) {
          broken.push(`${relative(repositoryRoot, source)} -> ${target}`);
        }
      }
    }

    expect(broken).toEqual([]);
  });
});
