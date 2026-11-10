// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later

import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { prepareDocs, checkNavigation } from '../../s/prepare-docs.mjs';
import { SCENARIOS } from '../../demo/scenarios.js';

const temporary = mkdtempSync(path.join(tmpdir(), 'pews-docs-'));
const { config, destination } = prepareDocs(path.join(temporary, '.docs-source'));
afterAll(() => rmSync(temporary, { recursive: true, force: true }));

describe('documentation staging', () => {
  it('includes every scenario exactly once with an isolated, deep-linked frame', () => {
    for (const scenario of SCENARIOS) {
      expect(config.split(`: demo/${scenario.id}.md`)).toHaveLength(2);
      const page = readFileSync(path.join(destination, `demo/${scenario.id}.md`), 'utf8');
      expect(page).toContain(`src="../_demo/demo.html?embed=1#${scenario.id}"`);
      expect(page).toContain('not approved for clinical use');
      expect(page).toContain('title=');
    }
  });

  it('has no missing or orphaned navigation pages', () => {
    expect(() => checkNavigation(config, destination)).not.toThrow();
    expect(() => checkNavigation(`${config}\n  - Missing: absent.md\n`, destination)).toThrow('Missing nav page');
    const orphan = path.join(destination, 'orphan.md');
    writeFileSync(orphan, '# Orphan');
    expect(() => checkNavigation(config, destination)).toThrow('Unlisted page');
    rmSync(orphan);
  });

  it('preserves source provenance and maps published links without copying rules', () => {
    const safety = readFileSync(path.join(destination, 'SAFETY.md'), 'utf8');
    expect(safety).toContain('edit_uri: SAFETY.md');
    expect(safety).toContain('](spec/product-boundary.md)');
    expect(safety).toContain('https://github.com/rcpch/digital-pews/blob/main/chart/');
  });

  it('does not publish private workspace files', () => {
    expect(config).not.toContain('.private');
    expect(readFileSync(path.join(destination, 'index.md'), 'utf8')).not.toContain('data:image/');
  });
});
