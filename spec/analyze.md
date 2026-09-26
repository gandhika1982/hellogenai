# Task Analysis: Jira Sprint Progress Dashboard

**Inputs reviewed:** [`constitution.md`](./constitution.md), [`specification.md`](./specification.md), [`clarify.md`](./clarify.md), [`plan.md`](./plan.md), and [`tasks.md`](./tasks.md).
**Scope:** Historical complexity, implementation risks, dependency order, and cross-document gaps for the original full-stack task list. Implementation has since begun; the current mock-data prototype tasks are listed in [`tasks.md`](./tasks.md).

> **Roadmap update:** The full-stack, 19-task assessment below is retained as historical analysis. The active prototype roadmap is now the four-task mock-data plan in [`plan.md`](./plan.md) and [`tasks.md`](./tasks.md); backend/API/database work beyond the already completed scaffold is deferred.

## Executive summary

- The plan has four phases and 19 tasks. All declared task dependency IDs resolve.
- The mock-data frontend is intentionally not dependent on the optional backend/database phase. Preserve that separation; BE-01 and BE-03 can proceed independently from FE-01.
- The lowest-risk useful early work is FE-01 and FE-03: they create the independently runnable frontend and a reusable normalized contract. BE-01 is a contained optional package scaffold, but its tooling details need a decision before implementation.
- The highest technical risk is the integrated API/database/UI work (IT-01 through IT-04), because the current prototype has no application packages or runtime tests and the tasks leave some API and schema choices open.

## Per-task assessment

Complexity is estimated for the task as currently written, not for hypothetical future Jira integration.

| Task | Complexity | Key risks | Declared dependencies | Assessment |
|---|---|---|---|---|
| **BE-01 — Initializing the backend package** | Low | Package/module format and exact `typecheck`/`build` commands are unspecified; Node/npm availability and package registry access must be verified. Keep this scaffold minimal and avoid beginning BE-02's server behavior. | None | Low risk and bounded; optional foundation. |
| **BE-02 — Creating the Express API skeleton** | Medium | Middleware ordering and error semantics can diverge from IT-01; `/health` is outside `/api/v1` and should be documented as an intentional operational endpoint. | BE-01 | Implement after the package compiles. |
| **BE-03 — Configuring optional PostgreSQL 15** | Medium | Existing Compose has placeholder frontend/backend services under a `scaffold` profile. Profile semantics, port/volume naming, health check, and environment variable names need consistency. Avoid committing credentials or making the database default. | None | Independent of BE-01; useful parallel foundation if Docker is available. |
| **BE-04 — Defining and migrating the normalized schema** | High | Exact constraints/indexes, issue identity across sprint snapshots, active-sprint uniqueness, delete/update behavior, timestamp ownership, and safe migration tooling are not fully specified. Schema decisions affect repository and API code. | BE-03 | Resolve the schema decisions before writing migrations. |
| **BE-05 — Seeding synthetic backend data** | Medium | Idempotency strategy and whether seed data is migration-managed or a separate command are unspecified. Seed must accurately represent current scope and retained removals. | BE-04 | Keep separate from frontend fixtures; never make it an MVP prerequisite. |
| **FE-01 — Initializing the React/Vite frontend** | Low | Package manager/runtime version enforcement and test/lint script details are unspecified. Node 24 must be usable with the chosen Vite 5 version. | None | Low risk, high gain: establishes the independently runnable user-facing package. |
| **FE-02 — Establishing frontend feature structure and route** | Medium | “One route” does not specify a router library or whether a simple path switch is sufficient. Overengineering routing adds dependencies without an MVP need. | FE-01 | Choose the smallest approach compatible with one dashboard route. |
| **FE-03 — Defining normalized frontend types and provider contract** | Low | Avoid deriving domain design from hypothetical Jira payloads. Clarify whether computed health is in `DashboardSnapshot` or derived from raw normalized data. | FE-01 | Low risk, high gain; unblocks domain work and the mock provider. |
| **FE-04 — Adding the deterministic mock provider** | Medium | Fixture dates can age and alter health unexpectedly; ensure stable test dates or inject an as-of date. Align the fixture with null estimates, removed scope, and sub-task semantics. | FE-03 | Needed before end-to-end dashboard features; keep deterministic. |
| **FT-01 — Calculating current-scope issue totals** | Medium | Null, zero, removed work, sub-tasks, and Done-category semantics must remain distinct. Numeric point precision/allowed fractional values are not fixed. | FE-03 | High-value pure logic; add exhaustive unit cases before UI coupling. |
| **FT-02 — Calculating weekday progress and sprint health** | High | Date-only parsing/timezones, inclusive boundaries, pre-start behavior, and zero-weekday sprint behavior need exact outcomes. Division by zero and off-by-one errors can alter risk status. | FT-01 | Resolve boundary rules and test them before UI integration. |
| **FT-03 — Rendering the sprint summary** | Medium | UI can duplicate domain math or obscure insufficient-estimate state; provider loading/error state only exists for future API mode. | FE-02, FE-04, FT-01, FT-02 | Depends on the core contract and calculations; test semantic output. |
| **FT-04 — Showing flagged blockers** | Low | Assignee and estimate nulls need explicit copy; blocker membership should be restricted to current scope if that is the intended meaning. | FE-02, FE-04 | Relatively isolated feature, good early gain after the shell and fixture. |
| **FT-05 — Summarizing scope changes** | Medium | Added/removed totals must preserve unknown impacts and not double-count removed issues in current scope; event ordering/timezone needs stable behavior. | FE-02, FE-04, FT-01 | Requires a precise distinction between history and current-scope calculation. |
| **FT-06 — Completing responsive accessibility states** | High | WCAG 2.2 AA is broader than the listed checks; visual/keyboard verification needs a running UI and preferably automated accessibility checks. | FT-03, FT-04, FT-05 | Run iteratively during feature work, not only as a final gate. |
| **IT-01 — Implementing the normalized read-only dashboard API** | High | Endpoint overlaps (`/dashboard/active` and team active sprint), pagination, response envelopes, date serialization, CORS, and whether metrics are computed by API or client are unresolved. | BE-02, BE-04, FE-03 | Requires a finalized contract and API tests; no Jira calls. |
| **IT-02 — Reading normalized data from PostgreSQL** | High | Must preserve schema invariants, transaction/consistency behavior, and test isolation. Depends on a seed, which can obscure whether repository tests independently create fixtures. | BE-04, BE-05, IT-01 | Build after schema and API DTOs are agreed; keep repository tests isolated. |
| **IT-03 — Adding a selectable API provider** | High | Provider selection/configuration mechanism, runtime response validation, timeout/cancellation behavior, and permission-denied semantics are underspecified. | FE-04, IT-01 | Keep mock as default and treat API failures explicitly. |
| **IT-04 — Running release validation** | Medium | It is a broad final task; if accessibility, test automation, or Compose verification is postponed, failures may be expensive to repair. | FT-06, IT-02, IT-03 | Use as release gate, but validate continuously in earlier tasks. |

## Dependency and execution review

### Dependency graph findings

- The declared dependencies are acyclic and reference existing task IDs.
- `BE-01` and `BE-03` are independent optional backend foundations; `FE-01` is independent and should not wait for either.
- `FE-03` follows `FE-01`, then enables `FE-04` and `FT-01`. `FT-02` correctly follows `FT-01`.
- The UI features depend on the frontend shell/mock provider and the domain outputs they consume.
- IT-02 declares a dependency on IT-01, although repository access is a lower-level API implementation dependency in typical layering. This order is acceptable if IT-01 defines the DTO/contract first; implement in slices so API handlers can be wired after the repository exists.
- IT-04 depends on all relevant integration work, but its checks should run throughout the preceding tasks.

### Recommended execution order

1. **FE-01 → FE-03**: low-risk, high-gain setup and normalized contract; independently runnable and establishes the mock MVP path.
2. **BE-01 and BE-03**: optional backend package and opt-in PostgreSQL Compose foundation can proceed in parallel, without blocking frontend work.
3. **FE-02 → FE-04**: establish the route/shell and deterministic mock provider.
4. **FT-01 → FT-02**, then **FT-03**; implement **FT-04** and **FT-05** after the shell/fixture, with accessibility checks performed during each feature; finish with **FT-06**.
5. **BE-04 → BE-05**, then **BE-02/IT-01/IT-02** in contract-first slices. Avoid building persistence ahead of resolved schema/DTO choices.
6. **IT-03 → IT-04**: wire the optional API provider and run full release validation.

The task list says “Implement task 1,” which is **BE-01** in document order. Before beginning it, confirm its package conventions and boundaries. If preserving the mock-data MVP as the earliest runnable outcome is the priority, FE-01 is a reasonable first implementation instead, but that would be a deliberate deviation from “task 1.”

## Gaps, contradictions, and missing artifacts

### Resolved by `clarify.md`

- **Backend/database versus mock-data MVP:** Constitution/spec say backend and PostgreSQL are optional, while the requested Phase 1 is explicitly backend-first. Preserve the Phase 1 work as opt-in scaffolding; do not make it a frontend prerequisite.
- **Product naming and scope:** “Jira/Confluence automation” could imply Confluence features, but the product spec is a Jira sprint dashboard. Confluence is explicitly out of scope.
- **Jira integration:** Live reads, credentials, authentication, refresh, and mutations remain gated/out of scope; the future API is read-only and normalized.
- **Health, blocker, scope, synthetic-data, and date/timestamp semantics:** Most core behavior is recorded in `clarify.md`; implementation should use those decisions rather than inventing rules.

### Still needs a decision before affected implementation

1. **BE-01/FE-01 tool scripts:** Define exact package scripts (`dev`, `build`, `typecheck`, `test`, `lint`) and whether the smallest initial package must include test/lint tooling. The backlog describes Vitest for frontend; backend test/lint tooling is not specified.
2. **FE-02 routing:** Choose a minimal route implementation or name/pin a routing library. Only one screen is in scope.
3. **FT-02 date edge cases:** Specify ideal/elapsed behavior before sprint start and the explicit result for a sprint containing zero weekdays. Clarify how invalid dates are surfaced from the pure function.
4. **FT-01 estimate domain:** Decide whether story points may be fractional and their precision. Current rules specify non-negative values but not scale/rounding.
5. **FT-04 blocker scope:** State whether removed/out-of-scope flagged issues appear in blocker details; totals and current-sprint semantics suggest blockers should be current-scope only.
6. **BE-04 schema:** Define stable uniqueness for imported Jira keys/snapshots, issue deletion policy, exact active-sprint uniqueness rule, and migration tool/version. Do not invent these while writing a persistent schema.
7. **IT-01 API contract:** Clarify whether `/dashboard/active` is an alias for the team endpoint, whether response data is wrapped, pagination, health-metric ownership, and CORS policy.
8. **IT-03 provider selection:** Define whether the provider is selected at build time or runtime. For the prototype, a development-only configuration with mock as default is the least complex option, but should be made explicit.
9. **FT-06/IT-04 evidence:** Name the accessibility validation tooling and required viewport/browser matrix, and define the test report artifact/location.
10. **Container/package details:** Define Compose service ports/health checks and how per-package Node versions are enforced. The constitution lists target versions, but no `.nvmrc`/equivalent or exact npm enforcement mechanism is specified.

These open details do not prevent an isolated BE-01 package scaffold if that task is limited to a manifest, lockfile, TypeScript config, placeholder source entry, and minimal build/type-check scripts. They must be settled before tasks that depend on the corresponding behavior or schema.

## Task 1 implementation gate

**Historical task 1:** BE-01 — Initializing the backend package. This task was implemented and committed as `42cacc4`.

BE-02 was subsequently approved, implemented, and committed as `37e2325`; its health and structured-404 responses were verified over HTTP.

The next active prototype task is MVP-01 in [`tasks.md`](./tasks.md). The old full-stack task list is superseded for prototype execution.
