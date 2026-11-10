# Development versions and releases

Status: tooling configured, 10 November 2026. The component remains **0.1.0**; setting up this process does not create a tag or release. No clinical approval is implied by a version number, GitHub prerelease or passing automated checks.

## Version policy

`package.json` is the canonical semantic version. `package-lock.json` (including its root package entry) and the browser-readable `CHART_VERSION` in `chart/version.js` must mirror it. Automated tests enforce all three. Native browser modules still require no build step.

- Use a **patch** for backwards-compatible fixes, documentation or tooling updates that warrant a snapshot.
- Use a **minor** for new capabilities or breaking changes during 0.x development. Consumers must not assume minor releases are backwards-compatible while the API is experimental.
- **Major/1.0 releases are blocked by the tooling** until a separate stability/governance decision revises this policy. Stable API status and clinical deployment approval are separate decisions; neither follows automatically from the other.
- All current GitHub releases are marked **prerelease**, even though versions use plain `0.x.y` rather than an `-alpha` suffix. No release is designated GitHub's latest stable release.
- Package metadata stays private. NPM/CDN bundles, consumer types, support commitments and clinical release approval remain deferred under R28-R33 and R52.

## One release command

After explicit maintainer authorisation to publish a development snapshot:

```bash
s/version++ patch --dry-run   # offline plan; no file, commit, tag or network changes
s/version++ patch             # defaults to patch if omitted
s/version++ minor --pr        # explicitly use a release PR
```

Prerequisites: Node.js 22+, npm, Git, authenticated GitHub CLI, git-cliff **2.14.2** (pinned in `.git-cliff-version`), and the docs environment described in [`../s/README.md`](../s/README.md). Obtain git-cliff from its [official release](https://github.com/orhun/git-cliff/releases/tag/v2.14.2), verifying the published checksum before installation. It is MIT/Apache-2.0 licensed and used only by release tooling; the reviewed current release was checked against the official GitHub release API.

The command:

1. Requires `main`, a clean tracked/untracked working tree and exactly synchronised `origin/main` after fetching branches/tags.
2. Rejects malformed versions, drift, existing tags and unsupported 1.0 bumps. GitHub authentication, network and protection-query errors fail closed rather than assuming direct-push permission.
3. Detects classic protection or an active pull-request ruleset. Protected `main` uses a release PR; `--pr` also permits that route voluntarily. `--direct` must not bypass detected protection. GitHub's server-side protections still apply in every mode.
4. Runs a clean `npm ci`, updates the three version-bearing files, generates `CHANGELOG.md` with git-cliff, then runs the tests, scoring freshness check and complete docs/link build against the proposed version.
5. Commits only the version files and changelog as `chore(release): vX.Y.Z`. It pushes `main`, or pushes `release/vX.Y.Z` and opens a PR. Release PRs should be merged with a **merge commit**, preserving the release commit subject. There is no second `s/release` command.
6. Creates **no local tag**. After landing, `auto-tag.yml` verifies an increasing 0.x version and the matching release commit, runs the full reusable CI workflow on that exact push SHA, and only then creates the annotated `vX.Y.Z` tag.
7. Calls `release.yml` directly through `workflow_call`. This avoids relying on a tag-push event created with `GITHUB_TOKEN`, which does not trigger another workflow. The publish job uses the `development-releases` environment and creates a source-only GitHub prerelease with notes from the committed changelog and an explicit clinical-safety warning. GitHub supplies the source archives; no package is published.

Configure eligible refs and required human reviewers for the `development-releases` GitHub environment before the first release, subject to the repository's plan and maintainer staffing. The workflow names the environment but does not configure its protection. Main-branch protection is still tracked under HS-1; this tooling does not install or bypass protection settings.

## Changelog and recovery

[`../CHANGELOG.md`](../CHANGELOG.md) is generated from conventional commits using `cliff.toml`. Routine dependency updates, release commits and internal housekeeping are omitted. Security fixes worth communicating should use a meaningful `fix:` commit rather than rely on a routine dependency-bump entry. With no historical tags, the initial file intentionally contains **Unreleased** history; do not fabricate a past 0.1.0 release.

To refresh the unreleased history without releasing:

```bash
git-cliff --config cliff.toml --output CHANGELOG.md
```

If local validation or pushing fails, inspect the remaining changes/commit before retrying. The script does not automatically reset files, delete a branch, force-push, rewrite a tag or roll back user work. A release PR is not merged automatically. If CI fails, fix the failure and rerun the failed workflow; no tag is created before its validation gate passes. Re-running the same release workflow accepts only an existing annotated tag pointing to the same validated commit. An existing GitHub prerelease is left unchanged, not overwritten. Never move a published tag; issue a new version for a correction.

The exact tagged Git SHA already identifies a released source snapshot. Showing that hash in the chart toolbar remains separate work under R62: do not try to embed a commit's own hash in a file that determines that same hash.
