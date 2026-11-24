# Altair backend module map

Design record for [ALT-2](https://linear.app/userelay/issue/ALT-2). Paths below are relative to `apps/api`.

## Requirements and current implementation

[Altair: Architecture](https://docs.google.com/document/d/1eg-faJwPKqykjU6tXPdWxZx-7z6gaKjOcaBWYOCXE6g/edit) assigns REST and tenant authorization to the NestJS modular monolith. PostgreSQL through Prisma owns durable state. BullMQ and Redis schedule work for one standalone worker with Metrics, Regression, Investigation and Recovery processors. Next.js reads results through OpenAPI-derived contracts.

[Altair MVP Specification](https://docs.google.com/document/d/1OR2I0BvyziBWrrJjLEpeGJp2Mixy3WdodBTXo8I9A4s/edit) limits the first release to GitHub deployments, CloudWatch evidence and human release decisions. The table maps each capability to its intended owner and the API implementation observed during this audit.

| MVP capability                                   | Intended implementation                                                                                                                                                              | Present in API                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Connect a repository/environment and AWS service | Resolve GitHub installation, organization and monitored service. Use scoped read-only STS for CloudWatch.                                                                            | Neither connector nor service configuration exists.                                   |
| Ingest deployment history                        | Verify GitHub delivery and persist commit, actor, timestamps, status and deployment URL.                                                                                             | Only a greeting is routed.                                                            |
| Collect telemetry and run deterministic demos    | CloudWatch and seeded mock providers return the same observation contract for bounded dimensions and windows, including alarm evidence.                                              | Observe instruments the API itself. Customer telemetry and mock providers are absent. |
| Detect a regression and track recovery           | Compare persisted post-deploy samples with a deploy-relative baseline and configurable thresholds. Record sustained breaches and recheck recovery.                                   | No observations, threshold evaluator or incident lifecycle.                           |
| Produce an investigation                         | Assemble deployment, timestamps, metrics, alarms and available logs. Validate structured AI findings and cite at least two artifacts per conclusion. Preserve uncertainty.           | No investigation service or evidence store.                                           |
| Show a timeline and capture human disposition    | Serve linked deployments, signals, incidents and investigations. Accept confirmed, dismissed or needs-further-investigation decisions. Production changes and rollback are excluded. | No domain read API or disposition endpoint.                                           |

Baseline evidence: [bootstrap](src/main.ts) starts AppModule under `/api`; [AppModule](src/app.module.ts) imports Observe and registers the [controller](src/app.controller.ts) and [greeting service](src/app.service.ts). The [HTTP test](test/app.e2e-spec.ts) exercises that greeting. None of the six domain modules is registered.

## Six public boundaries

The following operations describe proposed service contracts. Names are illustrative. Callers receive domain DTOs and use the owner's public service for every read or write.

| Module              | Owns                                                                                                                                               | Expected interface                                                                                                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth                | API principal and verification of the short-lived internal identity token issued through the web session bridge. Better Auth owns the web session. | Verify token → principal or authentication failure. A principal alone grants no organization access.                                                                                                                   |
| Organizations       | Tenant identity and membership                                                                                                                     | Require membership(principal, organization ID) → authorized tenant context or denial.                                                                                                                                  |
| GitHub Integrations | GitHub App installation binding, selected repository/environment and signed delivery validation                                                    | Accept raw delivery and signature → verified event. Resolve its trusted installation binding and monitored service, then submit a normalized deployment to Deployments. Reject invalid or unmapped deliveries.         |
| Deployments         | Deployment identity, source metadata, service association, history and delivery deduplication                                                      | Record verified deployment → stable deployment ID. Get deployment or list history by organization and service → deployment DTOs.                                                                                       |
| Metrics             | Normalized observations, alarm evidence, sample windows and the provider-independent MetricsProvider described as Monitoring in Architecture       | Collect(service configuration, window) through CloudWatch or mock → normalized samples. Persist and query evidence by organization, service, deployment and window.                                                    |
| Incidents           | Regression decision, threshold/baseline evidence links, incident lifecycle, recovery and human disposition                                         | Evaluate deployment evidence → incident ID for a sustained breach. Recheck recovery, record disposition, and read incident timeline by tenant. Preserve the distinction between observed recovery and a human verdict. |

## Dependency direction and workflow

Arrows mean caller → public service. Among the six modules the edges are GitHub Integrations → Deployments, Incidents → Deployments, and Incidents → Metrics. Auth and Organizations are independent: the protected REST boundary calls Auth first, then Organizations, and passes the authorized context to the operation. The webhook authenticates through its signature and stored installation binding. Deployments never calls back into GitHub, and Metrics never calls Incidents.

Architecture also assigns responsibilities adjacent to these six. Services owns monitored-service configuration and thresholds; Integrations owns AWS connection metadata alongside GitHub installation metadata. Metrics consumes the AWS connection settings through a read interface. Keep that interface independent of the GitHub delivery handler. Investigations reads Incidents, Deployments and Metrics, assembles evidence and owns validated OpenAI results. The dashboard read boundary composes these services, so Incidents has no reverse dependency on Investigations.

After a deployment write commits, publish its monitoring job through Jobs. Jobs owns scheduling and publication. Thin worker processors call the relevant public services in order: collect observations, evaluate regression, investigate an evidenced incident, and periodically recheck recovery. Follow-up jobs carry tenant-scoped IDs. Persist workflow progress and use stable keys so retries can resume after publication failures without duplicating records. HTTP requests return without waiting for the worker.

## Shared concerns and verification

- Scope every tenant read and write by organization, including worker lookups. Validate API inputs, integration responses and AI outputs. Keep credentials server-side, redact sensitive logs and prompts, and expose DTOs rather than Prisma records.
- Correlate deliveries, deployments, jobs, incidents and investigations. Bound retries with backoff, surface terminal failures, and persist actionable status for the dashboard.
- Future verification uses mocked providers and seeded fixtures. Cover authorization, duplicate delivery, thresholds, recovery, citations and dispositions. The MVP targets at least 80% seeded regression detection and an initial investigation within five minutes of evidence arrival. The separate engineering target is 80% business-logic test coverage.
- ALT-2 verification is a source and design review. The edges above have no return path to their caller. Worker orchestration and dashboard composition sit outside the domain modules.

## File disposition

This design adds only `MODULES.md`. No implementation files are required for ALT-2. When a vertical slice needs a Nest registration, candidate files are `src/auth/auth.module.ts`, `src/organizations/organizations.module.ts`, `src/integrations/github/github.module.ts`, `src/deployments/deployments.module.ts`, `src/metrics/metrics.module.ts` and `src/incidents/incidents.module.ts`. These are deferred locations, not existing modules or a commitment to scaffold all six together.
