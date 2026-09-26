# Implementation Plan: Jira Sprint Progress Dashboard

**Inputs:** [`constitution.md`](./constitution.md), [`specification.md`](./specification.md), and resolved decisions in [`clarify.md`](./clarify.md)
**Delivery rule:** The mock-data dashboard is the first usable product. The optional API/database foundation in Phase 1 must not block frontend work or make Docker a prerequisite for the MVP.

## Phase 1 — Backend setup: database and API skeleton

**Milestone 1: Optional local service foundation**

- Establish a separate backend Node.js/TypeScript package using the pinned versions.
- Add a minimal Express app, health endpoint, structured error handling, and `/api/v1` route mount.
- Add PostgreSQL 15 to Docker Compose as an optional local service with an untracked environment file and safe example configuration.
- Define and migrate the normalized schema for teams, sprints, issues, and scope changes; seed synthetic data only when the database is explicitly started.
- Keep this phase scaffold-only: do not add live Jira calls or require the service for the frontend MVP.

**Exit criteria:** Backend type-checks and its health endpoint works when explicitly started. PostgreSQL starts through Compose with synthetic development data and no committed secret. The frontend can still be run with backend and Docker stopped.

## Phase 2 — Frontend setup: UI skeleton and routing

**Milestone 2: Runnable mock-data application**

- Initialize the separate React 18/TypeScript/Vite frontend package using the pinned versions.
- Add one dashboard route/page shell, shared styles/design tokens, semantic layout, and visible focus treatment.
- Define Jira-independent domain types, a provider interface, and deterministic synthetic fixtures.
- Configure the mock provider as the default so the initial dashboard needs no API or database.

**Exit criteria:** Frontend starts and builds independently; the dashboard route renders the synthetic sprint and accessible section placeholders.

## Phase 3 — Feature implementation, one feature at a time

**Milestone 3: Sprint domain and summary**

- Implement pure issue filtering, point totals, unestimated counts, weekday progress, and health calculation.
- Add the sprint summary with dates, working days, actual/ideal progress, point totals, and explicit insufficient-estimate state.

**Milestone 4: Blockers and scope changes**

- Add the flagged-issue list and empty state.
- Add scope-change summaries/details, unknown-point presentation, and removal-history separation from current scope.

**Milestone 5: Accessible responsive experience**

- Complete keyboard-operable details, semantic headings/names, visible focus, non-color status communication, and narrow viewport layout.
- Test each feature as it is implemented; keep calculations independent from React and fixtures.

**Exit criteria:** All dashboard behaviors in the specification work using mock data, including empty and unknown states.

## Phase 4 — Integration and testing

**Milestone 6: Contract and persistence integration**

- Add the normalized read-only API implementation for the future backend increment.
- Add a frontend API provider behind the same provider interface while retaining mock-provider selection for development and tests.
- Verify database repository/migration mappings and API DTO semantics (`null` versus zero, Done category, current scope, and sub-task exclusion).
- Keep Jira integration disabled and absent until its discovery decisions are approved.

**Milestone 7: Release validation**

- Run domain unit tests, component tests, API/repository tests when those layers exist, type-check, lint, and production builds.
- Verify Docker Compose startup/shutdown and explicit API error states for the optional full-stack path.
- Manually review keyboard navigation, status without color, contrast, responsive layout, and synthetic-data provenance.

**Exit criteria:** The mock-data MVP is independently verified; the optional API/database path passes its focused checks when enabled; no test result or live integration is claimed unless actually run.

## Milestone ordering and gates

1. Phase 1 is an optional service scaffold. Its completion is not a dependency for Phase 2's mock-data path.
2. Phase 2 is the first end-user runnable increment.
3. Within Phase 3, domain calculations precede UI features that consume them; blocker and scope details follow the summary.
4. Phase 4 API/database integration depends on the stable domain/provider contract. Jira work remains a separate, explicitly gated future project.

## Not planned

Confluence automation, live Jira access/authentication or mutations, multiple teams/sprints, production deployment, real user data, and unapproved analytics or workflow features are excluded as recorded in [`clarify.md`](./clarify.md).
