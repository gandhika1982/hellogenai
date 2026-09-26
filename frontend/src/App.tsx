const blockers = [
  { key: "DEMO-14", title: "Confirm event contract with platform team", owner: "Alex" },
  { key: "DEMO-21", title: "Resolve test environment access", owner: "Sam" },
];

const scopeChanges = [
  { key: "DEMO-25", action: "Added", points: "+5 points" },
  { key: "DEMO-08", action: "Removed", points: "−3 points" },
];

function App() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#overview" aria-label="Sprint overview home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>Sprintboard</span>
        </a>
        <span className="sample-label">Illustrative mock data</span>
      </header>

      <div className="content" id="overview">
        <section className="page-heading" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">DEMO TEAM <span>•</span> ACTIVE SPRINT</p>
            <h1 id="page-title">Sprint 24</h1>
            <p className="muted">Jun 3 – Jun 14, 2026 <span className="dot">·</span> 4 working days left</p>
          </div>
          <span className="health-badge"><span aria-hidden="true">●</span> On track</span>
        </section>

        <section className="summary-grid" aria-label="Sprint summary">
          <article className="card progress-card">
            <div className="card-heading">
              <div>
                <p className="card-label">Sprint progress</p>
                <p className="progress-value">62%</p>
              </div>
              <span className="trend-chip">+8% this week</span>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Illustrative sprint progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={62}
            >
              <span className="progress-fill" />
            </div>
            <div className="progress-legend">
              <span>Completed <strong>24 pts</strong></span>
              <span>Ideal pace <strong>68%</strong></span>
            </div>
          </article>

          <article className="card metric-card">
            <p className="card-label">Total scope</p>
            <p className="metric-value">39 <span>pts</span></p>
            <p className="metric-note">Across 8 top-level issues</p>
          </article>

          <article className="card metric-card">
            <p className="card-label">Remaining</p>
            <p className="metric-value">15 <span>pts</span></p>
            <p className="metric-note">4 issues still in progress</p>
          </article>

          <article className="card metric-card blocker-metric">
            <p className="card-label">Needs attention</p>
            <p className="metric-value">2 <span>blockers</span></p>
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
            <ul className="issue-list">
              {blockers.map((issue) => (
                <li className="issue-row" key={issue.key}>
                  <span className="issue-icon" aria-hidden="true">!</span>
                  <div className="issue-copy">
                    <span className="issue-key">{issue.key}</span>
                    <span className="issue-title">{issue.title}</span>
                  </div>
                  <span className="assignee">{issue.owner}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="card detail-card">
            <div className="section-heading">
              <div>
                <p className="card-label">Scope movement</p>
                <h2>Recent changes</h2>
              </div>
              <span className="count-badge neutral">2</span>
            </div>
            <ul className="change-list">
              {scopeChanges.map((change) => (
                <li className="change-row" key={change.key}>
                  <span className={`change-dot ${change.action.toLowerCase()}`} aria-hidden="true" />
                  <span className="issue-key">{change.key}</span>
                  <span className="change-action">{change.action}</span>
                  <span className="change-points">{change.points}</span>
                </li>
              ))}
            </ul>
            <p className="scope-note">Removed work is excluded from current sprint totals.</p>
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
