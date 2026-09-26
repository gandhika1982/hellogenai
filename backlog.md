# Jira Sprint Progress Dashboard — Implementation Backlog

This backlog is derived from [`project_spec.md`](./project_spec.md) and incorporates the agreed delivery order:

1. Deliver a usable mock-data dashboard before starting live Jira work.
2. Build sprint summary and health before blocker and scope-change details.
3. Treat Jira integration as a later, gated phase; decide deployment type and authentication before implementing it.

Complete tasks in phase order. Jira-specific implementation tasks remain unchecked until the discovery decisions in the Integration phase are confirmed.

## MCP and custom-skill decision

- **MCP:** Use an Atlassian MCP server for authorized Jira/Confluence discovery, search, and live data retrieval. The official [Atlassian remote MCP server](https://github.com/atlassian/atlassian-mcp-server) supports Jira and Confluence Cloud with OAuth 2.1 or API-token authentication. Its [setup guide](https://support.atlassian.com/atlassian-ai-gateway/docs/get-started-with-the-atlassian-remote-mcp-server/) and [supported tools](https://support.atlassian.com/atlassian-ai-gateway/docs/supported-tools/) describe available capabilities and permissions.
- **Custom skill:** Use project-specific scripts/instructions for application code, normalized adapters, calculations, UI, tests, and documentation; an MCP server retrieves Atlassian data but does not implement or run this dashboard.
- **Current availability:** This project has only the local `echo-windows` MCP configured; no Atlassian MCP is installed or authenticated. Atlassian's official remote server is Cloud-hosted. Community alternatives such as [tingyiy/atlassian-mcp-server](https://github.com/tingyiy/atlassian-mcp-server) and [xuanxt/atlassian-mcp](https://github.com/xuanxt/atlassian-mcp) advertise Jira and Confluence Cloud tools; review maintenance, security, deployment compatibility, and field mappings before choosing one.
- Tags below classify the primary execution aid for each task. An `[MCP]` task requires an approved, authenticated Atlassian server and permissions; do not assume its availability.

## Phase 1 — Setup

- [ ] [custom skill] Scaffold a React and TypeScript application with Vite in the project, keeping the existing calculator files intact.
- [ ] [custom skill] Configure Vitest as the unit/component test runner, with React Testing Library, `@testing-library/user-event`, and `@testing-library/jest-dom` for accessible component tests; add development, test, lint, type-check, and production-build scripts and document their invocation in the project README.
- [ ] [custom skill] Establish a source layout for dashboard presentation, domain models/calculations, data providers, styles, and tests.
- [ ] [custom skill] Define TypeScript domain types for team, sprint, issue, status category, scope change, and sprint dashboard data.
- [ ] [custom skill] Define a typed sprint data-provider interface that returns normalized domain data without exposing provider-specific payloads to the UI.
- [ ] [custom skill] Add deterministic, synthetic mock data for one small team and active sprint, including varied issue statuses, estimates, assignees, flagged issues, sub-tasks, and scope changes.
- [ ] [custom skill] Add shared CSS design tokens and baseline responsive page styles for a clean Jira-inspired interface.

## Phase 2 — Core Features

### Sprint summary and health

- [ ] [custom skill] Implement pure calculations for current-scope top-level issues, excluding sub-tasks from sprint totals.
- [ ] [custom skill] Calculate estimated current-scope points, completed points, remaining points, and the count of unestimated top-level issues; do not count missing estimates as points.
- [ ] [custom skill] Treat issues in the Done status category as complete regardless of their status display name.
- [ ] [custom skill] Define and document sprint date boundaries and validation behavior, including invalid dates, end-before-start, same-day ranges, weekend boundaries, and ranges with zero weekdays; reject invalid ranges explicitly and avoid dividing by zero for ranges with no working days.
- [ ] [custom skill] Implement weekday-based elapsed and remaining sprint-day calculations using Monday–Friday and no holiday calendar, following the documented boundary rules.
- [ ] [custom skill] Calculate ideal completion from elapsed working days, bounded to 0–100%, with explicit sprint-start and sprint-end behavior.
- [ ] [custom skill] Calculate actual completion against current estimated scope and mark the sprint At risk when it is at least 10 percentage points behind ideal.
- [ ] [custom skill] Return an explicit insufficient-estimate state instead of a percentage or health judgment when estimated current scope is zero.
- [ ] [custom skill] Build the primary sprint summary UI with team/sprint identity, dates, working days remaining, total/completed/remaining points, and a labeled progress bar.
- [ ] [custom skill] Display On track, At risk, or insufficient-estimate status with the actual and ideal comparison; do not rely on color alone.

### Blockers and scope changes

- [ ] [custom skill] Derive blocked issues from the normalized flagged field and calculate the blocked issue count.
- [ ] [custom skill] Build a keyboard-accessible blocked-issue detail section with key/title, assignee, status, and story points.
- [ ] [custom skill] Add a clear empty state for sprints without flagged issues.
- [ ] [custom skill] Summarize points added and removed through scope changes, keeping removed issues out of current-scope totals.
- [ ] [custom skill] Build an interactive, keyboard-accessible scope-change detail section showing direction, affected issue, timestamp, and point impact when known.
- [ ] [custom skill] Add clear empty and unknown-point states for scope-change details.
- [ ] [custom skill] Compose the summary, blocker, and scope-change sections into a responsive dashboard backed only by the mock provider.

## Phase 3 — Integration

> This phase is intentionally deferred until the mock-data dashboard is usable. Do not configure credentials or make Jira API assumptions before completing the discovery task.

- [ ] [MCP] Confirm Jira deployment type (Cloud or Data Center/server), project/sprint selection, authentication model, permissions, refresh expectations, and story-point/flagged field mappings with the project owner; use an authorized Atlassian MCP server to inspect available projects, sprints, and fields where supported.
- [ ] [custom skill] Document integration decisions, required access, security constraints, and any backend/API proxy requirement before implementation begins.
- [ ] [custom skill] Implement a Jira data adapter that maps the confirmed Jira responses into the existing normalized team, sprint, issue, and scope-change domain types.
- [ ] [custom skill] Keep credentials and tokens out of browser code; implement the approved secure server-side authentication/token handling path if required.
- [ ] [custom skill] Add an explicit provider selection/configuration path for Jira while retaining the mock provider for local development and tests.
- [ ] [custom skill] Handle loading, empty, permission-denied, expired-authentication, rate-limit, and Jira/network error states without presenting stale or fabricated success data.
- [ ] [MCP] Validate Jira-derived Done category, Flagged field, sub-task, estimate, and sprint membership mappings against a representative test project using authorized live data; implement automated mapping tests separately.

## Phase 4 — Testing

- [ ] [custom skill] Unit-test scope totals and issue inclusion, including empty issue lists, sub-task exclusion, nullable story-point estimates, and the zero-estimate outcome.
- [ ] [custom skill] Unit-test completion based on Done category for multiple status names.
- [ ] [custom skill] Unit-test weekday elapsed/remaining calculations at sprint start, mid-sprint, end, after end, across weekends, and for invalid dates, end-before-start, same-day ranges, weekend boundaries, and zero-weekday ranges; assert explicit errors or non-misleading outcomes according to the documented rules.
- [ ] [custom skill] Unit-test actual-versus-ideal health boundaries, including exactly 10 percentage points behind and zero estimated scope.
- [ ] [custom skill] Unit-test added/removed scope summaries and verify removed issues do not contribute to current-scope totals.
- [ ] [custom skill] Component-test the dashboard with populated mock data, no blockers, no scope changes, and insufficient-estimate data.
- [ ] [custom skill] Test keyboard navigation, focus visibility, semantic structure, responsive layout, and status communication without color; verify text and UI-component contrast against WCAG 2.2 AA and remediate any failures.
- [ ] [custom skill] Run type-check, lint, targeted tests, and production build; resolve failures before considering the mock-data release complete.
- [ ] [custom skill] If Jira integration is implemented, test adapter mapping, auth/error states, and API behavior using safe fixtures or a non-production test project.

## Phase 5 — Documentation

- [ ] [custom skill] Update the project README with application prerequisites, installation, development, test, lint, type-check, and build instructions.
- [ ] [custom skill] Document the dashboard sections, health calculation, status-category completion rule, scope-change semantics, and missing-estimate behavior.
- [ ] [custom skill] Document the mock data/provider boundary and how to add or replace a provider.
- [ ] [custom skill] After Jira decisions are approved, document supported Jira deployment, required configuration, permissions, secure credential setup, and known limitations without including secrets.
- [ ] [custom skill] Update the documented acceptance checklist to reflect verified behavior and note any intentionally deferred work.
