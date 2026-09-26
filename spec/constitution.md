# Project Constitution: Jira Sprint Progress Dashboard

## Project identity

- **Project name:** Jira Sprint Progress Dashboard
- **Purpose:** Give a Scrum master or project manager a fast, evidence-based view of one team's active sprint, delivery pace, blockers, and scope changes.
- **Target user:** A Scrum master or project manager supporting one software product team of 1–5 people, primarily during desktop/laptop stand-up.

## Product and delivery principles

1. **Ship the useful mock-data experience first.** The first product increment must work with deterministic synthetic sprint data and must not require Jira credentials, a live Jira connection, PostgreSQL, or a backend to render the dashboard.
2. **Keep the Jira boundary replaceable.** UI and domain calculations consume normalized, Jira-independent types. Provider-specific payloads and field mappings stay behind an adapter.
3. **Make calculations explainable.** Count only top-level current-scope issues; use Jira's Done status category for completion; exclude missing estimates from point totals; and show actual versus weekday-based ideal progress. Mark At risk when actual progress is at least 10 percentage points behind ideal. If estimated scope is zero, report insufficient estimate data rather than a percentage or health judgment.
4. **Expose uncertainty and failure.** Never invent Jira facts, dates, estimates, scope-change impacts, or successful responses. Show explicit empty, unknown, loading, and error states appropriate to the active provider.
5. **Build accessibly by default.** Target WCAG 2.2 AA. Preserve keyboard operation, visible focus, semantic structure, readable contrast, and status communication that does not depend on color alone.
6. **Protect credentials and personal data.** Use synthetic fixtures in the mock-data increment. Never commit secrets or expose future Jira credentials in browser code.
7. **Test observable behavior.** Keep domain calculations pure and testable. Add focused tests for normal, boundary, missing-data, and failure cases; report validation failures truthfully.

## Technology baseline

The following versions define the planned stack for the prototype. They are architecture targets, not a claim that each dependency is already installed in the repository.

| Area | Technology | Version |
|---|---|---|
| Frontend runtime | Node.js | 24.19.0 |
| Frontend package manager | npm | 11.17.0 |
| UI | React | 18.3.1 |
| UI language | TypeScript | 5.7.3 |
| Frontend tooling | Vite | 6.4.3 |
| Backend runtime | Node.js | 24.19.0 |
| Backend framework | Express | 5.1.0 |
| Backend language | TypeScript | 5.7.3 |
| Relational database | PostgreSQL | 15 (Docker image `postgres:15`) |
| Local orchestration | Docker Compose | Compose Specification; use the Docker Compose plugin supplied with Docker Desktop |

Pin direct package dependencies and the Node runtime in the package manifests/lockfile when implementation begins. Keep PostgreSQL on major version 15 for this prototype; upgrade only through a reviewed migration.

### Incremental activation

- **Mock-data MVP:** React/Vite frontend and deterministic local fixtures are authoritative. No Express process or database is required to use the dashboard.
- **Optional backend/database increment:** Add the Express API and PostgreSQL 15 service when persistence or a server-side provider boundary is being implemented. Until then, their directories and Compose configuration are scaffolding only.
- **Live Jira integration:** Deferred until Jira deployment, authentication, permissions, refresh behavior, and field mappings are explicitly confirmed. Do not imply that the API or schema alone constitutes a working Jira integration.

## Folder structure conventions

Keep this repository as a small monorepo. Add files to the appropriate existing area; do not move the existing Python calculator or project-learning materials as part of dashboard implementation.

```text
.
├── frontend/
│   ├── public/                 # Static browser assets
│   └── src/
│       ├── app/                # Application composition and page shell
│       ├── components/         # Reusable presentation components
│       ├── features/dashboard/ # Sprint overview, blockers, scope-change UI
│       ├── domain/             # Normalized types and pure calculations
│       ├── data/               # Provider contract and mock fixtures/provider
│       └── styles/             # Design tokens and global styles
├── backend/
│   └── src/
│       ├── app.ts              # Express app configuration
│       ├── server.ts           # Process entry point and lifecycle
│       ├── routes/             # Versioned HTTP route registration
│       ├── controllers/        # HTTP request/response translation
│       ├── services/           # Application use cases
│       ├── repositories/       # Persistence boundary
│       ├── db/                 # PostgreSQL connection and migrations
│       └── domain/             # Server-side domain types and validation
├── spec/                       # Constitution and product specification
├── docker-compose.yml          # Optional local backend/database services
└── package.json                # Root scripts only if workspace orchestration is adopted
```

- Keep frontend and backend dependencies in their respective package manifests unless a deliberate npm-workspaces decision is documented.
- Keep React components focused on rendering and user interaction. Put sprint calculations in `frontend/src/domain/`, independent of React and fixture layout.
- Keep fixture data under `frontend/src/data/`; do not put credentials, real issue data, or environment-specific secrets there.
- Keep HTTP routing, business use cases, persistence, and database migrations in separate backend areas. Controllers must not contain SQL or sprint-calculation policy.
- Place tests beside the behavior they cover or in an adjacent `__tests__/` directory using a consistent convention within that package.
- Commit schema migrations and safe example configuration. Exclude local environment files, database volumes, credentials, and generated build output.

## Coding and organization standards

### Naming

- Use `PascalCase` for React components, component types, and classes.
- Use `camelCase` for variables, functions, hooks, object properties, and local modules.
- Prefix React hooks with `use` (for example, `useSprintDashboard`).
- Use `kebab-case` for feature directories and Markdown documentation filenames.
- Use descriptive, lowercase SQL `snake_case` for table and column names.
- Name tests after the behavior or module under test and keep test files colocated where practical.

### TypeScript and file organization

- Use TypeScript with strict compiler checks in both frontend and backend packages.
- Prefer small, cohesive modules with one primary responsibility and explicit exported interfaces.
- Validate untrusted input at HTTP and persistence boundaries; do not rely on TypeScript types as runtime validation.
- Represent missing story-point values explicitly as `null`; do not silently coerce unknown values to zero.
- Keep normalized domain names stable and Jira-independent. Translate Jira-specific names only in the future Jira adapter.
- Use async/await and propagate operational errors to the repository's standard error handling; do not swallow failures or return fabricated success-shaped values.
- Keep configuration in environment variables with safe, documented examples; fail clearly when required configuration is missing.

### Change quality

- Avoid unrelated features, speculative Jira behavior, and unnecessary dependencies.
- Maintain keyboard and screen-reader usability for every interactive control.
- Test calculations at sprint boundaries, with zero/missing estimates, sub-tasks, scope changes, and the exact risk threshold.
- Before considering a change complete, run the narrowest relevant tests and the available type-check, lint, and build commands; report what was and was not run.
- Update the specification when a user-approved product behavior or architecture decision changes.
