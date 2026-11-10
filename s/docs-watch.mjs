// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later
// Zensical watches the staged tree; watch original sources and regenerate it.
import { watch } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { ROOT } from './prepare-docs.mjs';

function prepare() {
  // A fresh process also reloads scenario imports after catalogue edits.
  const result = spawnSync(process.execPath, ['s/prepare-docs.mjs'], { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) throw new Error('Documentation preparation failed');
}
prepare();
let timer;
const refresh = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try { prepare(); } catch (error) { console.error(`Docs refresh failed: ${error.message}`); }
  }, 250);
};
const watchers = ['docs', 'spec', 'reference-sources', 'demo', 'chart'].map(directory =>
  watch(path.join(ROOT, directory), { recursive: true }, refresh));
for (const file of ['README.md', 'SAFETY.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CHANGELOG.md', 'mkdocs.yml']) {
  watchers.push(watch(path.join(ROOT, file), refresh));
}
const child = spawn(path.join(ROOT, '.venv-docs/bin/zensical'), ['serve', '-f', '.docs-config.yml', ...process.argv.slice(2)], {
  cwd: ROOT, stdio: 'inherit',
});
const close = () => { clearTimeout(timer); watchers.forEach(watcher => watcher.close()); };
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { close(); child.kill(signal); });
child.on('error', error => { console.error(error.message); close(); process.exitCode = 1; });
child.on('exit', code => { close(); process.exitCode = code ?? 0; });
