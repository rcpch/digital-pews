// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later

import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { assembleSite } from '../../s/assemble-site.mjs';

const directories = [];
afterEach(() => directories.splice(0).forEach(directory => rmSync(directory, { recursive: true, force: true })));

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'pews-site-'));
  directories.push(root);
  const files = {
    'site/index.html': '<h1>Documentation landing page</h1>',
    'site/demo/example/index.html': '<h1>Scenario page</h1>',
    'site/reference-sources/chart.pdf': '%PDF-test-download',
    'site/assets/theme.css': '/* Zensical assets */',
    'demo/index.html': '<h1>Single chart</h1>',
    'demo/demo.html': '<a href="https://rcpch.github.io/digital-pews/">Documentation</a>',
    'demo/demo.js': '// Standalone harness',
    'chart/example.html': '<h1>Component example</h1>',
  };
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), content);
  }
  return root;
}

describe('root documentation site assembly', () => {
  it('preserves Zensical at root and keeps standalone demo and component URLs', () => {
    const root = fixture();
    assembleSite(root);
    const read = file => readFileSync(path.join(root, '_site', file), 'utf8');
    expect(read('index.html')).toContain('Documentation landing page');
    expect(read('single-chart.html')).toContain('Single chart');
    expect(read('demo.html')).toContain('href="./"');
    expect(read('demo.js')).toContain('Standalone harness');
    expect(read('chart/example.html')).toContain('Component example');
    expect(read('assets/theme.css')).toContain('Zensical assets');
  });

  it('redirects previous docs pages and preserves download bytes and URL state', () => {
    const root = fixture();
    assembleSite(root);
    const read = file => readFileSync(path.join(root, '_site', file), 'utf8');
    expect(read('docs/index.html')).toContain('content="0;url=../"');
    const redirect = read('docs/demo/example/index.html');
    expect(redirect).toContain('url=../../../demo/example/');
    expect(redirect).toContain('target.search = location.search');
    expect(redirect).toContain('target.hash = location.hash');
    expect(redirect).toContain('content="noindex"');
    expect(read('docs/reference-sources/chart.pdf')).toBe(read('reference-sources/chart.pdf'));
  });

  it('refuses unexpected demo/docs collisions instead of silently overwriting pages', () => {
    const root = fixture();
    writeFileSync(path.join(root, 'site/demo.html'), 'Unexpected generated page');
    expect(() => assembleSite(root)).toThrow('path collision: demo.html');
  });
});
