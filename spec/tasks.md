# Implementation Tasks: Jira Sprint Progress Dashboard

**Source:** [`plan.md`](./plan.md)
**Dependency notation:** `None` means the task can start independently. Otherwise, task IDs listed under Dependencies must be complete first. Phase 1 is optional scaffolding and is deliberately not a dependency of the mock-data frontend.

## Phase 1 — Backend setup: database and API skeleton

### BE-01 — Initializing the backend package

- **Description:** Create a separate Node.js 24.19.0 / npm 11.17.0 backend package with Express 5.1.0 and TypeScript 5.7.3 pinned in its manifest and lockfile.
- **Acceptance criteria:**
  - The backend has its own `package.json`, lockfile, TypeScript configuration, and source entry points.
  - Direct dependency versions match `constitution.md`.
  - Install, type-check, and build scripts work from the backend directory.
  - No Jira credentials or real data are included.
- **Dependencies:** None

### BE-02 — Creating the Express API skeleton

- **Description:** Add Express app/server separation, a `/api/v1` router mount, a health endpoint, and centralized structured error handling.
- **Acceptance criteria:**
  - The server starts through a documented local command.
  - `GET /health` returns a successful JSON health response.
  - `/api/v1` is mounted and unknown routes return a structured 404.
  - Unexpected errors return a non-success response without a stack trace or success-shaped fallback.
- **Dependencies:** BE-01

### BE-03 — Configuring optional PostgreSQL 15

- **Description:** Add an optional PostgreSQL 15 service to Docker Compose and document safe local configuration without requiring Docker for the MVP.
- **Acceptance criteria:**
  - Compose uses the `postgres:15` image and a named local development volume.
  - The database service is behind an explicit profile or equivalent opt-in, so the default mock-data flow does not start or require it.
  - Required credentials are environment-provided; only a placeholder example with no real secret is committed.
  - Startup and shutdown commands are documented.
- **Dependencies:** None

### BE-04 — Defining and migrating the normalized schema

- **Description:** Add PostgreSQL migrations for `teams`, `sprints`, `issues`, and `scope_changes` using the resolved constraints.
- **Acceptance criteria:**
  - Foreign keys and required fields are defined.
  - Sprint end date cannot precede start date; scope-change direction is limited to `added` or `removed`.
  - Nullable estimates and point-at-change values preserve unknowns; known point values are non-negative.
  - Sub-task/current-scope and status-category data needed by domain rules are represented.
  - Migrations are non-destructive and runnable against a fresh PostgreSQL 15 database.
- **Dependencies:** BE-03

### BE-05 — Seeding synthetic backend data

- **Description:** Provide an opt-in repeatable development seed for one synthetic team/sprint, representative issues, and scope changes.
- **Acceptance criteria:**
  - All seeded data is clearly synthetic and contains no real user/team identifiers.
  - Fixtures cover Done and non-Done categories, sub-task, missing estimate, flagged issue, and added/removed scope.
  - Re-running the seed does not create duplicate records.
  - The seed is not required by the frontend mock-data provider.
- **Dependencies:** BE-04

## Phase 2 — Frontend setup: UI skeleton and routing

### FE-01 — Initializing the React/Vite frontend

- **Description:** Create a separate React 18.3.1, TypeScript 5.7.3, and Vite 5.4.14 package with pinned dependencies and standard development/build scripts.
- **Acceptance criteria:**
  - The frontend has its own manifest, lockfile, TypeScript configuration, and Vite entry.
  - Direct dependency versions match `constitution.md`.
  - Development server and production build work from the frontend directory.
  - Existing Python calculator and learning files remain unchanged.
- **Dependencies:** None

### FE-02 — Establishing frontend feature structure and route

- **Description:** Add the dashboard page shell, one initial dashboard route, shared styles, and the documented feature/domain/data folder boundaries.
- **Acceptance criteria:**
  - The single-sprint dashboard route renders without requiring a backend call.
  - Semantic page headings and visible keyboard focus are present in the shell.
  - Components, domain, provider/fixtures, and styles have distinct locations.
  - No login, admin, multi-team, or multi-sprint route is added.
- **Dependencies:** FE-01

### FE-03 — Defining normalized frontend types and provider contract

- **Description:** Define Jira-independent TypeScript types and a provider interface for team, sprint, issue, scope change, and dashboard snapshot data.
- **Acceptance criteria:**
  - Story points and optional assignee/impact data explicitly represent missing values as `null`.
  - Status category, flagged state, sub-task, and current-scope distinctions are modeled.
  - The interface returns normalized domain data and contains no raw Jira payload type.
  - Provider contract can be consumed without importing React components.
- **Dependencies:** FE-01

### FE-04 — Adding the deterministic mock provider

- **Description:** Supply one representative synthetic active sprint through the frontend provider contract.
- **Acceptance criteria:**
  - Fixture includes a small team, sprint dates, varied issue statuses and estimates, a sub-task, flagged/unflagged issues, and scope changes.
  - Fixture is deterministic and explicitly synthetic.
  - The frontend can render it with Docker and backend stopped.
- **Dependencies:** FE-03

## Phase 3 — Feature implementation

### FT-01 — Calculating current-scope issue totals

- **Description:** Implement pure calculations for eligible top-level issues, estimated total/completed/remaining points, and unestimated issue count.
- **Acceptance criteria:**
  - Sub-tasks and removed/out-of-scope issues do not affect current totals.
  - Completion uses status category `Done`, not status display name.
  - Null estimates are excluded from point sums and counted separately.
  - Empty, all-unestimated, and mixed inputs have explicit, tested results.
- **Dependencies:** FE-03

### FT-02 — Calculating weekday progress and sprint health

- **Description:** Implement pure inclusive sprint-date weekday calculations and actual-versus-ideal health state.
- **Acceptance criteria:**
  - Monday–Friday days are counted; holidays are not.
  - Sprint start ideal is 0%; dates after sprint end yield 100%; percentages stay within 0–100%.
  - At-risk threshold is inclusive at exactly 10 percentage points behind.
  - Zero estimated scope yields insufficient-estimate state without percentage or health judgment.
  - Invalid/reversed dates and zero-weekday ranges have explicit, tested behavior without division by zero.
- **Dependencies:** FT-01

### FT-03 — Rendering the sprint summary

- **Description:** Show sprint/team identity, dates, working days, point totals, labeled progress, and text health status.
- **Acceptance criteria:**
  - Values come from the normalized provider/domain results, not duplicated UI calculations.
  - Actual/ideal comparison and On track/At risk/insufficient-estimate states are understandable without color alone.
  - Missing values are labeled rather than fabricated.
- **Dependencies:** FE-02, FE-04, FT-01, FT-02

### FT-04 — Showing flagged blockers

- **Description:** Add an accessible blocker summary and issue-detail section based on normalized flagged state.
- **Acceptance criteria:**
  - Count and list include key/title, assignee, status, and points.
  - Null/unknown values have explicit presentation.
  - Empty blocker state is visible.
  - Expand/collapse controls, if used, work by keyboard and expose accessible names/state.
- **Dependencies:** FE-02, FE-04

### FT-05 — Summarizing scope changes

- **Description:** Add added/removed point totals and an interactive scope-change history.
- **Acceptance criteria:**
  - Each change presents direction, affected issue, timestamp, and point impact when known.
  - Unknown impact is not treated as zero.
  - Removed issues remain visible in history but are excluded from current totals.
  - Empty history has an explicit state and detail interaction is keyboard operable.
- **Dependencies:** FE-02, FE-04, FT-01

### FT-06 — Completing responsive accessibility states

- **Description:** Verify the integrated dashboard's responsive behavior and WCAG 2.2 AA interaction foundations.
- **Acceptance criteria:**
  - Keyboard navigation, focus visibility, semantic headings/names, and status cues are checked.
  - Layout remains readable and usable at a narrow viewport.
  - Contrast is checked for text, controls, and state indicators; failures are corrected.
- **Dependencies:** FT-03, FT-04, FT-05

## Phase 4 — Integration and testing

### IT-01 — Implementing the normalized read-only dashboard API

- **Description:** Add the specified `/api/v1` read endpoints using normalized response DTOs, runtime validation, and explicit errors.
- **Acceptance criteria:**
  - Active dashboard, sprint, issue, blocker, and scope-change reads match the specification.
  - `null` remains distinct from zero and raw Jira payloads are never returned.
  - Invalid input, missing resources, and server errors have stable non-2xx structured responses.
  - No Jira calls, credentials, or Jira mutation endpoints are added.
- **Dependencies:** BE-02, BE-04, FE-03

### IT-02 — Reading normalized data from PostgreSQL

- **Description:** Implement repository/service mapping from the PostgreSQL schema to the API's normalized model.
- **Acceptance criteria:**
  - Migrations and synthetic seed run on PostgreSQL 15.
  - Queries preserve nullable estimates, current-scope state, status category, flagged state, and scope-change history.
  - Repository tests cover no records, representative records, and invalid references.
- **Dependencies:** BE-04, BE-05, IT-01

### IT-03 — Adding a selectable API provider

- **Description:** Implement the future HTTP-backed frontend provider while retaining the mock provider for normal local MVP operation.
- **Acceptance criteria:**
  - Both providers implement the same typed provider interface.
  - API response parsing validates expected data before rendering.
  - Loading, empty, permission-denied, network, and server-error states are explicit.
  - Mock provider works without Express, PostgreSQL, Docker, or a network request.
- **Dependencies:** FE-04, IT-01

### IT-04 — Running release validation

- **Description:** Execute and record focused domain/component/API/repository tests, lint, type-check, builds, and manual UI checks.
- **Acceptance criteria:**
  - Domain boundary cases and dashboard populated/empty/unknown states are covered.
  - API and repository tests run when those optional layers are implemented.
  - Frontend production build succeeds independently of backend/database availability.
  - Compose/API integration is exercised when available and its results are reported accurately.
  - Keyboard, contrast, status-without-color, and narrow viewport checks are recorded.
- **Dependencies:** FT-06, IT-02, IT-03

## Jira integration gate (not a prototype task)

No Jira implementation task is scheduled in this plan. Before adding Jira connectivity, obtain explicit decisions for deployment (Cloud or Data Center/server), authentication, permissions, project/sprint selection, refresh, field mapping, and approved test environment. Confluence remains out of scope.
