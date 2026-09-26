# Prototype Tasks: Jira Sprint Progress Dashboard

**Source:** [`plan.md`](./plan.md)
**Scope:** Four deliverable tasks for the local mock-data prototype. These tasks replace the earlier full-stack task breakdown as the active implementation list.

## Phase 1 — Frontend setup and mock data

### MVP-01 — Creating the runnable frontend shell

- **Description:** Initialize the separate React 18.3.1, TypeScript 5.7.3, and Vite 5.4.14 frontend package and a single dashboard page shell.
- **Acceptance criteria:**
  - `frontend/` has its own pinned `package.json`, lockfile, TypeScript configuration, and Vite entry point.
  - Development and production-build scripts work from `frontend/`.
  - The dashboard page loads without calling a backend or requiring Docker.
  - Existing Python calculator and project-learning files remain unchanged.
- **Dependencies:** None

### MVP-02 — Adding mock sprint data and domain calculations

- **Description:** Define normalized frontend types/provider interface, deterministic synthetic fixtures, and pure sprint point/progress/health calculations.
- **Acceptance criteria:**
  - Types cover team, sprint, issue, status category, nullable story points/assignee, flagged state, sub-task, current scope, scope change, and dashboard data.
  - The fixture is clearly synthetic, deterministic, and covers Done/non-Done, missing estimate, sub-task, blocker, and added/removed scope cases.
  - Calculations exclude sub-tasks and removed work, count completion by Done category, preserve null estimates, and expose unestimated count.
  - Weekday calculations use Monday–Friday, the at-risk threshold is inclusive at 10 percentage points behind, and zero estimated scope returns insufficient-estimate state.
  - Focused unit tests cover mixed, empty, missing-estimate, date-boundary, and risk-threshold behavior.
  - Data and calculations run locally without Express, PostgreSQL, Docker, or network requests.
- **Dependencies:** MVP-01

## Phase 2 — Dashboard features

### MVP-03 — Building the sprint summary, blockers, and scope details

- **Description:** Render the complete single-sprint dashboard from the mock provider, including summary metrics, flagged issue details, and scope-change history.
- **Acceptance criteria:**
  - Summary shows team/sprint identity and dates, working days, total/completed/remaining points, unestimated count, actual versus ideal progress, and labeled health.
  - Zero estimated current scope does not display a fabricated percentage or health judgment.
  - Blocker section shows count, key/title, assignee, status, points, and an explicit empty state.
  - Scope section shows added/removed totals and change direction, issue, timestamp, and known point impact; unknown impact is not presented as zero.
  - Removed issues remain in history but do not contribute to current-scope totals.
  - Details and controls are usable by keyboard, have visible focus and semantic labels, and communicate status without color alone.
  - Component tests cover populated, empty blocker, empty scope-history, and insufficient-estimate states.
- **Dependencies:** MVP-02

## Phase 3 — Prototype verification

### MVP-04 — Verifying the prototype build and accessibility

- **Description:** Run and record the focused checks needed to demonstrate the mock-data prototype works locally.
- **Acceptance criteria:**
  - Domain and component tests, type-check, lint, and production build are run; actual results are recorded.
  - The frontend is verified to build and render with backend and database services stopped.
  - Keyboard navigation, visible focus, semantic names/headings, non-color status, contrast, and a narrow viewport are reviewed.
  - Failures are reported explicitly and are not represented as successful checks.
- **Dependencies:** MVP-03

## Deferred full-stack work

The previous BE-01/BE-02 backend scaffold exists but is optional and not needed for the prototype. PostgreSQL/Compose, schema migrations, backend seeding, normalized API endpoints, API-backed provider, and Jira integration are deferred. Do not start those tasks unless the prototype is accepted and the integration decisions are explicitly approved. Confluence remains out of scope.
