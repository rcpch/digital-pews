// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later
// Small trusted CI entry points. Environment values are validated before use.
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { detectRelease, readVersion, versionParts } from './version-release.mjs';

const command = process.argv[2];
const repository = process.env.GITHUB_REPOSITORY;
const sha = process.env.GITHUB_SHA;
const tag = process.env.RELEASE_TAG;
const gh = args => JSON.parse(execFileSync('gh', ['api', ...args], { encoding: 'utf8' }));

function validateTag() {
  if (!/^v0\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(tag ?? '')) throw new Error('Expected a v0.x.y development tag');
  versionParts(tag.slice(1));
  if (`v${readVersion(process.cwd())}` !== tag) throw new Error('Tag does not match the checked-out component version');
}

if (command === 'detect') {
  const releaseTag = detectRelease(process.cwd(), process.env.RELEASE_BASE, sha);
  appendFileSync(process.env.GITHUB_OUTPUT, `tag=${releaseTag ?? ''}\n`);
} else if (command === 'tag') {
  validateTag();
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository ?? '') || !/^[0-9a-f]{40}$/.test(sha ?? '')) throw new Error('Invalid repository or commit');
  if (execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() !== sha) throw new Error('Checkout is not the validated push commit');
  let existing;
  try { existing = gh([`repos/${repository}/git/ref/tags/${tag}`]); }
  catch (error) { if (!String(error.stderr).includes('(HTTP 404)')) throw error; }
  if (existing) {
    if (existing.object.type !== 'tag') throw new Error('Existing release tag is not annotated');
    const annotation = gh([`repos/${repository}/git/tags/${existing.object.sha}`]);
    if (annotation.object.type !== 'commit' || annotation.object.sha !== sha) throw new Error('Existing tag points to a different commit');
    console.log(`${tag} already points to the validated commit; continuing idempotently.`);
  } else {
    const annotation = gh([`repos/${repository}/git/tags`, '-f', `tag=${tag}`, '-f', `message=Digital PEWS ${tag} - development prerelease, not clinically approved`, '-f', `object=${sha}`, '-f', 'type=commit']);
    gh([`repos/${repository}/git/refs`, '-f', `ref=refs/tags/${tag}`, '-f', `sha=${annotation.sha}`]);
    console.log(`Created annotated ${tag} at ${sha}.`);
  }
} else if (command === 'notes') {
  validateTag();
  const changelog = readFileSync('CHANGELOG.md', 'utf8');
  const heading = `## [${tag.slice(1)}] - `;
  const start = changelog.indexOf(heading);
  if (start === -1) throw new Error('Release section is missing from CHANGELOG.md');
  const end = changelog.indexOf('\n## [', start + heading.length);
  const section = changelog.slice(start, end === -1 ? undefined : end).trim();
  writeFileSync('release-notes.md', `**Development prerelease. Not clinically approved for live use.**\n\nSource snapshot only: no NPM package, bundled distribution or clinical deployment approval is provided. See SAFETY.md and spec/product-boundary.md in this tag.\n\n${section}\n`);
} else if (command === 'publish') {
  validateTag();
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository ?? '')) throw new Error('Invalid repository');
  let existing;
  try { existing = gh([`repos/${repository}/releases/tags/${tag}`]); }
  catch (error) { if (!String(error.stderr).includes('(HTTP 404)')) throw error; }
  if (existing) {
    if (!existing.prerelease || existing.draft) throw new Error('Existing release is not a published development prerelease');
    console.log('Development prerelease already exists; leaving it unchanged.');
  } else {
    execFileSync('gh', ['release', 'create', tag, '--repo', repository, '--verify-tag', '--prerelease', '--latest=false',
      '--title', `Digital PEWS ${tag} (development)`, '--notes-file', 'release-notes.md'], { stdio: 'inherit' });
  }
} else throw new Error('Expected detect, tag, notes or publish');
