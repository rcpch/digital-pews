# Integrate the chart

Digital PEWS is a framework-neutral `<npews-chart>` Web Component. The runtime uses native HTML, CSS and JavaScript modules, without a build step or runtime framework dependency. Zensical builds this website, not the chart.

## Start with the component contract

Read the [product boundary](../spec/product-boundary.md), [patient and observation data model](../spec/data-model.md) and [clinical safety file](../SAFETY.md) before integrating. The embedding application owns observation entry, patient identification, validation, records and operational escalation.

```html
<script type="module" src="./chart/npews-chart.js"></script>
<npews-chart id="pews"></npews-chart>
```

Assign `{ patient, observations }` to the element's `.data` property. Supply raw observations rather than calculated scores. Use `.options` for presentation settings, not clinical-profile selection. See the [project overview](../README.md) for an example and supported options, and the [minimal host example](../chart/example.html) in the repository.

**Current limitation:** only one chart per document is supported. The demonstration pages use an iframe to isolate the component's styles, IDs and lifecycle from the documentation shell.

## Interoperability and assurance

- [FHIR adapter and conformance](../spec/fhir.md)
- [Requirements allocation and evidence](../spec/requirements-traceability.md)
- [ED-PEWS development scope](../spec/ed-pews.md) - not implemented yet
- [Roadmap](../spec/roadmap.md)
