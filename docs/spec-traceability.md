# Spec Traceability

This document maps source specification files to the initial implementation modules.

| Spec | Module |
| --- | --- |
| `spec/npews-scoring.md` | `packages/clinical-engine/src/scoring.ts` |
| `spec/observation-options.md` | `packages/clinical-engine/src/scoring.ts` |
| `spec/escalation.md` | `packages/clinical-engine/src/escalation.ts` |
| `spec/sepsis-guidance.md` | `packages/clinical-engine/src/sepsis.ts` |
| Roadmap §2 — SMART launch flow | `packages/smart/src/launch.ts` |
| Roadmap §2 — SMART redirect + session bootstrap | `packages/smart/src/redirect.ts` |
| Roadmap §2 — FHIR/SMART metadata discovery | `packages/smart/src/discovery.ts` |
| Roadmap §2 — Token lifecycle (refresh, expiry) | `packages/smart/src/token.ts` |
