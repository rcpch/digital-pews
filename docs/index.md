# Digital PEWS documentation

Digital PEWS is an open-source scoring and observation-chart component for integration into a wider clinical system. It is not a complete PEWS solution or an observation-entry system. **No clinically approved release has been designated.**

This Markdown entry point is the initial documentation home. A Zensical site is planned under roadmap R66; no separate site is built or deployed yet.

## Try and integrate the component

- [Project overview and quick start](../README.md)
- [Online demonstration with synthetic data](https://rcpch.github.io/digital-pews/)
- [Patient and observation data contract](../spec/data-model.md)
- [FHIR adapter](../spec/fhir.md)
- [Product boundary and host responsibilities](../spec/product-boundary.md)
- [Clinical safety status and limitations](../SAFETY.md)

## Clinical references and development

- [Specification index](../spec/README.md)
- [NHS source register and local ED charts](../reference-sources/README.md)
- [ED-PEWS scope, initial findings and implementation gates](../spec/ed-pews.md) - references collected; ED support is not yet implemented
- [Decision log](../spec/decisions.md)
- [Roadmap](../spec/roadmap.md)

## Planned documentation site

Use Zensical, following house style, with task-oriented navigation for integrators, clinical reviewers and contributors. Retain one authoritative copy of specifications, safety records and source provenance rather than maintaining a second set of clinical rules in `docs/`.

The existing GitHub Pages workflow deploys the demo at the site root. A future Zensical build should be assembled into that same Pages artifact, for example under `/docs/`, with reciprocal links. Two independent Pages deployments would replace each other's content, so do not add a competing docs-only deployment. Preserve existing demo URLs and keep docs tooling separate from the framework-neutral, build-free `chart/` runtime.
