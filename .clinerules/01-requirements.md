### 🔄 Project Awareness & Context
- **Always read `02-planning.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check `03-task.md`** before starting a new task. If the task isn’t listed, add it with a brief description and today's date.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `02-planning.md`.

### 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Generic reusable components go into the @components/ui folder** everything else can just goes under a specific namespace for the type of component. If a namespace doesn't exist create it.

### ✅ Task Completion
- **Create tasks** for the ask in `03-task.md`.
- **Mark completed tasks in `03-task.md`** immediately after finishing them.
- Add new sub-tasks or TODOs discovered during development to `03-task.md` under a “Discovered During Work” section.

### 🤖 Development
- Before writing code: analyze all code files thoroughly to get full context.
- Next present a plan for achieving the task at hand. Do not begin changing files without confirming the plan first.

### 📎 Style & Conventions
- **Use Typescript** as the primary language.
- **Properly add types** whenever it makes sense
- **Prefer absolute imports** over relative imports
- **Document functions using JSDoc**

### 📚 Documentation & Explainability
- **Comment non-obvious code** and ensure everything is understandable to a mid-level developer.
- When writing complex logic, **add an inline `// Reason:` comment** explaining the why, not just the what.

### 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified JavaScript/TypeScript packages.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `03-task.md`.