# SMART on FHIR shell

A SMART-on-FHIR launch wrapper for the NPEWS chart. It does the SMART OAuth
dance, fetches the launch patient's observations, and renders the chart —
scores are computed on the fly by the chart's scorer, never stored.

## Files

| File | Role |
|---|---|
| `launch.html` | EHR launch entry point. Reads `iss`/`launch` query params, redirects to the EHR's OAuth authorisation endpoint. |
| `index.html` | Post-redirect landing page. Loads `fhirclient.js`, registers `<npews-chart>`, and loads `smart.js`. |
| `smart.js` | Boots the SMART client, reads the launch patient, fetches + maps observations, feeds `<npews-chart>`. ES module, no build step. |
| `smart.css` | Minimal styling using the project's design tokens. |

## Running locally

```bash
s/up smart
# then visit http://localhost:9000/launch.html
```

The `smart` docker-compose service mounts `./pews-chart` read-only at
`/app/pews-chart` so the shell can import the chart module same-origin. No
CORS, no build step, no file duplication. The chart core is untouched.

## Testing against the public SMART sandbox

Use the SMART launcher at <https://launch.smarthealthit.org> with:

- **Launch URL**: `http://localhost:9000/launch.html`
- **Simulated scopes**: `patient/*.read openid fhirUser`

Note: the public sandbox gives random patients who usually have no
PEWS-relevant observations, so the chart will render with an empty-state
notice. For a meaningful render, launch from an EHR that has PEWS-coded
observations loaded (e.g. the Alex Thompson fixture bundle).

## How it works

```
EHR → launch.html (OAuth) → index.html
  → smart.js: FHIR.oauth2.ready()
  → client.patient.read()                    → Patient
  → client.request('Observation?patient={id}&code=<LOINC+PEWS>&_sort=date')
  → build synthetic Bundle { Patient, Observations[] }
  → fromFhirBundleToChartModel(bundle)       → { patient, observations }
  → <npews-chart>.data = { patient, observations }
```

### Observation query

The shell fetches observations with a `code=` filter covering all LOINC
vital-sign codes and RCPCH PEWS codes the chart consumes (see `CHART_CODES`
in `smart.js`). PEWS totals are NOT fetched — they are computed on the fly
by the chart's scorer.

If the EHR rejects the `code=` query (some EHRs reject unknown code systems
like the repo-local RCPCH PEWS system), the shell falls back to an
unfiltered query and lets `fromFhirBundleToChartModel` drop unknown codes
client-side.

### Empty / error states

- Zero observations fetched → "No observations found for this patient."
- Observations fetched but none match PEWS codes → "No PEWS-relevant observations found for this patient."
- OAuth or FHIR fetch failure → error banner with the message.

## Configuration

`launch.html` exposes three constants at the top of its `<script>`:

| Constant | Default | Notes |
|---|---|---|
| `CLIENT_ID` | `example-npews-smart-app` | Replace with your real OAuth client id registered with the EHR. |
| `REDIRECT_URI` | `index.html` next to `launch.html` | Computed from the launch URL. |
| `SCOPE` | `patient/*.read openid fhirUser` | Read-only patient scope. Add `launch/encounter` etc. when needed. |
