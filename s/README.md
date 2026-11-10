# Development scripts

The chart runtime still needs no build step. Documentation tooling requires Python 3.11+ and Node.js 22+; install its isolated environment once:

```bash
python3 -m venv .venv-docs
.venv-docs/bin/pip install --require-hashes -r requirements.txt
```

| Command | Purpose |
| --- | --- |
| `s/up` / `s/up demo` | Run the standalone demo using Docker Compose |
| `s/up smart` | Run the SMART-on-FHIR sandbox |
| `s/down` | Stop Docker Compose services |
| `s/docs` | Preview Zensical, open a browser and watch source changes; chooses a free port in 8000-8030 |
| `s/docs --dev-addr localhost:8015` | Override the preview address |
| `s/docs --no-open` | Preview without opening a browser |
| `s/check-docs-nav` | Stage documentation and check missing/unlisted pages, without Python dependencies |
| `s/build-site` | Build `_site/`: original demo at root, documentation at `/docs/` |

`mkdocs.yml` is the source configuration. `s/prepare-docs.mjs` expands its navigation markers from the scenario catalogue and specification headings into ignored `.docs-config.yml`, and stages content in ignored `.docs-source/`. Edit `docs/`, `spec/`, `SAFETY.md` or the original reference register, never the staged copies. Source-relative Markdown links are mapped to published pages where possible; code links point to GitHub. The development watcher refreshes staged copies and reloads the scenario catalogue automatically. Restart it after changing the generator itself.

Scenario pages are generated from `demo/scenarios.js`; neither their patient data nor their navigation entries are maintained twice. Each page embeds `_demo/demo.html?embed=1#scenario-id` in an isolated iframe. Embedded mode hides only the demo picker and starts display controls collapsed; clinical scoring and chart styles remain unchanged. The frame scrolls independently to retain its fixed playback/status controls, with a standalone link available for a larger view.

Refresh documentation dependencies deliberately with `uv pip compile --generate-hashes requirements.in -o requirements.txt`, then reinstall and rebuild. Zensical is an MIT-licensed, documentation-only dependency checked against its official PyPI release. Its pinned transitive tree is recorded in `requirements.txt`; it adds no chart runtime dependencies. If the tool is replaced later, original Markdown and the unbuilt demo remain usable.
