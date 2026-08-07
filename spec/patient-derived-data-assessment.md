# Patient-derived ED data assessment

Status: source retained locally and gitignored; public replacement with independently generated synthetic fixtures agreed 2026-08-06.

## Resource provenance and status

The project received an ED observation spreadsheet that had direct identifiers removed before receipt. It was processed locally into `dummy-pews-data/ed-attendance-timeseries.json` using scripts in the same gitignored directory. The source and every patient-derived intermediate remain outside version control and must be treated as potentially identifiable health data.

The processed resource was useful for understanding the shape and sparsity of real ED observations. It will not be published, shipped with the component, loaded by the public demo, or used as a source of one-to-one transformed public fixtures. Public demo and test cases will instead be independently generated from aggregate clinical constraints and reviewed narrative archetypes.

This decision follows D1 in [`decisions.md`](./decisions.md). Small random changes to measurements do not turn longitudinal patient-derived data into synthetic data because timestamps, trajectory shape, event ordering, rare combinations, and relationships between variables remain linkable.

## Cohort shape

Analysis on 2026-08-06 found:

- **4,888 attendance episodes.** These are not provably 4,888 unique patients because identifiers needed to detect repeat attendance had already been removed.
- **8,810 observations.** Each JSON observation corresponds to one processed source row.
- **1.80 observations per attendance on average.**
- **2,896 attendances (59.25%)** contain one observation.
- **1,031 attendances (21.09%)** contain two observations.
- **499 attendances (10.21%)** contain three observations.
- **462 attendances (9.45%)** contain four or more observations.
- The maximum is **16 observations** in one attendance.

Full observation-count distribution:

| Observations in attendance | Attendances | Percentage |
| ---: | ---: | ---: |
| 1 | 2,896 | 59.25% |
| 2 | 1,031 | 21.09% |
| 3 | 499 | 10.21% |
| 4 | 233 | 4.77% |
| 5 | 111 | 2.27% |
| 6 | 52 | 1.06% |
| 7 | 31 | 0.63% |
| 8 | 12 | 0.25% |
| 9 | 8 | 0.16% |
| 10 | 8 | 0.16% |
| 11 | 3 | 0.06% |
| 13 | 2 | 0.04% |
| 16 | 2 | 0.04% |

The distribution supports the ED feedback that many attendances have few recorded observation rounds. The fixed time-window selectors can accommodate frequent chart consultation without introducing a separate ED scoring or chart variant.

## Existing processing

The local scripts already apply meaningful minimisation:

- Administrative, diagnosis, and location fields are excluded from the open-test-harness extraction.
- Attendance identifiers are replaced with sequential surrogate identifiers.
- Observation times are rounded to 30-minute intervals.
- Respiratory rate is rounded to multiples of 5, heart rate to multiples of 15, oxygen saturation to multiples of 10, and temperature to whole degrees.
- AVPU and respiratory-distress categories are coarsened.
- Some combinations of age group, oxygen saturation, and heart rate occurring fewer than six times are suppressed.

These measures reduce disclosure risk but do not establish anonymity for public release:

- The JSON converter defaults to rounded real observation times where available.
- Observations remain linked into their original attendance trajectories.
- Observation count, ordering, intervals, score sequence, support changes, missingness, and rare clinical events may support singling out or linkage.
- Suppression is performed on selected row-level quasi-identifiers, not on uniqueness of the complete longitudinal sequence.
- A person familiar with an attendance may have substantially more auxiliary knowledge than a member of the general public.

The resource is therefore treated as patient-derived and identifiable despite its filename and existing transformations.

## Synthetic replacement strategy

Do not create and publish one narrative or fictional record for every source attendance. That would preserve one-to-one lineage, cohort membership, and potentially recognisable rare stories.

Use the source only in the controlled environment to derive broad, many-to-one constraints such as:

- Age band.
- Observation-count bucket: 1, 2, 3, or 4+.
- Stable, improving, deteriorating, recovering, or fluctuating trajectory.
- Maximum numeric PEWS band.
- Oxygen support introduced, increased, reduced, or absent.
- Blood pressure obtained, attempted, or unavailable.
- Common missingness patterns.
- Presence of an explicit clinician, carer, or specific-concern trigger.

Merge or suppress rare combinations before narrative authoring. Clinicians should then write a small set of archetypal stories from those aggregate constraints, not summaries of individual attendances. A diagnosis must be independently assigned from a clinically reviewed fictional list or omitted; it must not be inferred from a source attendance.

Generate new fixtures with:

- Fictional names and identifiers.
- Independently chosen dates of birth consistent with the intended age band.
- Unrelated synthetic dates, start times, observation intervals, and admission durations.
- Newly sampled measurements constrained by the canonical NPEWS scoring bands and the intended narrative.
- Newly selected categorical observations, support transitions, skip reasons, and escalation triggers.
- Reproducible generator seeds and documented expected scores.
- Clinical review for plausibility and automated verification against the scorer.

The public set should optimise coverage rather than reproduce cohort size. A reviewed matrix of approximately 20-50 scenarios can cover age bands, score boundaries, sparse ED attendances, deterioration, recovery, missing measurements, modality changes, birthday transitions, and non-score escalation triggers more effectively than thousands of transformed records.

Before publication, check that no generated trajectory is unusually similar to a source trajectory and document the provenance and review of every fixture family. This similarity check is an additional safeguard, not evidence that a one-to-one transformation would be acceptable.

## Controlled local robustness testing

There is value in running the patient-derived JSON through the chart locally, provided the data controller permits that use and the process remains inside the controlled environment. It can expose assumptions that the small authored demo catalogue may miss:

- Single-observation and very sparse attendances.
- Missing blood pressure and other partial observation rounds.
- Unknown, legacy, malformed, or empty categorical values.
- Unsupported units or chart-type mappings.
- Long or irregular sequences.
- Performance and lifecycle behaviour across thousands of attendances.
- Cases where missing data is silently treated as a zero contribution.

The local exercise should use a purpose-built ignored harness with these constraints:

- Do not copy source rows into tracked tests, snapshots, traces, screenshots, logs, issues, or CI artifacts.
- Do not send the data to hosted services, public CI, browser telemetry, or third-party debugging tools.
- Assign any fields required only by the component, such as DOB, from independently generated values consistent with a broad age band.
- Report only aggregate counts of successful renders, validation failures, and error categories; suppress small result cells where necessary.
- Treat source EWS totals as contextual data, not as an authoritative NPEWS oracle, unless their algorithm and provenance are independently established.
- Convert every useful defect or edge case into a new independently authored minimal synthetic fixture before committing a regression test.
- Review and remove transient local output when the assessment is complete.

This local compatibility exercise would improve robustness evidence but would not make the source dataset publishable and would not replace browser tests against the synthetic scenario catalogue.

## Governance references

- [ICO anonymisation guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/)
- [ICO guidance on effective anonymisation, singling out, linkability, and the motivated-intruder test](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/how-do-we-ensure-anonymisation-is-effective/)
- [NHS ISB1523 Anonymisation Standard for Publishing Health and Social Care Data](https://digital.nhs.uk/data-and-information/information-standards/information-standards-and-data-collections-including-extractions/publications-and-notifications/standards-and-collections/isb1523-anonymisation-standard-for-publishing-health-and-social-care-data)

The ICO guidance was under review following the Data (Use and Access) Act when this assessment was written. Any future disclosure assessment must use the current guidance and be reviewed by the appropriate information-governance and data-protection roles.
