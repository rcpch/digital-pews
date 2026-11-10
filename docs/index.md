# Digital PEWS documentation

Digital PEWS is an open-source scoring and observation-chart component for integration into a wider clinical system. It is not a complete PEWS solution or an observation-entry system. **No clinically approved release has been designated.**

Choose a [demonstration scenario](demo/index.md) to explore the chart with synthetic data, or start with the [integration guide](integration.md). The chart remains an independent, framework-neutral component; Zensical provides this site's header, navigation and search.

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

## About this documentation

The site uses Zensical, with navigation for integrators, clinical reviewers and contributors. Specifications, safety records and source provenance are staged from their authoritative repository files rather than maintained twice.

The existing demo URLs remain available at the site root; documentation is built under `/docs/` in the same Pages artifact. Scenario pages preserve the documentation header and sidebar while isolating the chart in an iframe. [Preview and build instructions](../s/README.md) describe the documentation-only toolchain.
