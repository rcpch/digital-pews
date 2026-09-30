# Registering with Oracle Health (Cerner) code Console

Status: research complete, registration not yet performed. This is roadmap item [R42](./roadmap.md).

This document records how to register the Digital PEWS SMART-on-FHIR app with Oracle Health (the rebranded Cerner platform GESH runs on), based on the current official Oracle documentation as of 2026-09-30. It is a plan, not a record of a completed registration - update it once an app actually exists in code Console.

## The short version

1. Create a free **CernerCare account** (the developer identity for the whole Oracle Health platform).
2. Register the app in **code Console** (<https://code-console.cerner.com/>) - this creates a sandbox client ID and lets the app be tested immediately against Oracle's shared sandbox. This step requires no relationship with GESH.
3. **Registration is not activation.** A registered app only runs against Oracle's sandbox until a specific customer (GESH) opts it into their tenant, which GESH does by logging a Service Request against "Cerner Ignite APIs for Millennium" - see [Per-tenant go-live](#per-tenant-go-live-separate-from-registration) below. This is a GESH-side action we cannot perform ourselves.
4. Production/PowerChart access additionally requires joining the **Oracle Health Developer Program**.

## 1. CernerCare account

Free, self-service, at <https://businesslogin.cerner.com/CernerCare>. This is the identity used to log into code Console and, later, to receive any client secrets. One account per developer/maintainer is normal; record who holds it (see [Credential handling](#credential-handling-and-ownership) below) rather than sharing logins.

## 2. Register the app in code Console

<https://code-console.cerner.com/> → "+ New App". Fields, per the current Oracle docs (confirmed 2026-09-30):

| Field | What to set |
| --- | --- |
| App Name | e.g. "Digital PEWS" |
| App Type | **Provider** (provider-facing) - this is a clinical-workflow app, not patient-facing |
| App Privacy | **Public** client, unless a backend token-exchange service is added later (we have none; see [Authorization model](#authorization-model)) |
| SMART Launch URI | Public HTTPS URL of `smart/launch.html` |
| Redirect URI | Public HTTPS URL of `smart/index.html` |
| FHIR Spec | **R4** - Oracle documentation now explicitly says "develop your application for R4 as DSTU2 is being retired"; do not follow older DSTU2-era tutorials |
| Authorized | Yes (goes through OAuth2) |
| Scopes | Declared explicitly, one per resource/operation - **no wildcards** (`patient/*.read` is rejected; `patient/Observation.read` etc. must each be listed) |

Required scopes for the current chart contract, matching `smart/smart.js`'s `CHART_CODES` and the read-only shell:

- `patient/Patient.read`
- `patient/Observation.read`
- `launch`
- `online_access`
- `openid`
- `fhirUser` (current name; `profile` is retired)

`smart/smart.js` already requests `patient/*.read openid fhirUser launch` (see `smart/README.md`); this must be split into the explicit non-wildcard scopes above before registering, since Oracle's authorization server rejects wildcard scopes outright rather than silently narrowing them.

Registering creates a **sandbox client ID** immediately, usable against Oracle's shared sandbox (`fhir-ehr.sandboxcerner.com` per the FHIR Application Provisioning doc) with no GESH involvement. This is the right first step and can happen independently of any GESH relationship.

## 3. Per-tenant go-live (separate from registration)

Oracle's own docs are explicit that "self-service provisioning" is *customer*-initiated, not *developer*-initiated:

> When a developer creates an application in code Console, they are creating an application against the production cloud environment ... If a customer requires support for implementing an application, they can contact Oracle Health to request a contract for a custom scope.

For GESH (a Customer-Hosted Option / CHO customer, assumed - confirm which hosting model GESH uses) to actually run this app against their tenant, **GESH** must:

1. Find their tenant ID in Cerner Central.
2. Log a Service Request (SR) to "Cerner Ignite APIs for Millennium" asking for our application ID and client ID to be provisioned against their tenant ID.
3. Complete the SMART application setup so the app can be launched from PowerChart/FirstNet (a separate Cerner Wiki-documented step GESH's Oracle contacts handle).

We cannot log this SR ourselves - it has to come from GESH as the customer. Practically: get the app registered and working against the public sandbox first (steps 1-2 above, fully within our control), then hand GESH the application ID, client ID, and app name to include in their SR when they are ready to pilot.

## 4. PowerChart / production developer access

Testing in code Console's sandbox requires nothing beyond a CernerCare account. Testing inside PowerChart itself requires membership of the **Oracle Health Developer Program** (<https://www.oracle.com/health/developer/>), requested via <https://code.cerner.com/submit>. Do this once sandbox testing is working, before attempting a PowerChart pilot with GESH.

## Authorization model

- SMART App Launch **1.0.0 (STU1)** only - not SMART 2.0's more granular scope syntax. `fhirclient@2.5.0` (already used in `smart/smart.js`) supports this.
- Web-based apps **must not** run the OAuth authorization step in an iframe (Oracle's docs are explicit: clickjacking/anti-phishing/third-party-cookie protections interfere). Our current `smart/launch.html` → `smart/index.html` flow is a top-level page redirect, which is correct; this only becomes relevant if we later embed the launch/auth step inside an MPages iframe, which needs the separate [Cerner SMART Embeddable Library](https://github.com/cerner/cerner-smart-embeddable-lib) (XFC) to avoid clickjacking protections blocking it.
- Access tokens last ~570 seconds (~10 minutes); `online_access` scope is required for the refresh flow our read-only session needs across a longer viewing session.
- No wildcard scopes, anywhere, ever - this is a hard platform rule, not a style preference.

## Credential handling and ownership

Per [`AGENTS.md`](../AGENTS.md)'s "Approval Required" and house-style `security.md`: the CernerCare account and any resulting client ID/secret are project credentials, not personal ones.

- Record **who** holds the CernerCare account and **where** (e.g. a shared RCPCH credential store), not in this repository.
- The sandbox client ID is a public identifier (not a secret) and can be committed once known, similar to how `smart/launch.html` already names `CLIENT_ID` as a constant to replace.
- If the app is ever registered with **Confidential** privacy (requiring a client secret) for a backend/system-account flow, that secret must never be committed - follow the `.env`/`.env.example` pattern already used for `smart/fhir-sandbox/`.

## Open questions for GESH

- Which hosting model does GESH use - CHO, RHO, or a global/shared-domain arrangement? This determines which provisioning path in [FHIR Application Provisioning](https://docs.oracle.com/en/industries/health/millennium-platform-apis/fhir-app-provisioning/) applies and who GESH's Oracle Health contact is for the SR.
- Confirm GESH's target launch surface - PowerChart table of contents, an MPages-embedded component, or both - since MPages embedding needs the additional XFC library above.

## Sources (accessed 2026-09-30)

- [Build and Test SMART on FHIR Applications](https://docs.oracle.com/en/industries/health/millennium-platform-apis/build-smart-on-fhir-apps/) - registration overview, code Console link.
- [FHIR Application Provisioning](https://docs.oracle.com/en/industries/health/millennium-platform-apis/fhir-app-provisioning/) - the per-tenant SR/go-live process (CHO/RHO/Global).
- [SMART Application Overview Developer's Guide](https://docs.oracle.com/en/industries/health/millennium-platform-apis/smart-developer-overview/) - PowerChart access, Developer Program requirement, UI/UX and patient-safety guidance for embedded apps.
- [FHIR Authorization Framework](https://docs.oracle.com/en/industries/health/millennium-platform-apis/fhir-authorization-framework/) - SMART STU1-only, no wildcard scopes, no-iframe-for-auth rule, scope/token mechanics.
- [SMART on FHIR app tutorial](https://engineering.cerner.com/smart-on-fhir-tutorial/) - the code Console registration field list (dated; uses DSTU2 examples, cross-checked against the current R4-first guidance above).
