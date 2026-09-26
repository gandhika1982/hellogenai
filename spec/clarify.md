# Specification Review and Clarifications

**Reviewed documents:** [`constitution.md`](./constitution.md) and [`specification.md`](./specification.md)
**Review outcome:** The questions below are resolved for this prototype. Decisions marked **Out of scope** will not be implemented in the prototype. No product question remains as an implicit implementation assumption.

## Product scope and architecture

### 1. Is the MVP a browser-only mock dashboard or a required full-stack application?

- **Gap:** The source project specification says the first release needs neither a backend nor a network request, while the requested technology baseline includes Express and PostgreSQL 15.
- **Resolution:** The MVP is the React/Vite dashboard with deterministic local mock data and must work with the backend stopped and Docker unavailable. Express and PostgreSQL 15 are target technologies for an optional later persistence/API increment, not prerequisites or a condition of MVP acceptance. The requested first backend milestone is scaffolding only.

### 2. Does “Jira/Confluence automation” mean Jira/Confluence connectivity is part of this feature?

- **Gap:** The training prompt names Jira/Confluence automation, but the supplied product specification describes a Jira sprint dashboard and excludes live integration; it provides no Confluence use cases.
- **Resolution:** The product is the Jira Sprint Progress Dashboard. Live Jira synchronization is deferred pending the decisions listed below. Confluence integration, Confluence data, and automation are **Out of scope** for this prototype.

### 3. What exact versions and package boundaries should implementation use?

- **Gap:** Architecture targets need to be distinguishable from already installed dependencies, and it is unclear whether the two applications share a package manifest.
- **Resolution:** Use the version targets in [`constitution.md`](./constitution.md): Node.js 24.19.0, npm 11.17.0, React 18.3.1, TypeScript 5.7.3, Vite 5.4.14, Express 5.1.0, and PostgreSQL 15. Keep frontend and backend package manifests separate. Pin direct dependencies and commit their lockfiles when the applications are initialized. Do not add a root npm-workspaces setup for the prototype unless a later approved change requires it.

## User experience and product behavior

### 4. Which team, sprint, and issue data are available at initial delivery?

- **Gap:** No real team, Jira project, sprint, issue key, or Jira account was supplied.
- **Resolution:** Use one deterministic, explicitly synthetic team and active sprint. Use no real credentials or personal data. The fixture must cover varied statuses, known and missing estimates, a sub-task, flagged and unflagged issues, and added/removed scope changes.

### 5. How exactly is sprint health calculated?

- **Gap:** The result depends on the denominator, completion semantics, date boundaries, and zero-estimate behavior.
- **Resolution:** Use estimated top-level issues still in current scope as the denominator. Count completion only for normalized status category `Done`, regardless of display name. Exclude sub-tasks and null estimates from point totals; show unestimated top-level issue count separately. Use weekdays Monday–Friday, with no holiday calendar. Ideal progress is elapsed sprint weekdays divided by total sprint weekdays, bounded to 0–100%; on the sprint start date ideal is 0%, and after the end date it is 100%. Mark At risk when actual progress is at least 10 percentage points behind ideal. If estimated current scope is zero, return an explicit insufficient-estimate state with no percentage or health judgment.

### 6. Which issue is a blocker and what does the user see?

- **Gap:** “Blocked” could otherwise be inferred from status text or another field.
- **Resolution:** A blocker is an issue whose normalized flagged value is true. Show the count and issue key/title, assignee (or an explicit unknown/none value), status, and story points (or an explicit unestimated value). Show an explicit empty state when there are no blockers. Do not infer blocker status from title or status name.

### 7. What happens to issues removed from sprint scope?

- **Gap:** Historical removal needs to be represented without corrupting current-sprint metrics.
- **Resolution:** Retain removal events in scope-change history with the affected issue, direction, timestamp, and point impact when known. Removed issues do not contribute to current-scope totals. An unknown point impact is displayed as unknown, not zero.

### 8. Which screens and interactions are required?

- **Resolution:** One responsive dashboard screen with sprint identity/summary, labeled progress and health, point totals, blockers, and scope changes. Details may be expandable sections. No login, settings/admin, multi-team, multi-sprint, charting, notifications, or export screen is needed. Preserve keyboard access, visible focus, semantic names, and non-color status cues.

## API and persistence

### 9. What data is persisted, and is it needed to show the mock dashboard?

- **Gap:** The proposed relational schema is more extensive than the initial fixture-only experience.
- **Resolution:** For the backend increment, use the four proposed tables (`teams`, `sprints`, `issues`, `scope_changes`) and the null/current-scope/Done-category rules in `specification.md`. Derived progress, health, blocker counts, and point totals are computed, not stored as authoritative facts. The MVP reads fixtures and does not connect to PostgreSQL. Database persistence is an optional later increment.

### 10. Are API endpoints required for the MVP, and can they mutate Jira?

- **Gap:** The detailed endpoint list could be mistaken for a live integration requirement or for permission to mutate upstream data.
- **Resolution:** The listed `/api/v1` endpoints are a future, read-only normalized dashboard API. They do not call Jira or write Jira data. A fixture-backed frontend must work without them. Live Jira requests, synchronization, Jira write routes, and any credential/authentication design are **Out of scope** until deployment type, account authorization, permissions, field mappings, refresh behavior, and data minimization are confirmed.

### 11. What are the API response and error conventions?

- **Resolution:** Successful reads return JSON normalized to the domain model. Preserve `null` versus zero. Invalid input returns a 400-class error; missing resources return 404; unexpected service/dependency failures return a non-2xx error with a stable `{ "error": { "code": "...", "message": "..." } }` shape. Do not expose stack traces, secrets, or fabricated success data. Apply this only when the optional API exists.

### 12. What constitutes a dashboard refresh or a configured active sprint?

- **Gap:** No source of truth, refresh interval, or multi-sprint selector was specified.
- **Resolution:** The MVP loads the single fixture snapshot on application start; no periodic refresh or sprint selector. For an optional API, serve the one active sprint for the configured single team. **Out of scope:** configurable refresh, historical selection, and multi-team/multi-sprint selection.

## Data and operational details

### 13. How should dates and timestamps be interpreted?

- **Gap:** Sprint dates are calendar dates, while change events are instants; timezone display policy is not specified.
- **Resolution:** Represent sprint start/end as date-only values (`YYYY-MM-DD`) and scope-change events as ISO 8601 timestamps with an explicit offset or UTC `Z`. Calculate weekday progress from date-only values so browser timezone does not shift the sprint day. Display event timestamps in the user's local timezone while retaining the original instant.

### 14. What database seed, retention, and production operations are required?

- **Resolution:** If PostgreSQL is activated, seed only safe synthetic development data. No production deployment, backup/restore service-level objective, retention policy for real Jira data, multi-tenant isolation, or operational monitoring is defined. Those production concerns are **Out of scope** for this local prototype and must be designed before production use.

## Out of scope for this prototype

- Confluence automation, data, API access, or persistence.
- Live Jira connectivity, authentication, synchronization, and Jira mutations.
- Real user accounts or real team/issue data.
- Multi-team and multi-sprint experiences.
- Production hosting, production credential management, backups, data retention commitments, and operational SLOs.
- Holiday calendars, configurable health thresholds, burndown/trend charts, notifications, and exports.

## Readiness

The decisions above provide enough detail to plan an incremental prototype. Backend/database work remains optional and must not block delivery or local operation of the mock-data frontend.
