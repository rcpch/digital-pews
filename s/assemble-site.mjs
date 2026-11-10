// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later
// One Pages artifact: Zensical at root, legacy demos at their existing URLs.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT } from './prepare-docs.mjs';

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : file.endsWith('.html') ? [file] : [];
  });
}

export function assembleSite(root = ROOT) {
  const output = path.join(root, '_site');
  const site = path.join(root, 'site');
  rmSync(output, { recursive: true, force: true }); // Only our generated artifact.
  cpSync(site, output, { recursive: true });

  // Keep the old /docs/ assets and downloads available, but redirect its HTML
  // pages to their canonical root equivalents. Preserve query strings/hashes.
  cpSync(site, path.join(output, 'docs'), { recursive: true });
  for (const page of htmlFiles(site)) {
    const relative = path.relative(site, page);
    const oldPage = path.join(output, 'docs', relative);
    const target = path.relative(path.dirname(oldPage), path.join(output, relative)).split(path.sep).join('/').replace(/index\.html$/, '');
    const safeTarget = target.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
    writeFileSync(oldPage, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Digital PEWS - page moved</title><meta http-equiv="refresh" content="0;url=${safeTarget}"></head><body><p><a href="${safeTarget}">Continue to Digital PEWS</a></p><script>const target = new URL(${JSON.stringify(target)}, location.href); target.search = location.search; target.hash = location.hash; location.replace(target.href);</script></body></html>`);
  }

  for (const entry of readdirSync(path.join(root, 'demo'))) {
    if (['index.html', 'assets', 'chart'].includes(entry)) continue;
    const destination = path.join(output, entry);
    if (existsSync(destination)) throw new Error(`Demo/docs path collision: ${entry}`);
    cpSync(path.join(root, 'demo', entry), destination, { recursive: true });
  }
  cpSync(path.join(root, 'demo/index.html'), path.join(output, 'single-chart.html'));
  const demoPage = path.join(output, 'demo.html');
  writeFileSync(demoPage, readFileSync(demoPage, 'utf8').replace('href="https://rcpch.github.io/digital-pews/"', 'href="./"'));
  cpSync(path.join(root, 'chart'), path.join(output, 'chart'), { recursive: true });
  // The same logo is already part of the Zensical assets; do not overwrite its
  // generated CSS/JS asset tree with an entire demo directory.
  console.log('Assembled root documentation, standalone demos and /docs/ redirects in _site/.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) assembleSite();
