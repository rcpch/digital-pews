# Contributing to Digital PEWS

We welcome feedback and contributions from clinicians, developers, and anyone with an interest in improving paediatric early warning. You do not need to be a software developer to contribute.

## How to give feedback

### Public issues (preferred for most feedback)

The best way to report a bug, request a feature, or share clinical feedback is through our [GitHub Issues](https://github.com/rcpch/digital-pews/issues).

1. Go to <https://github.com/rcpch/digital-pews/issues>
2. Click **New issue**
3. Choose the **Bug report** or **Feature request** template
4. Fill in as much detail as you can - the templates will guide you

You will need a free GitHub account. If you cannot create one, see the private reporting route below.

### Private reporting (for sensitive clinical or security issues)

For issues that could affect patient safety, clinical workflow, or security - or that must not be discussed publicly - email <pews@rcpch.ac.uk> with a description of the concern. Do not post patient-identifiable data in public issues.

## Before you ask for a new feature

Please read the following first:

- **[README.md](README.md)** - how the chart works and what it does today
- **[spec/README.md](spec/README.md)** - the specification index, including the NHS SPOT/NPEWS requirements we are built to
- **[spec/roadmap.md](spec/roadmap.md)** - what is planned and what is already done

The chart is based on the **NHS National Paediatric Early Warning System (NPEWS)** specification. If you are asking for something that is not supported by the national spec, we may not be able to add it without clinical governance approval.

If you are asking for the chart to display additional data from your EPR (Electronic Patient Record), please tell us what the data source is - which FHIR resource, observation code, or EPR field the data comes from. This helps us assess whether it can be mapped and whether it is in scope for the national spec.

## For developers

### Running the chart locally

```bash
s/up          # demo harness at http://localhost:8000
s/up demo     # same thing, explicit
s/up smart    # SMART-on-FHIR sandbox at http://localhost:4013
```

ES modules cannot be loaded over `file://` - you must serve the page over HTTP. See `chart/example.html` for details.

### Before submitting a pull request

```sh
npm test
npm run generate:scoring:check
```

Keep pull requests focused on one change. Explain the rationale and link to any relevant issue.

## Licence

By contributing, you agree that your contribution is licensed under this repository's licence.