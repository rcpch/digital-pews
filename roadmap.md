# Digital PEWS Implementation Roadmap (TypeScript + SMART on FHIR)

The plan starts with repo hygiene and setup, and ends with full scaled deployment.

## 0) Delivery Framework And Repo Hygiene

- [ ] Create monorepo structure (`apps/web`, `apps/api`, `packages/*`, `infra/*`, `docs/*`)
- [ ] Add baseline standards: EditorConfig, Prettier, ESLint (TypeScript strict), commit linting
- [ ] Add CODEOWNERS, branch protections, PR template, issue templates, ADR template
- [ ] Add security defaults: secret scanning, dependency scanning, license policy checks
- [ ] Add `docs/spec-traceability.md` linking spec files to implementation modules
- [ ] Define Definition of Done: tests, lint, typecheck, security checks, docs updates

## 1) Core Tooling And TypeScript Foundation

- [ ] Initialize TypeScript project with strict mode (`noImplicitAny`, `exactOptionalPropertyTypes`)
- [ ] Select package manager (`pnpm` recommended) and lock Node LTS runtime
- [ ] Configure test stack: Vitest/Jest (unit), Playwright (e2e), contract tests
- [ ] Add OpenAPI generation and typed client generation for internal API contracts
- [ ] Add shared utility packages (`packages/config`, `packages/logger`, `packages/errors`, `packages/types`)

## 2) SMART-on-FHIR Architecture Baseline

- [ ] Implement SMART app launch flow (EHR launch + standalone launch)
- [ ] Implement SMART auth pages (`/launch`, `/redirect`) and session bootstrap
- [ ] Implement token lifecycle handling (access token refresh, rotation-safe handling)
- [ ] Implement FHIR capability discovery and SMART metadata discovery
- [ ] Support launch context (`patient`, `encounter`, `practitioner`) with graceful fallback
- [ ] Add audit-safe token storage strategy by deployment type (public vs confidential app)

Recommended libraries:

- `fhirclient` for SMART auth and launch flow
- `fhir-kit-client` for service-side FHIR REST operations
- `fhirpath` for rule evaluation and expression-based validation
- `jose` for JWT verification and cryptographic operations
- `zod` for runtime schema validation of app inputs and configs

## 3) Domain Model And Data Contracts

- [ ] Define internal canonical PEWS domain model (observations, score, escalation, guidance)
- [ ] Map FHIR resources to internal model (`Patient`, `Observation`, `Encounter`, `Practitioner`)
- [ ] Add versioned config schemas for scoring tables, options, guidance text, escalation rules
- [ ] Implement migration-capable config registry with effective dates and trust-specific overrides
- [ ] Define immutable audit events (who, what, when, why) for all data changes

## 4) Clinical Rules Engine (Scoring + Escalation)

- [ ] Build scoring engine from `spec/npews-scoring.md` for all age brackets (0-11m, 1-4y, 5-12y, 13-18y)
- [ ] Implement per-observation scoring with color bands (White/Yellow/Orange/Pink)
- [ ] Implement oxygen device override logic and oxygen modality switching logic
- [ ] Implement skipped-observation scoring behavior from `spec/observation-options.md`
- [ ] Implement escalation level computation from PEWS + specific concerns + intuition + carer input
- [ ] Implement escalation short-code output (`SC`, `CQ`, `CI`, `P`, `0`)
- [ ] Implement sepsis and septic shock escalation triggers from `spec/sepsis-guidance.md`

## 5) Observation Capture Workflow

- [ ] Implement full observation session flow with partial save and resume
- [ ] Support retroactive entry windows and explicit marking for already-escalated contexts
- [ ] Implement skip reasons per observation type with mandatory free-text when `Other`
- [ ] Implement correction/update/delete flow with full audit and reason capture
- [ ] Implement age-form switching and boundary age prompts
- [ ] Implement mandatory fields, optional fields, and no-observation pathways per spec

## 6) UI Implementation (From UI Spec)

- [ ] Implement charting with trend lines and observation markers (dot semantics)
- [ ] Implement non-continuous lines for skipped values and modality changes
- [ ] Implement zoom levels, quick ranges (Today/This Week/This Month), and jump-to-present
- [ ] Implement value visibility modes (chart + exact values)
- [ ] Implement escalation banners and in-flow break-out escalation actions
- [ ] Implement color-blind friendly mode and accessibility-compliant contrast/token system
- [ ] Implement responsive web UI for desktop/mobile clinical usage

## 7) Guidance Surfaces (Escalation, ISBAR, Sepsis)

- [ ] Add escalation guidance panels from `spec/escalation.md` by level (Low/Medium/High/Emergency)
- [ ] Add timing prompts for medical review and minimum observation frequency
- [ ] Add clinical intuition and carer-driven escalation option flows
- [ ] Add ISBAR guidance panel and one-click structured handover payload generation
- [ ] Add sepsis trigger checklist and contextual prompt behavior

## 8) Integrations And Interoperability

- [ ] Implement bidirectional EPR integration for patient/context loading and write-back
- [ ] Implement SMART/FHIR read-write patterns with robust retry/idempotency behavior
- [ ] Implement export to PDF and printable paper-like format for legal/review workflows
- [ ] Implement trust-to-trust and external care-setting data sharing interfaces
- [ ] Implement API endpoints for national/statistical reporting feed requirements

## 9) Security, Privacy, And Governance Controls

- [ ] Enforce encryption in transit (TLS modern standards) and secure cipher policy
- [ ] Enforce RBAC/ABAC role models for clinician, nurse-in-charge, outreach, admin users
- [ ] Implement immutable audit trail and operational event logs
- [ ] Implement retention, deletion, and right-to-be-forgotten workflows where legally applicable
- [ ] Implement data residency controls and deployment guardrails per governance requirements
- [ ] Prepare controls for ISO 27001, GDPR, DSPT, and medical device process alignment

## 10) Reporting, Analytics, And Operational Monitoring

- [ ] Build observation/decline/correction/escalation reports by clinician, ward, trust
- [ ] Build patient-level trend and episode review reports
- [ ] Build service-level dashboards (escalation rates, response timings, override rates)
- [ ] Add error budget/SLO dashboards and incident analytics
- [ ] Add configurable audit exports for compliance and procurement evidence

## 11) Non-Functional Requirements And Performance

- [ ] Define SLOs for latency, availability, throughput, and data durability
- [ ] Run load testing for peak concurrent ward operations and shift-change bursts
- [ ] Validate mobile/desktop performance budgets and chart rendering performance
- [ ] Validate graceful degradation under FHIR server slowness and partial outage
- [ ] Validate DR failover and RTO/RPO compliance targets

## 12) Verification And Test Program

- [ ] Unit tests for scoring thresholds and rule edge cases across all age bands
- [ ] Contract tests for FHIR payload mapping and EHR integration assumptions
- [ ] E2E tests for complete observation-to-escalation pathways
- [ ] Accessibility tests (WCAG 2.2 AA baseline) and keyboard-only workflow tests
- [ ] Security testing: SAST, dependency, DAST, auth misuse tests, token replay tests
- [ ] Clinical safety/UAT scripts aligned to each requirement family in `spot-npews-spec` and `spot-npews-ui-spec`

## 13) Clinical Safety And Change Control

- [ ] Establish DCB0129/DCB0160-aligned clinical safety case process
- [ ] Produce hazard log linked to implementation backlog items
- [ ] Validate mitigations for critical hazards (missed escalation, incorrect scoring, stale context)
- [ ] Establish change advisory process for scoring/guidance updates from NHS England
- [ ] Implement signed and versioned release packs for each guidance/scoring update

## 14) Environments, CI/CD, And Release Management

- [ ] Provision environment tiers: local, dev, test, UAT, pre-prod, prod
- [ ] Implement CI pipeline gates (lint, typecheck, tests, security, artifact signing)
- [ ] Implement CD with progressive rollout (canary/blue-green) and fast rollback
- [ ] Add feature flags for trust-specific rollout and phased enablement
- [ ] Add migration automation for config/version changes with rollback scripts

## 15) Training, Adoption, And Operational Readiness

- [ ] Build train-the-trainer content and simulation environment with synthetic patients
- [ ] Create role-specific SOPs (bedside nurse, outreach, responder, trust admin)
- [ ] Run pilot ward onboarding and superuser feedback loops
- [ ] Establish L1/L2/L3 support model and runbooks
- [ ] Prepare go-live command center checklist for launch week

## 16) Scaled Deployment Across Trusts/ICS

- [ ] Define tenancy model (single-tenant trust deployment vs shared multi-tenant platform)
- [ ] Parameterize trust-level configuration (forms, thresholds, escalation policy overlays)
- [ ] Add regional data partitioning, observability partitioning, and support boundaries
- [ ] Validate horizontal scaling and queue/worker autoscaling under national-level load assumptions
- [ ] Execute phased rollout by trust cohort with readiness scorecards
- [ ] Establish long-term governance board for updates, compatibility, and roadmap evolution

## 17) Final Milestone: Full Production Deployment At Scale

- [ ] All `Must` requirements in `spec/spot-npews-spec.md` and `spec/spot-npews-ui-spec.md` implemented and verified
- [ ] Cross-spec guidance content (`escalation`, `isbar`, `sepsis`, `observation-options`, `npews-scoring`) integrated and traceable
- [ ] Security/compliance evidence pack signed off by trust governance and clinical safety leads
- [ ] SLOs met for 30-day stabilization window
- [ ] Multi-trust rollout complete with operational handover and BAU ownership in place

## Traceability Completion Checklist

- [ ] `spot-npews-spec.md` coverage matrix complete (all C*/T* requirements mapped)
- [ ] `spot-npews-ui-spec.md` coverage matrix complete (all U* requirements mapped)
- [ ] `npews-scoring.md` thresholds fully represented in configuration + tests
- [ ] `escalation.md` flows and timings reflected in runtime decision support
- [ ] `observation-options.md` skip options and short-codes implemented
- [ ] `sepsis-guidance.md` prompts and pathways implemented
- [ ] `isbar-guidance.md` communication support integrated into escalation workflow
