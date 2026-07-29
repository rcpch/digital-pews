# Digital PEWS — local SMART-on-FHIR sandbox

An optional extension of the project's docker-compose setup that brings up a
local HAPI R4 FHIR server seeded with the Alex Thompson PEWS bundle, plus the
SMART launcher, patient browser, FHIR viewer and a control panel. It is a
trimmed, R4-only vendoring of the [rcpch/smart-dev-sandbox](https://github.com/rcpch/smart-dev-sandbox)
fork, wired so the launcher's "Launch" button points straight at the NPEWS
SMART app in `smart/`.

This is **not** a clinical system. It is a development-only sandbox for
exercising the SMART-on-FHIR launch flow against known PEWS-coded data.

## Quick start

```bash
s/up smart
```

This stacks `docker-compose.smart.yml` on top of the base `docker-compose.yml`
and starts:

| Service | Port | What |
|---|---|---|
| **SMART launcher** | <http://localhost:4013> | The front door. The control panel's "Launch" tile deep-links here with the NPEWS app + Alex Thompson prefilled. |
| Control panel | <http://localhost:4000> | Landing page linking everything together. |
| HAPI R4 FHIR | <http://localhost:4004/hapi-fhir-jpaserver/fhir> | Seeded with `seed/pews.json` on first boot. |
| Patient browser | <http://localhost:4012> | Browse/query seeded patients. |
| FHIR viewer | <http://localhost:4011> | Explore raw FHIR resources. |
| NPEWS SMART app | <http://localhost:9000/launch.html> | The `smart` service from the base compose file — the actual chart app. |

`s/up smart` opens the **SMART launcher** (`:4013`) in your browser with the
launch URL prefilled to `http://localhost:9000/launch.html`, R4 selected, and
`patient-alex` preselected. Click "Launch" and you'll land inside the simulated
EHR iframe on the NPEWS chart, populated from the seeded observations.

Press `Ctrl+C` to stop. `s/down smart` tears the sandbox stack down (the base
`demo`/`smart` services are unaffected).

## What gets seeded

`seed/pews.json` is a FHIR transaction bundle containing:

- **Patient** `patient-alex` — Alex Thompson, DOB 2017-03-14 (5-12y band)
- **Encounter** `encounter-alex` — in-progress inpatient encounter
- **26 observation rows** spanning 2025-01-10T00:00:00 → 23:00:00, each with
  the full PEWS vital set: RR, SpO₂, HR, BP (systolic/diastolic), CRT, AVPU,
  temperature, respiratory distress, O₂ device, O₂ delivery
- Two skipped observations exercising the `pews-skip-reason` extension
  (one `unable`, one `procedure`) — the chart breaks the line over these per
  spec U3.10
- **Practitioner** `practitioner-smith` — Dr. Sarah Smith

The seed is idempotent (PUT by id), so re-running `s/up smart` after the
volume is populated is safe — the `seed` container will repost the bundle
and HAPI will upsert.

## Resetting the FHIR database

The HAPI database persists in a named Docker volume (`r4-database`) so it
survives restarts. If you change `R4_IMAGE` in `.env`, or just want a clean
slate, you must delete the volume:

```bash
s/down smart
docker container rm hapi-r4
docker volume rm digital-pews_r4-database
```

Then `s/up smart` will start fresh and re-seed.

## Configuration

All knobs live in `.env` (port assignments, image choice, memory/CPU limits,
which services are enabled). Restart with `s/down smart && s/up smart` after
changing any value.

To skip seeding on subsequent boots (the data is already in the volume), set
`SEED_ENABLED=0` in `.env`.

## Files

| Path | Purpose |
|---|---|
| `docker-compose.smart.yml` | The compose override. Stacked on `docker-compose.yml` by `s/up smart`. |
| `.env` | Port + image config (R4-only). |
| `seed/pews.json` | Alex Thompson PEWS bundle (vendored verbatim from rcpch/smart-dev-sandbox). |
| `patient-browser/r4.tpl` | Patient-browser R4 config template (envsubst'd at container start). |
| `www/template.html` | Control panel template (envsubst'd to `index.html` at container start). |
| `www/style.css`, `www/favicon.png`, `www/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2` | Control panel static assets. |

## How the launch URL prefill works

The SMART launcher's static form (`static/index.html` in the
`smartonfhir/smart-launcher` image) is populated from query params via
`qsToForm()` (see `static/lib.js`). The `/launch` endpoint (`src/launcher.js`)
accepts:

- `launch_uri` — the SMART app's launch URL
- `fhir_ver` — `2` | `3` | `4`
- `patient` — patient id to preselect
- `sim_ehr` — `1` to simulate an EHR launch (passes `iss` + `launch` to the app)
- `select_encounter` — `1` to preselect the encounter

The control panel's "Launch" tile constructs a URL of the form:

```
http://localhost:4013/?launch_uri=http://localhost:9000/launch.html&fhir_ver=4&patient=patient-alex&sim_ehr=1&select_encounter=1
```

so the user lands on a ready-to-go launch. Click "Launch" and the launcher
redirects to `smart/launch.html` with `iss` and `launch` query params, which
`fhirclient.js` uses to run the OAuth dance against the launcher's own
authorization endpoint, then resolves the patient context and hands off to
`smart.js`.
