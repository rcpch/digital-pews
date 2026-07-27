# SMART on FHIR shell

A minimal SMART-on-FHIR launch wrapper for the NPEWS chart. Today it does
**only** the SMART OAuth dance and renders the launch patient's demographics.
The chart itself will be wired in later by feeding the same patient + their
`Observation` resources into `<npews-chart>`.

## Files

| File | Role |
|---|---|
| `launch.html` | EHR launch entry point. Reads `iss`/`launch` query params, redirects to the EHR's OAuth authorisation endpoint. |
| `index.html` | Post-redirect landing page. Loads `fhirclient.js` and `smart.js`. |
| `smart.js` | Boots the SMART client, reads the launch patient, renders demographics. ES module, no build step. |
| `smart.css` | Minimal styling using the project's design tokens. |

## Running locally

The shell is plain static HTML/JS — serve it any way you like. The fastest
option with the project's existing tooling is the demo container, which mounts
`pews-chart/`. To serve `smart/` too, mount it on a second container or copy
these files into `pews-chart/` for testing.

A quick one-shot with Python:

```bash
cd smart
python3 -m http.server 9000
# then visit http://localhost:9000/launch.html
```

## Testing against the public SMART sandbox

Use the SMART launcher at <https://launch.smarthealthit.org> with:

- **Launch URL**: `http://localhost:9000/launch.html` (or wherever you serve it)
- **Simulated scopes**: `patient/*.read openid fhirUser`

The launcher will open `launch.html` inside its iframe, fhirclient will
redirect through the sandbox OAuth server, and `index.html` will render the
random launch patient's demographics.

## Configuration

`launch.html` exposes three constants at the top of its `<script>`:

| Constant | Default | Notes |
|---|---|---|
| `CLIENT_ID` | `example-npews-smart-app` | Replace with your real OAuth client id registered with the EHR. |
| `REDIRECT_URI` | `index.html` next to `launch.html` | Computed from the launch URL. |
| `SCOPE` | `patient/*.read openid fhirUser` | Read-only patient scope. Add `launch/encounter` etc. when needed. |

## Wiring in the chart (later)

The shell already has the launch patient; the next step is to fetch the
patient's `Observation` resources and feed them to `<npews-chart>`:

```js
const observations = await client.patient.request('Observation', { count: 1000 });
document.getElementById('chart').data = {
  patient: await client.patient.read(),
  observations: fromFhirBundleToChartModel({ entry: observations }).observations,
};
```

The chart core stays framework-neutral — this shell is a thin host, exactly
as `spec/react.md` prescribes.
