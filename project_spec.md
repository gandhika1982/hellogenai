# Jira Sprint Progress Dashboard — Technical Specification

## 1. Project summary

Build an interactive, Jira-inspired dashboard that lets a Scrum master/project manager quickly assess whether a small software product team’s active sprint is on track and where help is needed. The first release uses realistic mock data, but its data boundary must allow a Jira integration to be added later without rewriting the dashboard.

## 2. Users and usage

- **Primary user:** Scrum master or project manager.
- **Team:** One software product team of 1–5 people.
- **Primary use:** Desktop/laptop during daily stand-up.
- **Primary task:** Spot sprint delivery risk and impediments quickly.

## 3. Goals

1. Make completed and remaining sprint work immediately understandable in story points.
2. Show time remaining and a useful, explainable sprint-health signal.
3. Make blocked issues and changes to sprint scope easy to identify.
4. Keep the initial experience useful with mock data and ready for a future Jira-backed data provider.

## 4. Scope

### In scope for the first release

- One team and its active sprint.
- Interactive sprint-health dashboard populated with realistic mock data.
- Completed and remaining story points, sprint dates/time remaining, and sprint-health status.
- Blocked-issue summary and issue details.
- Added/removed sprint scope, expressed in story points and linked to affected issues.
- A clean, Jira-inspired visual style, optimized for desktop/laptop and usable at narrower viewport widths.

### Out of scope

- Live Jira access, credentials, authentication, or synchronization.
- Multiple-team or multiple-sprint comparisons.
- Burndown charts, delivery-trend analytics, notifications, and exports.
- Configurable holiday calendars in the first release.
- Choosing a Jira deployment type (Cloud versus Data Center/server); this remains open until integration planning.

## 5. Functional requirements

### 5.1 Sprint overview

- Identify the team and active sprint, including sprint start/end dates.
- Show total estimated story points in the current sprint scope.
- Show completed and remaining estimated story points.
- Show the number of unestimated top-level issues separately; do not treat missing estimates as zero or include them in point totals.
- Show working days remaining in the sprint. Working days are Monday through Friday; holidays are not excluded in the first release.
- Show a progress bar and a labeled sprint-health status.

### 5.2 Completion and issue inclusion

- An issue is complete when its status belongs to Jira’s **Done** status category, regardless of the status’s display name.
- Count top-level sprint issues only. Exclude sub-tasks from all sprint point totals to avoid double-counting estimates.
- Use the issue’s story-point estimate. Missing estimates are represented as `null` and counted separately.
- Remaining points are the estimated points in the current scope that are not in the Done category.

### 5.3 Health signal

- Compare the percentage of estimated current-scope points completed with the ideal percentage implied by elapsed working days.
- Use the **current sprint scope** as the denominator, so additions/removals affect the comparison.
- Mark the sprint **At risk** when actual completion is at least **10 percentage points** behind ideal progress. Otherwise mark it **On track**.
- Calculate ideal progress as elapsed working days divided by total working days, bounded to 0–100%. At the sprint start, ideal progress is 0%; after the sprint end, it is 100%.
- Show the underlying actual and ideal percentages (or their difference) so the status can be understood rather than appearing as an unexplained judgment.
- If the sprint has no estimated current-scope points, do not fabricate a percentage or health judgment; show that there is insufficient estimate data.

### 5.4 Blocked issues

- Treat an issue as blocked when Jira’s **Flagged** field is set.
- Show a blocked-issue count and a list containing each issue’s key/title, assignee, status, and story points.
- If there are no blocked issues, show an explicit empty state.

### 5.5 Scope changes

- Record and display issues added to or removed from the sprint after sprint start.
- For each change, show whether points were added or removed, the affected issue, and the story-point impact when known.
- Summarize added and removed story points separately.
- Keep scope-change history distinct from current-scope totals: removed issues are not included in current-scope totals.

### 5.6 Interaction

- Provide interactive detail for blocked issues and scope changes (for example, expandable lists or sections).
- Make progress, status, blockers, and scope-change information available by keyboard as well as pointer.
- Use explicit labels and empty states rather than hiding sections when the relevant data is absent.

## 6. Data and domain model

Use typed, Jira-independent domain data at the presentation boundary. The mock provider should supply at least:

- **Team:** stable identifier and display name.
- **Sprint:** stable identifier, name, start/end dates, team identifier.
- **Issue:** key, title, assignee (nullable), status name, status category, story points (nullable), flagged state, sub-task indicator.
- **Scope change:** issue reference, added/removed direction, change timestamp, story-point value at the time of change when available.

Keep Jira-specific response shapes and field names inside a future adapter. The UI and sprint calculations should consume normalized domain objects, not raw Jira API payloads.

## 7. Technical approach

The workspace does not currently contain an application framework. Recommended initial stack:

- React with TypeScript for the UI and domain types.
- Vite for local development and production bundling.
- CSS with a small set of shared design tokens; avoid a UI framework dependency unless implementation needs establish one.
- Deterministic, typed mock fixtures as the first data source.

Separate the application into:

1. **Presentation:** dashboard sections and accessible interactive controls.
2. **Domain calculations:** point totals, completion, working-day progress, risk status, and scope-change summaries; keep these pure and independently testable.
3. **Data provider boundary:** a small interface used by the dashboard, initially implemented by the mock provider and replaceable by a future Jira provider.

Do not couple calculations to React components or to mock fixture structure. Do not place future Jira credentials or secrets in browser code; select and design the appropriate server-side integration/authentication path when Jira connectivity is in scope.

## 8. UX and visual direction

- Clean, Jira-inspired project dashboard with clear hierarchy and restrained color.
- Put sprint identity, health, time remaining, and completed/remaining points in the primary visual area.
- Keep blocked issues and scope changes easy to scan without obscuring the overall sprint summary.
- Use text labels and icons in addition to color for status and risk.
- Prioritize desktop/laptop use, while preserving readable layout and usable controls at narrower widths.
- Provide visible keyboard focus, semantic headings, accessible names, and sufficient contrast.

## 9. Non-functional requirements

- **Accessibility:** Target WCAG 2.2 AA for contrast, keyboard operation, semantic structure, and status communication.
- **Reliability:** Calculations must handle missing estimates, empty issue lists, zero-point scope, sprint boundaries, and scope changes without misleading percentages.
- **Maintainability:** Keep mock/Jira data acquisition separate from UI and calculations.
- **Privacy:** Use synthetic mock data; do not require or embed credentials in the first release.
- **Performance:** The single-sprint dashboard should render promptly without requiring a backend or network request.

## 10. Acceptance criteria

1. On opening the dashboard, a user can identify the team’s active sprint, its health status, and working days remaining.
2. The dashboard shows total estimated current-scope points, completed points, remaining points, and the count of unestimated top-level issues.
3. Completion is based on the Done status category, including statuses whose names are not exactly “Done”.
4. Sub-tasks do not affect the displayed point totals.
5. Health compares completed percentage with ideal progress by elapsed weekdays; a gap of 10 percentage points or more behind ideal is At risk, and a smaller gap is On track.
6. The dashboard does not show a fabricated percentage/health judgment when current-scope estimates total zero.
7. Flagged issues appear in a blocked list with key/title, assignee, status, and points.
8. Added and removed scope changes and their point impacts are visible; removed issues do not remain in current-scope totals.
9. The experience uses realistic mock data, has interactive detail, and remains usable with keyboard navigation.
10. Sprint calculations can be tested independently from React and consume normalized domain data through a provider boundary.

## 11. Validation strategy

- Unit-test pure sprint calculations, including Done-category matching, scope changes, missing estimates, excluded sub-tasks, zero-point scope, and sprint start/end boundaries.
- Component-test the dashboard with the mock provider, including empty blocker/scope-change states and representative populated states.
- Run the project’s type-check, lint, and production build commands once the application scaffold exists.
- Manually verify keyboard navigation, status readability without color, and narrow-screen layout.

## 12. Assumptions and open decisions

- The first release is a client-side mock-data experience; a backend is not required for it.
- “Working day” means Monday–Friday, with no holiday calendar in the initial version.
- The initial mock sprint and team are illustrative; no actual team names, Jira project key, or real issue data have been provided.
- Jira Cloud versus Data Center/server, authentication, permissions, refresh behavior, and exact Jira custom-field mappings must be decided before implementing the real Jira adapter.
