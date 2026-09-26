# Feature Specification: Jira Sprint Progress Dashboard

**Status:** Draft for implementation planning
**Source:** [`../project_spec.md`](../project_spec.md) and agreed requirements
**Product increment:** Single-team active-sprint dashboard with deterministic mock data
**Architecture note:** This document describes the requested React/Vite + Express + PostgreSQL 15 target architecture. The backend API and PostgreSQL persistence are future/optional increments; they are not prerequisites for the mock-data MVP. Live Jira connectivity and Confluence automation are not included.

## 1. Problem and product outcome

A Scrum master or project manager needs to see during stand-up whether one team's active sprint is keeping pace, which issues are blocked, and how scope has changed. The dashboard presents those facts in story points with enough context to explain its health status.

The first usable increment is a responsive React dashboard backed by deterministic synthetic data. A stable, normalized data-provider boundary must allow a later Express/PostgreSQL provider and, after discovery decisions, a Jira adapter without coupling Jira payloads to the UI.

## 2. Users and assumptions

- **Primary user:** Scrum master or project manager for one software product team of 1–5 people.
- **Primary context:** Desktop/laptop during daily stand-up; narrower screens remain usable.
- **Initial data:** Synthetic team, sprint, issues, and scope-change fixtures.
- **Initial release:** One active sprint, no authentication, no live Jira requests, no Confluence workflows, and no required backend/database process.
- **Future persistence:** The proposed PostgreSQL schema stores normalized sprint snapshots and scope-change history when the optional backend increment is activated. It does not define or imply a live Jira synchronization process.
- **Calendar:** Monday–Friday working days; no holiday calendar in the initial version.

## 3. User stories and use cases

### US-1 — Check sprint health

As a Scrum master, I want to see actual completion beside ideal weekday-based progress so that I can spot delivery risk quickly.

**Acceptance:** Show sprint identity/dates, elapsed and remaining working days, completed and remaining estimated points, actual and ideal progress, and a text health state. Mark At risk when actual completion is at least 10 percentage points behind ideal. If estimated current scope is zero, show insufficient estimate data and no percentage/health judgment.

### US-2 — Understand issue totals

As a Scrum master, I want point totals to reflect only estimated, top-level issues still in current sprint scope so that totals are not misleading.

**Acceptance:** Count Done issues by the status category, not display name. Exclude sub-tasks. Treat missing estimates as unknown, exclude them from point sums, and display their count separately.

### US-3 — Find impediments

As a Scrum master, I want to see flagged issues and their owner/status so that I can direct support to blocked work.

**Acceptance:** Show blocked count and each flagged issue's key/title, assignee, status, and points. Show an explicit empty state when none are flagged.

### US-4 — Review scope movement

As a Scrum master, I want to see work added to or removed from the sprint and the known point impact so that I can explain changes in the sprint denominator.

**Acceptance:** Show each change's direction, affected issue, timestamp, and known point impact; summarize additions and removals separately. Retain removed work in history but exclude it from current-scope totals.

### US-5 — Navigate accessibly

As a keyboard or assistive-technology user, I want the same meaningful sprint information and controls as pointer users.

**Acceptance:** Interactive details are keyboard operable, focus is visible, headings and controls are semantic and named, and status is understandable without color.

### US-6 — Use the future API boundary

As a developer, I want a versioned API and normalized data contract so that a future server-backed provider can replace fixtures without making the UI depend on Jira response formats.

**Acceptance:** API routes use versioned resource names and validated normalized DTOs. The initial mock-data increment remains runnable without those routes or a database.

## 4. UI screens and states

The product has one primary dashboard screen; detail areas may be expandable sections rather than separate pages.

### Dashboard screen

- **Header:** Product title, team name, sprint name, and start/end dates.
- **Sprint health summary:** Text status (`On track`, `At risk`, or `Insufficient estimate data`), actual-versus-ideal progress, working days remaining, and a labeled progress indicator.
- **Point summary:** Total current-scope estimated points, completed points, remaining points, and unestimated top-level issue count.
- **Blocked issues section:** Flagged count and accessible issue details with key/title, assignee, status, and story points. Includes explicit empty state.
- **Scope changes section:** Added/removed point summaries and an interactive change list with direction, issue, timestamp, and known point impact. Unknown impacts are identified, not treated as zero.

### Required presentation states

- **Populated:** Deterministic mock sprint with mixed statuses, estimates, flags, sub-tasks, and scope changes.
- **Empty blockers:** Explicitly state there are no flagged issues.
- **Empty scope history:** Explicitly state no changes are recorded.
- **Insufficient estimate:** No percentage or health judgment when estimated current scope is zero.
- **Unknown scope impact:** Identify the affected change with an unknown point value.
- **Loading/error:** Required when the optional API provider exists; no stale or success-shaped fallback on a failed request. The fixture-backed MVP may render synchronously.
- **Responsive/accessibility:** Maintain content order, legibility, keyboard reachability, and status labels at narrow widths.

No separate login, administration, multi-team, multi-sprint, chart, notification, or export screen is in the MVP.

## 5. API contract (future Express increment)

These routes describe the planned server-backed interface, not functionality that must be present for the initial local mock-data MVP. Prefix all endpoints with `/api/v1`. The browser consumes normalized dashboard data; Jira-specific fields and raw upstream payloads must never leak through this contract.

| Method and path | Purpose | Request data | Response data |
|---|---|---|---|
| `GET /api/v1/dashboard/active` | Load the active sprint dashboard for the configured single team. | None for the initial single-team prototype. | `DashboardSnapshot`: team, sprint, current-scope metrics, health, blocked issues, and scope changes. |
| `GET /api/v1/teams/{teamId}/active-sprint` | Resolve the configured team's active sprint snapshot. | Path `teamId`. | `DashboardSnapshot`; `404` if no active sprint exists. |
| `GET /api/v1/sprints/{sprintId}` | Read sprint metadata and current-scope summary. | Path `sprintId`. | Sprint metadata and summary metrics; `404` if unknown. |
| `GET /api/v1/sprints/{sprintId}/issues` | List top-level current-scope issues. | Path `sprintId`; optional pagination only if dataset size later requires it. | Normalized issue summaries and explicit nullable estimates. Sub-tasks are excluded from sprint calculations. |
| `GET /api/v1/sprints/{sprintId}/blockers` | List flagged current-scope issues for the blocker panel. | Path `sprintId`. | Count and normalized blocker details; empty list when none are blocked. |
| `GET /api/v1/sprints/{sprintId}/scope-changes` | Read scope-change history for the sprint. | Path `sprintId`. | Chronological changes, direction, issue reference, timestamp, nullable point impact, and separate added/removed known-point totals. |

### API behavior

- Successful reads return JSON with a stable normalized schema.
- Errors return a non-2xx status and a structured body such as `{ "error": { "code": "NOT_FOUND", "message": "Sprint not found" } }`; do not expose stack traces or secrets.
- Validate path identifiers and any future query/body values at runtime.
- No create/update Jira issue routes are in the MVP. Scope changes originate from the fixture or a separately approved data-ingestion capability.
- No Jira API calls, credentials, authentication, or Confluence endpoints are implemented by this specification.
- The API must preserve distinctions among zero, unknown (`null`), and absent data.

## 6. Data model

### 6.1 Normalized domain objects

The frontend provider boundary and future API use these concepts:

- **Team:** stable identifier and display name.
- **Sprint:** stable identifier, team reference, name, inclusive start/end dates, and active indicator.
- **Issue:** stable identifier, Jira-style key when known, title, nullable assignee, status name, status category, nullable non-negative story points, flagged state, sub-task indicator, and current-scope indicator.
- **ScopeChange:** stable identifier, sprint and issue references, direction (`added` or `removed`), timestamp, and nullable point impact captured at change time.
- **DashboardSnapshot:** team, sprint, current-scope estimated totals, completed/remaining totals, unestimated issue count, actual/ideal/gap/health result or insufficient-estimate state, blocker list, and scope-change summary.

Calculation results are derived values, not independently editable database facts. For the fixture-only MVP, these objects may exist only in TypeScript fixtures.

### 6.2 Proposed PostgreSQL 15 schema (future persistence)

The schema is a normalized storage proposal for the optional API/database increment. It does not mean the MVP must connect to PostgreSQL.

| Table | Important columns | Purpose and relationships |
|---|---|---|
| `teams` | `id UUID PK`, `name TEXT NOT NULL`, `created_at TIMESTAMPTZ` | Team identity. A team has many sprints. |
| `sprints` | `id UUID PK`, `team_id UUID FK`, `name TEXT NOT NULL`, `start_date DATE NOT NULL`, `end_date DATE NOT NULL`, `is_active BOOLEAN NOT NULL` | Sprint metadata. Enforce `end_date >= start_date`; constrain one active sprint per team for the single-active-sprint workflow. |
| `issues` | `id UUID PK`, `sprint_id UUID FK`, `issue_key TEXT`, `title TEXT NOT NULL`, `assignee_name TEXT NULL`, `status_name TEXT NOT NULL`, `status_category TEXT NOT NULL`, `story_points NUMERIC NULL`, `is_flagged BOOLEAN NOT NULL DEFAULT FALSE`, `is_subtask BOOLEAN NOT NULL DEFAULT FALSE`, `in_current_scope BOOLEAN NOT NULL DEFAULT TRUE`, `updated_at TIMESTAMPTZ` | Normalized issue snapshot for a sprint. Nullable points represent unknown estimates; validate non-negative known values. |
| `scope_changes` | `id UUID PK`, `sprint_id UUID FK`, `issue_id UUID FK`, `direction TEXT CHECK IN ('added','removed')`, `changed_at TIMESTAMPTZ NOT NULL`, `story_points_at_change NUMERIC NULL` | Append-only record of scope movements; retains removals and historical point impact. |

### 6.3 Data integrity and derivation rules

- Store dates as SQL `DATE` and event timestamps as `TIMESTAMPTZ`.
- Treat `story_points = NULL` as unestimated/unknown, never as zero. Known story points must be non-negative.
- Derive current scope from `issues.in_current_scope`; do not count sub-tasks in dashboard totals even if they have estimates.
- Count completion only when normalized `status_category = 'Done'`.
- Derive blocked state from `is_flagged`.
- Retain removed issues and their change records for history, but set them outside current scope so they do not contribute to current-scope totals.
- Store source identifiers and snapshots only when a future provider needs them; never add raw Jira payload columns by default.
- Use schema migrations for changes. Do not rely on automatic destructive schema synchronization.

## 7. Architecture and implementation boundaries

- **Frontend:** React 18.3.1 + TypeScript 5.7.3 + Vite 5.4.14. Dashboard components render normalized view data and do not contain sprint-calculation rules.
- **Domain:** Pure, independently tested calculations for issue inclusion, point totals, weekday progress, health, blockers, and scope-change summaries.
- **Mock provider:** Deterministic synthetic data is the MVP source and must not require network, Docker, API, or credentials.
- **Future backend:** Node.js 24.19.0 + Express 5.1.0 + TypeScript 5.7.3, with route/controller/service/repository boundaries and runtime input validation.
- **Future database:** PostgreSQL 15 through Docker Compose for persistence-backed development only. Keep credentials in untracked environment configuration and provide safe examples without secrets.
- **Provider swap:** UI calls a typed provider interface. Mock and future API implementations both return the same normalized dashboard domain shape.
- **Future Jira adapter:** Separate server-side integration, gated on confirmed Jira deployment, authentication, permissions, refresh behavior, and field mapping. Never put Jira credentials in browser code.

## 8. Non-functional requirements

- **Accessibility:** Target WCAG 2.2 AA for contrast, keyboard interaction, semantic structure, visible focus, and status communication.
- **Reliability:** Cover missing/zero estimates, empty issue sets, excluded sub-tasks, invalid and boundary dates, scope additions/removals, and API errors without misleading success.
- **Privacy/security:** MVP uses synthetic fixtures; no credentials are needed. Validate external inputs and avoid logging secrets or unnecessary personal data.
- **Maintainability:** Keep UI, domain rules, providers, HTTP transport, and persistence independently testable.
- **Performance:** The fixture-backed dashboard renders without a backend or network request. Future API responses should be scoped to the one active sprint.
- **Responsive use:** Desktop-first layout remains usable at narrower viewports.

## 9. Out of scope

- Live Jira synchronization, Jira credentials/authentication, and Jira-specific write APIs.
- Confluence automation or Confluence data storage.
- Multi-team and multi-sprint comparison.
- Burndown charts, trend analytics, notifications, and exports.
- Holiday calendars, configurable health thresholds, and user-managed workflow settings.
- Login/user-management workflows for the local mock-data MVP.

## 10. Success criteria and validation

1. A user can identify the active sprint, health/insufficient-data state, and working days remaining at a glance.
2. Point totals show current-scope estimated, completed, remaining, and unestimated top-level issues accurately.
3. Done-category matching is independent of status display name; sub-tasks are excluded.
4. Risk is At risk at exactly 10 percentage points behind ideal and On track when less than 10 points behind.
5. Zero estimated scope produces no percentage or health judgment.
6. Blockers and scope history show useful details and explicit empty/unknown states.
7. Primary dashboard interactions work by keyboard and communicate state without color alone.
8. Fixture-backed MVP can run without Express, PostgreSQL, Docker, Jira credentials, or external services.
9. Future API/provider/schema tests verify normalized DTOs, null-versus-zero semantics, validation, and explicit errors.
10. Run focused unit/component tests and available lint, type-check, and production build; report commands and actual results.

## 11. Decisions and deferred questions

- The requested React/Vite, Express, and PostgreSQL 15 stack is the target architecture; exact direct dependency versions are recorded in [`constitution.md`](./constitution.md).
- The backend/database are optional later increments, while the mock-data dashboard is the first deliverable.
- Jira Cloud versus Data Center/server, authentication model, permissions, sprint selection, refresh behavior, and custom-field mappings remain undecided until integration planning.
- The project remains a Jira sprint dashboard; Confluence automation is not implied by the project name or the future Jira provider.
