# Specification Compliance Checklist

**Compared:** `spec/specification.md` against the implementation; updated after the final mock-data MVP walkthrough.
**Scope:** Fixture-backed, single-team active-sprint dashboard. Live Jira, API persistence, PostgreSQL, Docker services, and Confluence are explicitly deferred by the specification.

## Dashboard and domain requirements

| Requirement | Final result |
|---|---|---|
| Show team, active sprint name, and dates | **Implemented** — rendered from the synthetic sprint fixture. |
| Show elapsed and remaining weekdays | **Implemented** — weekday calculations derive 5 elapsed and 5 remaining days for the sample. |
| Show actual and ideal progress with text health | **Implemented** — 62% actual, 50% ideal, and “On track”; At risk uses the inclusive 10 percentage-point threshold. |
| Show estimated scope, completed/remaining points, and unestimated issue count | **Implemented** — sample totals are 39 / 24 / 15 points with 1 unestimated current-scope issue. |
| Count Done by status category and exclude subtasks/removed work | **Implemented and unit-tested** — derived values use the status category and ignore subtasks and removed scope. |
| Show blockers with key, title, assignee, status, and points; explicit empty state | **Implemented** — full issue details and the empty-blocker preview state are available. |
| Show scope additions/removals, issue, timestamp, and known/unknown point impact | **Implemented** — separate known totals, event date/time, and explicit unknown impact are shown. Added issues contribute to current scope; removed issues do not. |
| Provide populated, empty blockers, empty scope history, and insufficient-estimate states | **Implemented and browser-checked** — each state is selectable in the mockup. Insufficient estimates removes the percentage and progress judgment. |
| Preserve accessible structure, keyboard usability, visible focus, and non-color status | **Implemented and manually checked** — semantic headings/labels and text statuses; keyboard focus is visible on the state selector; statuses and scope direction use text as well as color. |
| Work at narrow viewport | **Verified** — no horizontal overflow at 320px. |
| Render without backend, Docker, credentials, or external requests | **Verified** — fixture dashboard runs locally without external requests; backend is not required by the frontend. |

## Future/deferred requirements

| Requirement | Status | Disposition |
|---|---|---|
| Versioned Express dashboard, sprint, issue, blocker, and scope-change API | **Out of scope** — deferred by specification | The optional backend health endpoint works; the dashboard API route correctly returns 404 because it is not implemented. |
| PostgreSQL 15 schema, migrations, and persistence | **Out of scope** — deferred by specification | No database service is configured in Compose. |
| Jira integration, authentication, synchronization, and Confluence | Explicitly out of scope | Do not implement. |
| API loading/error states | Conditional on future API provider | Out of scope while the MVP renders synchronously from local fixtures. |

## Nice to have

- Linting and automated accessibility/contrast checks; the repository does not currently configure those tools.
- Real Jira data, selectable teams/sprints, charts, exports, or user-configurable thresholds; all remain outside the MVP.
- The existing Docker Compose file is a scaffold only: its two Node services are behind the `scaffold` profile and have no app commands. Starting Compose is therefore not part of the working prototype flow.

## Verification record

- `frontend`: `npm test` — **9 passed**; `npm run typecheck` — **passed**; `npm run build` — **passed**; `npm audit` — **0 vulnerabilities**.
- `backend`: `npm run typecheck` and `npm run build` — **passed**; `GET /health` — **200** with `{"status":"ok"}`; `GET /api/v1/dashboard/active` — **404** (deferred API).
- Browser walkthrough: populated dashboard, empty blockers, empty scope history, and insufficient estimates — **all rendered as expected**; keyboard-visible focus verified; 320px viewport has no horizontal overflow.
- Docker: CLI version **29.8.0**. `docker compose -f .\\docker-compose.yml config` — **passed** and resolved to no default services. `docker compose -f .\\docker-compose.yml up -d` — **not started**, because Compose reported `no service selected`; the optional scaffold-profile containers do not run the applications.
- Stack alignment: Vite is pinned to **6.4.3** instead of the original **5.4.14** target to avoid known dependency advisories; the constitution and specification now record the verified version.
