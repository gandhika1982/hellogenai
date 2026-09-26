# Instructions Catalog

Each entry below is an instruction file with a one-line description. Load the relevant instruction completely when the request matches its keywords.

---

- [`./instructions/creating-instructions.agent.md`](./creating-instructions.agent.md) — create and maintain portable, focused project instructions and their IDE entry points.
  + Keywords: create instruction, update instruction, instruction catalog, Copilot prompt, agent instructions
  + Status: Needs more testing — exercise the bootstrap workflow in clean projects and review suggested editor/MCP settings for least privilege.
- [`./instructions/create-status-report.agent.md`](./create-status-report.agent.md) — generate concise weekly status reports for the team.
  + Keywords: status report, weekly report, team report
  + Status: Battle-tested — checked sparse and complete inputs; missing facts are reported rather than invented.
- [`./instructions/calculate-sprint-health.agent.md`](./calculate-sprint-health.agent.md) — calculate sprint progress and health from normalized sprint and issue data.
  + Keywords: sprint health, sprint progress, story points, at risk
  + Status: Needs more testing — cover empty/zero estimates, excluded sub-tasks, date boundaries, and the exact risk threshold.
- [`./instructions/build-dashboard-feature.agent.md`](./build-dashboard-feature.agent.md) — implement and validate an accessible dashboard feature from backlog acceptance criteria.
  + Keywords: dashboard feature, blockers panel, scope changes, accessible component
  + Status: Needs more testing — validate against an implemented feature, component tests, and WCAG 2.2 AA checks after app setup.
- [`./instructions/integrate-jira-provider.agent.md`](./integrate-jira-provider.agent.md) — integrate a confirmed Jira data source through the normalized provider boundary.
  + Keywords: Jira integration, Jira adapter, Jira provider, map Jira data
  + Status: Needs more testing — exercise adapter mappings and failure handling with confirmed Jira configuration in a non-production environment.
- [`./instructions/calculate-compound-interest.agent.md`](./calculate-compound-interest.agent.md) — calculate compound interest using the local command-line tool.
  + Keywords: compound interest, interest calculation, compounding, annual rate
  + Status: Verified against an independent Decimal calculation and incompatible-period rejection; additional invalid-input coverage remains.
- [`./instructions/use-calculate-sprint-progress.agent.md`](./use-calculate-sprint-progress.agent.md) — calculate sprint point progress and weekday-based health from normalized issue data.
  + Keywords: calculate sprint progress, sprint point totals, working days, sprint risk
  + Status: Tested with representative issue data, sub-tasks, unestimated issues, and the exact risk threshold; broader boundary testing remains.
- [`./instructions/use-summarize-scope-changes.agent.md`](./use-summarize-scope-changes.agent.md) — summarize added and removed sprint scope and known point impacts.
  + Keywords: summarize scope changes, added scope, removed scope, scope point impact
  + Status: Tested with known and unknown point impacts; broader invalid-input testing remains.
