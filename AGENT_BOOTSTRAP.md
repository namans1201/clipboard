# AGENT_BOOTSTRAP.md
> **Run this file first.** It is the entry point for the agentic loop.  
> The agent reads this, scans the project (or starts fresh), generates all required interconnected markdown files, and guides the session from there.

---

## 0. Agent instructions (read before anything else)

You are a senior full-stack engineering assistant operating in an agentic loop.  
Your first job is to **understand the current state of the world** — the project, the user's goals, and any gaps — before writing a single line of code.

Follow this file exactly, in order. Do not skip sections. Do not assume. Ask when uncertain.

---

## 1. Detect project state

Run the following check:

```
Does a project already exist in the current working directory?
- Look for: package.json / pyproject.toml / requirements.txt / go.mod / Cargo.toml / pom.xml
- Look for: src/ or app/ or backend/ or frontend/ directories
- Look for: any existing markdown files (README.md, SPEC.md, PROGRESS.md, etc.)
```

**If project EXISTS → go to Section 2.**  
**If project does NOT exist → go to Section 5.**

---

## 2. Read the existing project (existing projects only)

Scan and extract the following. Write findings into memory before proceeding.

### 2a. Tech stack detection
```
- Read package.json / pyproject.toml / go.mod etc. → list all dependencies
- Identify: frontend framework, backend framework, database, ORM, auth library, testing tools, build tools
- Note: language versions, runtime versions
```

### 2b. Folder structure
```
- Print a tree of the top 3 levels (ignore node_modules, .git, dist, __pycache__, .next)
- Identify: where routes live, where components live, where DB models/schemas live, where tests live
```

### 2c. Read existing markdown files
```
- If README.md exists → extract: purpose, setup instructions, known issues
- If SPEC.md exists → extract: feature list, data models, API contracts
- If PROGRESS.md exists → extract: what is built, what is broken, last session state
- If any other .md files exist → read and summarize
```

### 2d. Scan source code for current flow
```
- Read entry point files (index.ts / main.py / app.py / server.js / etc.)
- Read all route/API files and list endpoints found
- Read all DB model/schema files and list entities found
- Read top-level component files and list pages/views found
- Note any TODO comments, FIXME, or console.error/log statements
- Check for .env.example or .env.sample → list required env vars
```

### 2e. Identify gaps
```
After reading the above, identify:
- Features mentioned in SPEC but not implemented
- Routes defined but not wired to frontend
- DB models defined but missing migrations
- Missing tests
- Broken or incomplete code (TODO / FIXME / empty functions)
- Missing environment variables
- Undocumented APIs
```

---

## 3. Generate the project markdown files (existing project)

After completing Section 2, generate or update ALL of the following files.  
If a file already exists, **update it** — do not overwrite sections that are still accurate.

---

### 3a. README.md
```
Sections to include:
- Project name + one-line description
- Tech stack summary (bullet list)
- Local setup instructions (step by step)
- Environment variables (table: name | required | description | example)
- How to run (dev / prod / test)
- Folder structure overview
- Known issues / limitations
```

---

### 3b. SPEC.md
```
Sections to include:
- Project goal (1 paragraph)
- User roles (who uses this app)
- Features list (grouped by module, with status: ✅ done / 🔧 in progress / ❌ not started)
- Data models (entity name, fields, relationships)
- API contracts (method | route | auth required | request body | response)
- Frontend pages/routes (path | component | auth required | status)
- Non-functional requirements (performance, security, scalability notes)
```

---

### 3c. PROGRESS.md
```
Sections to include:
- Last updated (date + session number)
- What is fully working (bullet list)
- What is broken or incomplete (bullet list with file references)
- Current blockers
- Next session priorities (ordered list)
- Decisions log (date | decision | reason) — for architectural choices made
```

---

### 3d. ARCHITECTURE.md
```
Sections to include:
- System diagram description (text-based, using ASCII or Mermaid)
- Data flow: how a request travels from user → frontend → backend → DB → response
- Auth flow (if applicable)
- External integrations (APIs, services, queues)
- Environment overview (local / staging / prod differences)
```

---

### 3e. TASKS.md
```
Sections to include:
- Backlog (features not started)
- In progress (what is currently being built)
- Done (completed features — keep last 10)
- Each task format:
  [ ] Task title
      Owner: agent / human
      Files affected: list
      Depends on: other task IDs (if any)
      Notes: any context
```

---

### 3f. CONTEXT.md  *(the agent's working memory)*
```
This file is rewritten at the START of every session.
Sections to include:
- Session number
- What to focus on this session (pulled from TASKS.md "In Progress")
- Files likely to be touched
- Known constraints (do not change X, Y is fragile, Z is WIP)
- Last known working commit / state
- Open questions to resolve before coding
```

---

## 4. Ask clarifying questions (existing project)

After generating the files above, ask the user these questions **one group at a time**.  
Wait for answers before proceeding to code.

### Group A — Priorities
```
1. Looking at PROGRESS.md, the next priorities are: [list them].
   Which should we work on this session?

2. Are there any features or changes NOT in SPEC.md that you want to add today?

3. Is there anything currently broken that must be fixed before new features?
```

### Group B — Constraints
```
4. Are there any files or modules I should NOT touch this session?

5. Are we keeping the current tech stack, or is anything changing (e.g. switching DB, adding auth)?

6. Any hard deadlines or performance targets to keep in mind?
```

### Group C — Quality
```
7. Should I write tests for what I build? (unit / integration / e2e / skip for now)

8. Should I add API documentation (OpenAPI/Swagger) as I go?

9. Any linting/formatting rules to follow? (check for .eslintrc / .prettierrc / pyproject.toml)
```

After receiving answers → update TASKS.md and CONTEXT.md → begin building.

---

## 5. New project setup (no existing project)

Ask the user the following questions **before generating anything**.  
Group them and wait for answers.

### Group A — What are we building?
```
1. What does this app do? (2-3 sentences)

2. Who are the users? (end users, admins, both?)

3. What are the 3-5 core features for v1? (list them)

4. Any features explicitly out of scope for v1?
```

### Group B — Tech stack
```
5. Do you have a preferred stack? Or should I recommend one?
   If recommending: I will base it on the app type, team size, and deployment target.

6. What database type makes sense? (relational / document / both / unsure)

7. Where will this be deployed? (Vercel / Railway / AWS / local only / unsure)

8. Do you need authentication? (yes / no / later)
```

### Group C — Dev preferences
```
9. TypeScript or JavaScript? Python? Go? Other?

10. Should I set up testing from the start?

11. Any specific UI library preference? (Tailwind / shadcn / MUI / none)

12. Monorepo or separate frontend/backend repos?
```

---

## 6. Recommend and confirm tech stack (new projects only)

After receiving answers to Section 5, output a **Tech Stack Proposal** in this format:

```
## Proposed stack for [project name]

| Layer        | Choice          | Reason                                      |
|-------------|-----------------|---------------------------------------------|
| Frontend     | Next.js 14      | App router, SSR, great DX, Vercel-native     |
| Styling      | Tailwind + shadcn| Rapid UI, accessible components             |
| Backend      | Next.js API routes | Same repo, reduces infra complexity       |
| Database     | PostgreSQL       | Relational, strong ecosystem                |
| ORM          | Prisma           | Type-safe, great migrations DX              |
| Auth         | NextAuth.js      | Handles OAuth + credentials out of the box  |
| Deployment   | Vercel + Supabase| Zero-config, generous free tier             |
| Testing      | Vitest + Playwright | Unit + E2E                               |

Confirm this stack or tell me what to change before I scaffold anything.
```

Wait for confirmation → then generate all markdown files from Section 3 (populated for the new project) → scaffold the project structure → begin building.

---

## 7. Session loop rules (all projects)

The agent follows these rules every session:

```
START OF SESSION:
1. Read CONTEXT.md
2. Read PROGRESS.md → find current blockers and priorities
3. Read TASKS.md → find "In Progress" items
4. Confirm with user: "Ready to work on [X]. Anything changed since last session?"

DURING SESSION:
5. Work on one task at a time (one vertical slice)
6. After each file change: state what was changed and why
7. After each feature: run the app and report result
8. Never refactor code outside the current task's scope
9. If a new bug is found unrelated to current task → add to TASKS.md backlog, do not fix now

END OF SESSION:
10. Update PROGRESS.md: move completed items to "done", update "broken/incomplete"
11. Update TASKS.md: mark completed tasks, update "In Progress"
12. Update CONTEXT.md: write next session focus, open questions, constraints
13. Summarize: "Here is what was done this session: [list]. Next session should start with: [task]."
```

---

## 8. File dependency map

These files reference each other. Keep them in sync.

```
AGENT_BOOTSTRAP.md  ← you are here (run once per project, re-run to re-orient)
        │
        ├──► SPEC.md          (source of truth for features + data models)
        │         │
        │         └──► ARCHITECTURE.md  (derived from spec + tech choices)
        │
        ├──► PROGRESS.md      (current state of implementation vs spec)
        │         │
        │         └──► TASKS.md        (actionable items derived from progress gaps)
        │
        └──► CONTEXT.md       (per-session working memory, rebuilt each session)
                  │
                  └──► README.md       (updated when setup or env vars change)
```

---

## 9. Quickstart commands (for the agent)

After all markdown files are generated and confirmed, run:

```bash
# Verify project runs
npm run dev        # or: python main.py / go run . / etc.

# Verify tests pass
npm test           # or: pytest / go test ./...

# Check for obvious issues
npx tsc --noEmit   # TypeScript projects only
```

If any command fails → add to PROGRESS.md under "broken" → fix before proceeding to new features.

---

*This file is the permanent entry point. Re-run it any time the session feels lost or after a long break.*
