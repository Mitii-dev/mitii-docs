# Features

Mitii is a local-first, approval-gated coding-agent runtime. It indexes your workspace, plans before acting, and keeps every operation under your control — without sending code to a vendor server.

This page gives an overview of what Mitii can do and how its major subsystems fit together. For implementation details, follow the deep-dive links at the end of each section.

---

## At a Glance

| Capability | What it does |
|---|---|
| Workspace indexing | Multi-layer index (keyword, symbol, semantic, structural) built locally |
| Agent modes | Four modes (Ask, Plan, Agent, Review) that gate what the agent can do |
| Safety & control | Two-layer approval system that gates every risky operation |
| Code intelligence | Definition/reference resolution and change-impact analysis |
| Memory & context | Hybrid retrieval, access-based retention, privacy redaction |
| Skills | 12 bundled behavior-shaping skills, extensible via `.mitii/skills/` |
| Provider support | LLM-agnostic — Anthropic, OpenAI, Google, local models, any OpenAI-compatible endpoint |
| MCP | Optional Model Context Protocol integration (off by default) |
| Multi-surface | Same core powers VS Code extension, CLI, and SDK |

---

## Workspace Indexing

Before any agent interaction, Mitii builds a multi-layer index of your repository. All indexing and embedding runs on your machine — no API calls, no network round-trips.

| Layer | What it provides |
|-------|-----------------|
| **FTS5** | Fast full-text keyword search across all indexed files |
| **Tree-sitter** | Symbol extraction (functions, classes, imports) across 100+ languages |
| **Repo map** | PageRank over import/export edges — surfaces structurally important files |
| **Vectors** | On-device MiniLM embeddings (384-d, L2-normalized) for semantic similarity search |
| **Git + LSP** | Uncommitted diffs and live diagnostics injected into context |
| **Project rules** | Auto-loads `AGENTS.md`, `.cursor/rules`, `.clinerules`, `.mitii/rules` |

A hybrid retriever merges all sources, a reranker trims noise, and a context budget fits the result into your model window. The context debugger in the sidebar shows exactly what was included, truncated, or dropped.

::: details Deep dive
[Context Indexing](/understanding/repository-understanding/context-indexing) · [Repository Context](/understanding/repository-understanding/repository-context)
:::

---

## Agent Modes

Mitii separates thinking from doing with four explicit modes. The mode you choose determines what the agent is allowed to do:

| Mode | Writes | Shell | When to use |
|------|--------|-------|-------------|
| **Ask** | Blocked | Read-only | Q&A, exploration, explanation |
| **Plan** | Blocked | Read-only | Structured plans, audits, impact analysis |
| **Agent** | With approval | With approval | Implementation with per-step gates |
| **Review** | Blocked | Read-only | Code review and quality checks |

In **Agent** mode, the agent uses a set of workflow tools to stay on track:

| Tool | Purpose |
|------|---------|
| `ask_question` | Clarify ambiguous requests before acting |
| `propose_plan_mutation` | Propose changes to the current plan mid-run |
| `propose_file_scope` | Declare candidate file paths before reading or editing |
| `mark_step_complete` | Signal step completion for progress tracking |

::: details Deep dive
[Plan/Act Workflow](/understanding/agent-intelligence/plan-act) · [Planning](/understanding/agent-intelligence/planning) · [Tools Reference](/reference/tools)
:::

---

## Safety & Control

Every risky operation passes through two cooperating layers:

1. **Decision Policy** — decides *what* is allowed: execution route, planning depth, tool grant, verification requirements, prompt-injection scan.
2. **Tool Runtime** — enforces the grant: validates tool name, effect, path scope, command rules, network hosts, output limits, mutation batch limits.

The unit that flows between them is the **ToolGrant** — a structured policy object that specifies exactly what the agent may do in a given run:

| Dimension | Controls |
|-----------|----------|
| `maximumWorkspaceEffect` | Read-only → write → execute |
| `allowedTools` | Which tools the model may request |
| `pathScopes` | Filesystem paths the agent may touch |
| `commandRules` | Shell command allow/deny patterns |
| `networkHosts` | Per-endpoint network access |
| `limits` | Output size, batch size, timeout |
| `mutationBudget` | Max file mutations per run |
| `approvalMode` | `when_required` or `always` |

### Additional safety features

- **Prompt-injection defense** — Decision Policy scans for injection signals and clamps the ToolGrant before Tool Runtime sees the call
- **Verification requirements** — agent must produce evidence (test output, typecheck, lint) before claiming success
- **Mutation rollback** — Tool Runtime can revert a batch of file changes on failure
- **Audit trail** — every tool call, approval, and rejection is logged (SQLite + JSONL)
- **MCP Act-mode exclusions** — MCP tools are excluded from Agent mode by default

::: details Deep dive
[Safety Model](/understanding/agent-intelligence/safety) · [Decision Policy](/understanding/agent-intelligence/decision-policy) · [Tool Runtime](/understanding/execution/tool-runtime)
:::

---

## Code Intelligence

| Capability | Description |
|------------|-------------|
| **Code Navigation** | Resolve definitions, references, and hover info via the injected `CodeNavigationPort` |
| **Change Impact** | Walk the repository graph from a file/symbol/caret seed to estimate blast radius (affected files, packages, truncation signals) |
| **Repo Graph** | Dependency and dependent edges across files, symbols, and packages |

::: details Deep dive
[Code Navigation](/understanding/repository-understanding/code-navigation) · [Change Impact](/understanding/repository-understanding/change-impact)
:::

---

## Memory & Context

- **Hybrid retrieval** — FTS5 keyword + vector semantic search, merged and reranked
- **Access-based retention** — frequently accessed memories are retained longer
- **Privacy redaction** — hash reinforcement + Jaccard supersede to prevent sensitive data leakage
- **Checkpoints** — filesystem snapshots for safe rollback of agent changes
- **Session logs** — JSONL audit trail of every tool call and approval

::: details Deep dive
[Memory](/understanding/agent-intelligence/memory) · [Memory & Checkpoints](/understanding/agent-intelligence/memory-checkpoints)
:::

---

## Skills System

Mitii ships 12 bundled skills that shape agent behavior. Each skill is a focused instruction set that activates based on context:

| Skill | Focus |
|-------|-------|
| `safety-always` | Safety guardrails on every run |
| `ask-concise` | Concise, direct answers |
| `bugfix-localize` | Localize bugs before fixing |
| `planning-default` | Structured planning before action |
| `planning-and-task-breakdown` | Decompose specs into atomic tasks |
| `code-review-and-quality` | Review and quality checks |
| `debugging-and-error-recovery` | Systematic debugging |
| `git-workflow-and-versioning` | Atomic commits, clear history |
| `incremental-implementation` | Small, verifiable changes |
| `security-and-hardening` | OWASP-class risk hardening |
| `spec-driven-development` | Spec-first implementation |
| `test-driven-development` | TDD workflow |

Custom skills can be dropped into `.mitii/skills/` to override or extend bundled behavior.

::: details Deep dive
[Skills](/understanding/agent-intelligence/skills)
:::

---

## Provider Support

Mitii is LLM-agnostic via the `LlmPort` injection pattern — the SDK and V8 engine never see API keys; secrets stay on the provider port.

| Provider | Configuration |
|----------|---------------|
| Anthropic (Claude) | `ANTHROPIC_API_KEY` |
| Google (Gemini) | `GEMINI_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| DeepSeek | OpenAI-compatible endpoint |
| Ollama / LM Studio | Local, no key required |
| Any OpenAI-compatible | Custom base URL |

- **Token budget** — context window drives derived budgets for input/output
- **Profiles** — `.mitii/profiles.json` for per-project provider/model presets

::: details Deep dive
[Providers](/integrations/providers) · [Connect a Model](/using/connect-model)
:::

---

## MCP (Model Context Protocol)

MCP lets you extend Mitii with external tool servers. It is **off by default** (`mitii.mcp.enabled`).

- **Built-in catalog** — install MCP servers from Settings → Integrations
- **Act-mode exclusions** — MCP tools are excluded from Agent mode for safety
- Same approval policy as built-in tools when enabled

::: details Deep dive
[MCP Integration](/integrations/mcp)
:::

---

## Multi-Surface

The same agent core powers three surfaces:

| Surface | Package | Use case |
|---------|---------|----------|
| **VS Code Extension** | `apps/vscode` | IDE-integrated agent with sidebar UI, context debugger, approval queue |
| **CLI** | `@mitii/cli` | Headless terminal agent for CI, scripts, and remote workflows |
| **SDK** | `@mitii/sdk` | Host-neutral programmatic API for embedding Mitii in custom apps |

All three share the same `@mitii/v8` engine, `@mitii/host` kit, and safety model.

::: details Deep dive
[CLI](/using/cli) · [SDK](/using/sdk) · [Configuration](/using/configuration)
:::

---

## Architecture

```text
Validated Input → Cohesive Pipeline → Validated Result
```

| Package | Responsibility |
|---------|---------------|
| `@mitii/v8` | Agent engine, decision policy, tool runtime, code navigation, change impact |
| `@mitii/sdk` | Public host-neutral API (createMitiiClient, run lifecycle, LlmPort injection) |
| `@mitii/host` | Shared host kit: indexing, bundled embedding, checkpoints, memory, skills catalog |
| `@mitii/cli` | Headless CLI over SDK |
| `apps/vscode` | VS Code extension (F5 target, Marketplace: `mitii.mitii-ai-agent`) |

**Forbidden edges:** `host → apps`, `sdk → host`, `v8 → host`.

::: details Deep dive
[System Architecture](/understanding/architecture/system-architecture) · [Agent Runtime](/understanding/architecture/agent-runtime) · [Run Lifecycle](/understanding/architecture/run-lifecycle)
:::

---

## VitePress Features

The documentation site itself is built with [VitePress](https://vitepress.dev) and uses the following built-in capabilities:

| Feature | What it does |
|---------|-------------|
| **Local search** | Full-text search across all docs pages — press `Ctrl+K` or click the search bar in the header |
| **Dark-mode theming** | Monochrome light/dark palette defined in `custom.css`, toggled via the header icon |
| **Social links & footer** | GitHub and Discord icons in the header; copyright bar at the bottom |
| **Edit link** | "Edit this page on GitHub" link on every page |
| **Last updated** | Git-based timestamp shown on each page |
| **SEO meta tags** | Open Graph title/description, favicon, and theme-color for social sharing |
| **Outline TOC** | Right-hand "On this page" table of contents (capped at h3) |

### How to extend

- **Site config** — `docs/.vitepress/config.ts` (nav, sidebar, search, head, outline)
- **Theme & CSS** — `docs/.vitepress/theme/index.ts` + `docs/.vitepress/theme/custom.css`
- **Brand constants** — `brand.ts` (names, URLs, tagline)
