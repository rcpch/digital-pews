// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later
// One Pages artifact: preserve the demo root and publish Zensical under /docs/.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './prepare-docs.mjs';

const output = path.join(ROOT, '_site');
rmSync(output, { recursive: true, force: true }); // Only our generated artifact.
mkdirSync(output);
cpSync(path.join(ROOT, 'demo'), output, { recursive: true });
const demoPage = path.join(output, 'demo.html');
writeFileSync(demoPage, readFileSync(demoPage, 'utf8').replace('href="https://rcpch.github.io/digital-pews/docs/"', 'href="docs/"'));
cpSync(path.join(ROOT, 'chart'), path.join(output, 'chart'), { recursive: true });
cpSync(path.join(ROOT, 'site'), path.join(output, 'docs'), { recursive: true });
console.log('Assembled demo and documentation in _site/.');
