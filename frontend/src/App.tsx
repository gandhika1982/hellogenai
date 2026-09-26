import { useState } from "react";
import { calculateScopeTotals, calculateSprintSummary, type Issue, type ScopeChange } from "./domain";

type SprintFixture = {
  team: string;
  name: string;
  startDate: string;
  endDate: string;
  today: string;
  issues: Issue[];
  scopeChanges: ScopeChange[];
};

type PreviewView = "populated" | "empty-blockers" | "empty-changes" | "unestimated";

function isPreviewView(value: string): value is PreviewView {
  return value === "populated" || value === "empty-blockers" || value === "empty-changes" || value === "unestimated";
}

const sprint: SprintFixture = {
  team: "Demo Team",
  name: "Sprint 24",
  startDate: "2026-09-21",
  endDate: "2026-10-02",
  today: "2026-09-26",
  issues: [
    { key: "DEMO-01", title: "Build sprint summary", assignee: "Alex", status: "Done", statusCategory: "Done", points: 8, flagged: false, inCurrentScope: true },
    { key: "DEMO-02", title: "Add dashboard layout", assignee: "Sam", status: "Done", statusCategory: "Done", points: 8, flagged: false, inCurrentScope: true },
    { key: "DEMO-03", title: "Connect event stream", assignee: "Alex", status: "Done", statusCategory: "Done", points: 8, flagged: false, inCurrentScope: true },
    { key: "DEMO-04", title: "Review authentication flow", assignee: "Sam", status: "In Progress", statusCategory: "In Progress", points: 5, flagged: true, inCurrentScope: true },
    { key: "DEMO-05", title: "Prepare test environment", assignee: null, status: "To Do", statusCategory: "To Do", points: 5, flagged: true, inCurrentScope: true },
    { key: "DEMO-06", title: "Document alert behavior", assignee: "Riley", status: "In Progress", statusCategory: "In Progress", points: null, flagged: false, inCurrentScope: true },
    { key: "DEMO-07", title: "Removed follow-up task", assignee: "Alex", status: "To Do", statusCategory: "To Do", points: 3, flagged: false, inCurrentScope: false },
    { key: "DEMO-25", title: "Add export summary", assignee: "Riley", status: "To Do", statusCategory: "To Do", points: 5, flagged: false, inCurrentScope: true },
    { key: "DEMO-08", title: "Implementation sub-task", assignee: "Sam", status: "Done", statusCategory: "Done", points: 2, flagged: false, subtask: true, inCurrentScope: true },
  ],
  scopeChanges: [
    { key: "DEMO-25", title: "Add export summary", direction: "Added", changedAt: "2026-09-24T10:30:00", points: 5 },
    { key: "DEMO-07", title: "Remove follow-up task", direction: "Removed", changedAt: "2026-09-24T14:15:00", points: 3 },
    { key: "DEMO-26", title: "Add acceptance notes", direction: "Added", changedAt: "2026-09-25T09:00:00", points: null },
  ],
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${value}T12:00:00`));

const formatTimestamp = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    .format(new Date(value));

function App() {
  const [view, setView] = useState<PreviewView>("populated");
  const issues = view === "unestimated"
    ? sprint.issues.map((issue) => ({ ...issue, points: null }))
    : sprint.issues;
  const summary = calculateSprintSummary(issues, sprint.startDate, sprint.endDate, sprint.today);
  const {
    currentIssues,
    estimatedIssues,
    unestimatedCount,
    totalPoints,
    completedPoints,
    remainingPoints,
    actualProgress,
    elapsedDays,
    remainingDays,
    idealProgress,
    atRisk,
    health,
  } = summary;
  const blockers = view === "empty-blockers" ? [] : currentIssues.filter((issue) => issue.flagged);
  const scopeChanges = view === "empty-changes" ? [] : sprint.scopeChanges;
  const scopeTotals = calculateScopeTotals(scopeChanges);

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#overview" aria-label="Sprint overview home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>Sprintboard</span>
        </a>
        <label className="sample-label" htmlFor="sample-view">Illustrative mock data</label>
        <select
          id="sample-view"
          className="view-select"
          value={view}
          onChange={(event) => {
            if (isPreviewView(event.target.value)) setView(event.target.value);
          }}
          aria-label="Preview dashboard state"
        >
          <option value="populated">Populated</option>
          <option value="empty-blockers">Empty blockers</option>
          <option value="empty-changes">Empty scope history</option>
          <option value="unestimated">Insufficient estimates</option>
        </select>
      </header>

      <div className="content" id="overview">
        <section className="page-heading" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">{sprint.team} <span>•</span> ACTIVE SPRINT</p>
            <h1 id="page-title">{sprint.name}</h1>
            <p className="muted">
              {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}{" "}
              <span className="dot">·</span>{" "}{elapsedDays} elapsed, {remainingDays} working days left
            </p>
          </div>
          <span className={`health-badge ${atRisk ? "at-risk" : ""} ${actualProgress === null ? "insufficient" : ""}`}>
            <span aria-hidden="true">{actualProgress === null ? "i" : atRisk ? "!" : "●"}</span>{health}
          </span>
        </section>

        <section className="summary-grid" aria-label="Sprint summary">
          <article className="card progress-card">
            <div className="card-heading">
              <div>
                <p className="card-label">Sprint progress</p>
                <p className="progress-value">{actualProgress === null ? "—" : `${actualProgress}%`}</p>
              </div>
              <span className="trend-chip">{actualProgress === null ? "Ideal unavailable" : `Ideal ${idealProgress}%`}</span>
            </div>
            {actualProgress === null ? (
              <p className="progress-unavailable">Progress unavailable until issues are estimated.</p>
            ) : (
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Actual sprint progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={actualProgress}
                aria-valuetext={`${actualProgress}% complete`}
              >
                <span className="progress-fill" style={{ width: `${actualProgress}%` }} />
              </div>
            )}
            <div className="progress-legend">
              <span>Completed <strong>{completedPoints} pts</strong></span>
              <span>Unestimated <strong>{unestimatedCount}</strong></span>
            </div>
          </article>

          <article className="card metric-card">
            <p className="card-label">Total scope</p>
            <p className="metric-value">{totalPoints} <span>pts</span></p>
            <p className="metric-note">Current estimated top-level issues</p>
          </article>

          <article className="card metric-card">
            <p className="card-label">Remaining</p>
            <p className="metric-value">{remainingPoints} <span>pts</span></p>
            <p className="metric-note">{estimatedIssues.filter((issue) => issue.statusCategory !== "Done").length} estimated issues not done</p>
          </article>

          <article className="card metric-card blocker-metric">
            <p className="card-label">Needs attention</p>
            <p className="metric-value">{blockers.length} <span>blockers</span></p>
            <p className="metric-note">Flagged issues in this sprint</p>
          </article>
        </section>

        <section className="detail-grid" aria-label="Sprint details">
          <article className="card detail-card">
            <div className="section-heading">
              <div>
                <p className="card-label">Impediments</p>
                <h2>Blocked issues</h2>
              </div>
              <span className="count-badge">{blockers.length}</span>
            </div>
            {blockers.length === 0 ? (
              <p className="empty-state">No flagged issues in this sprint.</p>
            ) : (
              <ul className="issue-list">
                {blockers.map((issue) => (
                  <li className="issue-row" key={issue.key}>
                    <span className="issue-icon" aria-hidden="true">!</span>
                    <div className="issue-copy">
                      <span className="issue-key">{issue.key}</span>
                      <span className="issue-title">{issue.title}</span>
                      <span className="issue-meta">{issue.status} · {issue.points === null ? "Unestimated" : `${issue.points} pts`}</span>
                    </div>
                    <span className="assignee">{issue.assignee ?? "Unassigned"}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="card detail-card">
            <div className="section-heading">
              <div>
                <p className="card-label">Scope movement</p>
                <h2>Recent changes</h2>
              </div>
              <span className="count-badge neutral">{scopeChanges.length}</span>
            </div>
            {scopeChanges.length > 0 && <p className="scope-totals">
              <span>Added <strong>{scopeTotals.Added.points > 0 ? `+${scopeTotals.Added.points} pts` : "no known points"}</strong>
                {scopeTotals.Added.unknown > 0 && <strong> + {scopeTotals.Added.unknown} unknown</strong>}
              </span>
              <span>Removed <strong>{scopeTotals.Removed.points > 0 ? `−${scopeTotals.Removed.points} pts` : "no known points"}</strong>
                {scopeTotals.Removed.unknown > 0 && <strong> + {scopeTotals.Removed.unknown} unknown</strong>}
              </span>
            </p>}
            {scopeChanges.length === 0 ? (
              <p className="empty-state">No scope changes are recorded.</p>
            ) : (
              <ul className="change-list">
                {scopeChanges.map((change) => (
                  <li className="change-row" key={change.key}>
                    <span className={`change-dot ${change.direction.toLowerCase()}`} aria-hidden="true" />
                    <span className="change-copy">
                      <span><strong className="issue-key">{change.key}</strong> · {change.title}</span>
                      <span className="change-meta">{change.direction} · {formatTimestamp(change.changedAt)}</span>
                    </span>
                    <span className="change-points">{change.points === null ? "Impact unknown" : `${change.direction === "Added" ? "+" : "−"}${change.points} pts`}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="scope-note">Removed work remains in history but is excluded from current totals.</p>
          </article>
        </section>

        <footer className="footer-note">
          <span className="sample-dot" aria-hidden="true" />
          Prototype preview · All sprint details shown are synthetic sample data
        </footer>
      </div>
    </main>
  );
}

export default App;
