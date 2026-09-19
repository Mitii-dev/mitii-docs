# Why Mitii?

Mitii is a VS Code extension that gives an AI coding agent deep awareness of your repository, structured planning, and granular safety controls — all running locally on your machine.

Most AI coding assistants treat your repo like a chat attachment: a few open files, maybe a search, then edits. Mitii is built for **complex, multi-file work** where the agent must **understand the whole codebase**, **plan before it acts**, and **stay under your control** — without sending your code to a vendor server.

## What makes Mitii different

### 1. Local-first by design

Everything runs on your machine. Your workspace index, memory, session logs, and checkpoints live in the **`.mitii/`** directory inside your project.

- **Model providers** — connect to Ollama (local inference), vLLM (self-hosted serving), or any OpenAI-compatible endpoint. No Mitii cloud account required.
- **Secrets** — API keys are stored in VS Code SecretStorage (encrypted at the OS level) and never written to disk in plain text.
- **Audit trail** — every tool call, approval decision, and model response is logged as structured JSONL in `.mitii/logs/`.

### 2. Deep repo context — not just `@` mentions

Before you ask for edits, Mitii **indexes your workspace in the background** using multiple complementary strategies:

| Layer | What it does |
|-------|----------------|
| **FTS5** (SQLite full-text search) | Fast keyword search across all indexed files |
| **Tree-sitter** (incremental parser) | Extracts symbols — functions, classes, imports — across 100+ languages |
| **Repo map** | Computes a PageRank-style score over the import/export graph to surface structurally important files |
| **Vectors** | Optional MiniLM embeddings for semantic “find related code” queries |
| **Git + LSP** | Injects uncommitted diffs and live diagnostics into the agent's context |
| **Project rules** | Auto-loads `AGENTS.md`, `.cursor/rules`, `.clinerules`, `.mitii/rules` so conventions are always in scope |

A **hybrid retriever** merges all sources, a **reranker** trims noise, and a **token budgeter** fits the result into your model window. The **context debugger** in the sidebar shows exactly what was included, truncated, or dropped.

### 3. Plan before you act

Mitii separates **thinking** from **doing** into distinct modes:

| Mode | Writes | Shell | Use case |
|------|--------|-------|----------|
| **Ask** | Blocked | Read-only | Q&A, exploration |
| **Plan** | Blocked | Read-only | Structured plans, audits |
| **Agent** | With approval | With approval | Implementation |
| **Review** | Blocked | Read-only | Code review |

A typical workflow: switch to **Plan** mode to have the agent analyze the codebase and produce a step-by-step plan. Review the plan, then switch to **Agent** mode to execute it — each write and shell command still requires your approval.

Plans persist to SQLite and `.mitii/tasks/`, so you can resume a multi-step task across sessions. You can also configure a **cheaper plan model** (e.g., a small local model) and a **stronger act model** (e.g., a larger model for implementation) — set independently in settings.

### 4. Safety you can tune — not a single on/off switch

Mitii separates safety into two composable layers so you can set a broad posture and then override specific behaviors:

**Autonomy presets** — one-click profiles that set sensible defaults for a given trust level:

| Preset | Behavior |
|--------|----------|
| **Safe** | All edits and commands need approval; network access disabled |
| **Guided** (default) | Ask before file edits; read-only shell and web fetch allowed without prompting |
| **Builder** | Auto-approve file writes; mutating shell commands still require review |
| **Pilot** | High autonomy for writes; shell commands still gated |
| **Enterprise** | Locked down — no network, full review on every action |

**Approval modes** — fine-grained overrides that apply on top of the preset: `review_all`, `ask_edits`, `ask_deletes`, `ask_commands`, `auto`. For example, you might run **Builder** (auto-approve writes) but set `ask_commands` so shell commands still prompt.

Dangerous commands (`rm -rf`, `sudo`, force-push, etc.) are **blocked at the policy layer** regardless of mode or preset.

### 5. Human-in-the-loop at every risky step

- **Approval cards** in the sidebar for writes, patches, and shell commands
- **Inline diff** decorations in the editor with Accept / Reject commands
- Optional **VS Code diff tabs** before changes land
- **Git-stash checkpoints** (or file-copy fallback) before approved writes — restore from the Checkpoints panel
- **Untrusted workspace** blocking unless you explicitly opt in

### 6. MCP without lock-in

[MCP (Model Context Protocol)](https://modelcontextprotocol.io) is an open standard for exposing tools and data sources to AI agents. Mitii ships with built-in MCP servers (filesystem, memory, sequential-thinking) that start automatically, and lets you add custom servers via:

- VS Code settings
- `.mitii/mcp.json` or `.mcp.json`
- **Stdio**, **HTTP SSE**, or **Streamable HTTP** transports
- Bearer token / OAuth headers for remote servers

MCP tools are namespaced as `mcp__server__tool` and pass through the **same approval policy** as built-in tools.

### 7. Memory that survives sessions

Mitii maintains a persistent memory store so the agent can recall decisions, bugfixes, and preferences across conversations:

- `memory_search` / `memory_write` tools with FTS5 + optional vector hybrid search
- **Post-task extraction** automatically captures key decisions and context after each task
- **Memory panel** in the sidebar to browse, edit, or clear stored observations
- **Secret filtering** blocks API keys and credentials from being persisted

### 8. Full observability

You can inspect exactly what the agent is doing and why:

- **Context debugger** — see the token budget, which sources contributed, and what was truncated or dropped
- **Agent activity** — live feed of tool calls and approval status
- **Token meter** — per-turn and cumulative session usage
- **Session logs** — structured JSONL in `.mitii/logs/` for post-hoc analysis
- **History tab** — resume or inspect past conversations

## How Mitii compares

| Pain point | Typical agent | Mitii |
|------------|---------------|-------|
| Doesn't know the codebase | Searches on demand | Background index + hybrid retrieval across 6 sources |
| Wrong files in context | Fixed window | Reranker scores relevance; budgeter fits the model window; debugger shows what was included |
| Edits without oversight | Auto-apply | Approval queue + inline diff with Accept/Reject |
| Plans never executed | Chat-only plans | Plans persist to disk; Agent mode executes them step by step |
| Context runs out | Truncates silently | Compaction summarizes old turns; auto-continue resumes the task |
| No audit trail | Opaque | JSONL logs + approval audit table in `.mitii/logs/` |
| Vendor lock-in | One provider | 8 provider types; bring your own model (BYOM) |
| Rules ignored | Manual paste | Auto-loads project rules from `AGENTS.md`, `.cursor/rules`, etc. |

## Who Mitii is for

- **Solo developers** who want a local Ollama agent with real repo awareness
- **Teams** who need approval gates, audit logs, and enterprise safety presets
- **Power users** migrating from Cursor/Cline who want Plan/Act, MCP, and tunable autonomy
- **Privacy-conscious workflows** where code must not leave the machine

## What Mitii is not

- **Not a hosted SaaS** — you bring the model and the machine; Mitii is the orchestration layer
- **Not a headless browser** — `fetch_web` performs HTTP requests for docs and APIs; it does not render or interact with DOMs
- **Not a replacement for human code review** — Review mode surfaces issues and suggests fixes; you make the final call

## Next steps

- [Getting Started](/getting-started/)
- [Features overview](/features)
- [Architecture](/understanding/architecture/system-architecture)
- [Recent improvements](/changelog/recent-improvements)
