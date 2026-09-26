# Jira Sprint Progress Dashboard — Requirements

## Purpose

Build an interactive dashboard that helps a team understand the health and progress of its active Jira sprint at a glance. The first version will use realistic mock data while being structured to support a Jira connection in the future.

## Audience

The dashboard is for members of one team who need a quick view of progress in that team's active sprint.

## Functional requirements

### Sprint overview

- Show one team's active sprint.
- Present sprint health at a glance, including:
  - Completed and remaining work, measured in story points.
  - Days remaining in the sprint.
  - An overall sprint status or health indicator.
- Determine completed work from issues in Jira's **Done status category**, rather than requiring a status with the exact name “Done”.

### Blockers and scope

- Show blocked issues so the team can identify impediments.
- Show scope changes so the team can see when work has been added or removed during the sprint.

### Interaction and data

- Provide an interactive dashboard rather than a static visual mockup.
- Populate the initial experience with realistic mock sprint data.
- Keep the data and application structure suitable for replacing or supplementing the mock data with a real Jira integration later.

## Visual direction

- Use a clean, Jira-inspired project dashboard style.
- Prioritize legibility and quick comprehension of sprint health.

## Initial scope and assumptions

- The first version is for a single team's active sprint; multi-team or multi-sprint comparison is not required.
- Story points are the primary measure of progress.
- The initial version does not connect to Jira; Jira data integration is a future extension.
- The Jira deployment type and authentication approach remain undecided until a real integration is planned.

## Acceptance criteria

- A user can see completed and remaining story points for the active sprint.
- A user can see how many days remain and an overall sprint-health status.
- Completion is calculated using the Done status category.
- Blocked issues and scope changes are visible.
- The experience includes interactive controls or elements and uses realistic mock data.
- The presentation follows the clean, Jira-inspired visual direction.
- The mock-data implementation is organized so a future Jira data source can be integrated without redesigning the dashboard's core presentation.

## Out of scope for the initial version

- Live Jira connectivity, credentials, and authentication.
- Comparing multiple teams or sprints.
- A specific Jira Cloud or Data Center/server integration.
