# Implementation

## 1) SMART-on-FHIR And EHR Context

- [ ] Which SMART launch modes are in scope for v1?
  - Options: EHR launch only / Standalone only / Both

Both

- [ ] Which EHR vendors/FHIR endpoints must be supported first (Epic, Oracle Cerner, other)?

Oracle Cerner I think probably first, although SMART-on-FHIR should work anywhere, right?

- [ ] Which FHIR version is mandatory for v1 (R4, R4B, mixed)?

R4

- [ ] Are confidential SMART clients allowed/required, or public clients only for initial rollout?

You will need to explain the difference between confidential and public clients to me!

- [ ] Is offline access (`offline_access`) required for the first production release?

## 2) Hosting, Security, And Compliance

- [ ] Hosting target for v1:
  - Options: NHS on-prem / NHS cloud tenant / Supplier-managed UK cloud

Don't worry about this for now, we just need an demo system initially

- [ ] Data residency constraints beyond UK/EAA requirements?

None

- [ ] Required security certifications at go-live (ISO 27001, DSPT level, Cyber Essentials Plus)?

We have all these

- [ ] Clinical safety process owner and cadence for DCB0129/DCB0160 artifacts?

I am the CSO and we will follow the DCB0129 process for clinical safety, and DCB0160 for software development lifecycle. We will create the necessary artifacts and maintain them according to the required cadence.

- [ ] Is MHRA medical device classification expected at v1 or phased post-v1?

Post v1

## 3) Product Scope And Rollout

- [ ] Initial deployment model:
  - Options: Single trust / Multiple trusts in one ICS / Multi-ICS from day one
- [ ] Which wards/clinical settings are in pilot scope?
- [ ] Must all `Should` items be delivered for first procurement milestone, or `Must` only?
- [ ] Are any local requirements already known that should be added as trust-specific overlays?

## 4) Clinical Configuration Governance

- [ ] Who owns approval for updates to scoring/escalation/sepsis guidance content?
- [ ] What is the required turnaround SLA for national guidance updates?
- [ ] Can trusts override non-`Must` configuration values locally (yes/no; with what controls)?
- [ ] Do you require centrally signed version bundles for all rule/config changes?

## 5) Integration And Data Exchange

- [ ] Which systems must receive outbound escalation alerts?
  - Options: EPR tasks, paging, Teams/secure messaging, email, SMS, other
- [ ] Is bi-directional write-back to EPR mandatory at first release?
- [ ] What reporting destinations are required for national/statistical submissions?
- [ ] Do you require PDF export only, or both PDF + FHIR document bundles?

## 6) Identity, Access, And Audit

- [ ] Source of user roles/authorizations:
  - Options: EHR context only / External IAM / Hybrid
- [ ] Any mandatory break-glass workflow for emergency overrides?
- [ ] Required audit retention period(s) by data type?
- [ ] Do you need patient-facing access to any PEWS outputs in phase 1?

## 7) Operations, SLOs, And Support

- [ ] Target SLOs for uptime and latency (e.g. 99.9%, P95 under N ms)?
- [ ] Target RTO/RPO for major incidents?
- [ ] Support model expected at go-live (hours, on-call, escalation path)?
- [ ] Preferred deployment strategy (canary, blue-green, phased trust waves)?

## 8) Training And Adoption

- [ ] Training model to use for v1:
  - Options: Train-the-trainer only / Train-the-trainer + floor-walking / Direct clinician sessions
- [ ] Is a dedicated training environment with synthetic data mandatory before UAT?
- [ ] Which clinical champions/teams will sign off readiness for rollout?

## 9) Explicit Spec Anomalies To Confirm

- [ ] Confirm duplicate IDs intentionally retained in source spec (`C16.3`, `C16.4` appear in two sections).
- [ ] Confirm mismatched MOSCOW entries are intentional and should remain as authored:
  - `C11.4` (text says should, MOSCOW is Must)
  - `T4.9` (text says should, MOSCOW is Must)
- [ ] Confirm whether typo/grammar corrections in guidance/spec text are acceptable in generated user-facing content, or if wording must remain source-exact.
