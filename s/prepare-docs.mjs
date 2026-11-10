// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later

// Stage a single documentation tree without maintaining copies of clinical specs.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENARIOS } from '../demo/scenarios.js';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPOSITORY = 'https://github.com/rcpch/digital-pews/blob/main/';
const html = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(file) : [file];
  });
}

export function prepareDocs(destination = path.join(ROOT, '.docs-source')) {
  // This directory is generated exclusively by this script, never user source.
  if (destination === ROOT || !path.basename(destination).startsWith('.docs-source')) {
    throw new Error('Documentation staging must use a dedicated .docs-source directory');
  }
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });
  const sources = new Map();
  for (const file of filesUnder(path.join(ROOT, 'docs'))) {
    sources.set(path.relative(ROOT, file), path.relative(path.join(ROOT, 'docs'), file));
  }
  for (const directory of ['spec', 'reference-sources']) {
    for (const file of filesUnder(path.join(ROOT, directory))) {
      sources.set(path.relative(ROOT, file), path.relative(ROOT, file));
    }
  }
  for (const file of ['SAFETY.md', 'CONTRIBUTING.md', 'SECURITY.md', 'README.md']) {
    sources.set(file, file === 'README.md' ? 'project.md' : file);
  }

  for (const [source, target] of sources) {
    const output = path.join(destination, target);
    mkdirSync(path.dirname(output), { recursive: true });
    if (!source.endsWith('.md')) {
      cpSync(path.join(ROOT, source), output);
      continue;
    }
    // Keep relative links local for published content; link code and other
    // repository files to GitHub rather than publish the whole working tree.
    const content = readFileSync(path.join(ROOT, source), 'utf8').replace(
      /(!?\[[^\]]*\]\()([^\s)]+)(\))/g,
      (match, before, url, after) => {
        if (/^(?:[a-z]+:|#|\/)/i.test(url)) return match;
        const [file, fragment] = url.split('#');
        const resolved = path.normalize(path.join(path.dirname(source), file));
        const mapped = sources.get(resolved);
        const link = mapped
          ? path.relative(path.dirname(target), mapped)
          : `${REPOSITORY}${resolved.split(path.sep).map(encodeURIComponent).join('/')}`;
        return `${before}${link}${fragment ? `#${fragment}` : ''}${after}`;
      },
    );
    const edit = `---\nedit_uri: ${source}\n---\n\n<small>[Edit this page](https://github.com/rcpch/digital-pews/edit/main/${source})</small>\n\n`;
    writeFileSync(output, edit + content);
  }

  cpSync(path.join(ROOT, 'demo'), path.join(destination, '_demo'), { recursive: true });
  cpSync(path.join(ROOT, 'chart'), path.join(destination, '_demo/chart'), { recursive: true });
  mkdirSync(path.join(destination, 'assets'), { recursive: true });
  cpSync(path.join(ROOT, 'demo/assets/rcpch-logo.svg'), path.join(destination, 'assets/rcpch-logo.svg'));
  mkdirSync(path.join(destination, 'demo'), { recursive: true });

  for (const scenario of SCENARIOS) {
    if (!/^[a-z0-9-]+$/.test(scenario.id)) throw new Error(`Unsafe scenario id: ${scenario.id}`);
    const standalone = `../_demo/demo.html#${scenario.id}`;
    writeFileSync(path.join(destination, `demo/${scenario.id}.md`), `---
hide:
  - toc
edit_uri: demo/scenarios.js
---

# ${scenario.title}

${scenario.description}

**Synthetic data. Development demonstration only - not approved for clinical use.**

<a href="${standalone}" target="_blank" rel="noopener">Open standalone demo</a>
 · [View scenario source](https://github.com/rcpch/digital-pews/blob/main/demo/scenarios.js)

<iframe class="pews-demo" title="${html(scenario.title)} - synthetic PEWS demonstration" src="../_demo/demo.html?embed=1#${scenario.id}" loading="lazy"></iframe>
`);
  }

  const specFiles = readdirSync(path.join(ROOT, 'spec')).filter(file => file.endsWith('.md') && file !== 'README.md').sort();
  let config = readFileSync(path.join(ROOT, 'mkdocs.yml'), 'utf8');
  config = config.replace('      # SCENARIO_NAV', SCENARIOS.map(s => `      - ${JSON.stringify(s.title)}: demo/${s.id}.md`).join('\n'));
  config = config.replace('      # SPEC_NAV', specFiles.map(file => {
    const heading = readFileSync(path.join(ROOT, 'spec', file), 'utf8').match(/^# (.+)$/m)?.[1] || file;
    return `      - ${JSON.stringify(heading)}: spec/${file}`;
  }).join('\n'));
  config = config.replace('      # REFERENCE_NAV', readdirSync(path.join(ROOT, 'reference-sources'))
    .filter(file => file.endsWith('.md') && file !== 'README.md').sort().map(file => {
      const heading = readFileSync(path.join(ROOT, 'reference-sources', file), 'utf8').match(/^# (.+)$/m)?.[1] || file;
      return `      - ${JSON.stringify(heading)}: reference-sources/${file}`;
    }).join('\n'));
  return { config, destination };
}

export function checkNavigation(config, destination) {
  const nav = [...config.matchAll(/:\s+([^\s]+\.md)\s*$/gm)].map(match => match[1]);
  const pages = filesUnder(destination).filter(file => file.endsWith('.md') && !path.relative(destination, file).startsWith('_demo/'));
  // SECURITY.md is linked from CONTRIBUTING.md; intentionally not a top-level task.
  const exceptions = ['SECURITY.md'];
  const errors = [
    ...nav.filter(file => !existsSync(path.join(destination, file))).map(file => `Missing nav page: ${file}`),
    ...pages.map(file => path.relative(destination, file)).filter(file => !nav.includes(file) && !exceptions.includes(file)).map(file => `Unlisted page: ${file}`),
    ...exceptions.filter(file => !existsSync(path.join(destination, file))).map(file => `Stale nav exception: ${file}`),
  ];
  if (errors.length) throw new Error(errors.join('\n'));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { config, destination } = prepareDocs();
  checkNavigation(config, destination);
  writeFileSync(path.join(ROOT, '.docs-config.yml'), config);
  console.log(`Prepared documentation and ${SCENARIOS.length} scenario pages.`);
}
