# Prototype Implementation Plan: Jira Sprint Progress Dashboard

**Inputs:** [`constitution.md`](./constitution.md), [`specification.md`](./specification.md), and resolved decisions in [`clarify.md`](./clarify.md)
**Prototype boundary:** Deliver one locally runnable React/Vite dashboard using deterministic mock data. Express, PostgreSQL, Docker, Jira, and Confluence are not required to run or demonstrate this prototype.

## Phase 1 — Frontend setup and mock data

**Milestone:** A user can start the frontend and load one typed, synthetic sprint without a network or backend.

- Initialize the pinned React/TypeScript/Vite frontend package.
- Define the normalized team, sprint, issue, scope-change, and provider types.
- Add deterministic mock data covering the important statuses, estimates, sub-task, blocker, and scope-change cases.
- Implement the pure point-total and weekday/health calculations with focused tests.

**Exit criteria:** The frontend builds and its local mock provider returns stable data; domain tests cover the key inclusion, estimate, date, and risk rules.

## Phase 2 — Dashboard features

**Milestone:** The mock sprint is understandable on one responsive dashboard screen.

- Add a small dashboard shell with sprint identity, dates, working days, points, progress, and a text health state.
- Add flagged blocker details and an explicit empty state.
- Add scope-change totals/details with explicit unknown impacts and removed-work history.
- Keep calculation behavior in pure domain modules, not React components.

**Exit criteria:** Summary, blockers, and scope changes render from the mock provider, including insufficient-estimate, empty, and unknown-data states.

## Phase 3 — Prototype verification

**Milestone:** The prototype is buildable, usable by keyboard, and has focused evidence for its core behavior.

- Run focused domain and component tests, type-check, lint, and production build.
- Check keyboard interaction, visible focus, semantic labels, status without color alone, and a narrow viewport.
- Record actual commands and results; do not claim checks that were not run.

**Exit criteria:** The frontend passes available checks and remains usable with the backend, Docker, database, and network unavailable.

## Deferred beyond this prototype

The backend package/API server, PostgreSQL service/schema/seeding, API-backed frontend provider, and live Jira work are not on the critical path for this prototype. Existing backend scaffold files may remain in the repository but are not started or required by the dashboard. Revisit the deferred integration tasks only after the mock-data prototype is accepted and the necessary contract/security decisions are approved. Confluence remains out of scope.
