# Why Mitii?

Most AI coding assistants treat your repo like a chat attachment: a few open files, maybe a search, then edits. Mitii is built for **complex, multi-file work** where the agent must **understand the whole codebase**, **plan before it acts**, and **stay under your control** — without sending your code to a vendor server.

## What makes Mitii different

### 1. Local-first by design

- Your workspace index, memory, session logs, and checkpoints live in **`.mitii/`** on your machine
- Default workflow uses **Ollama, vLLM, or your own endpoint** — no Mitii cloud required
- API keys stay in **VS Code SecretStorage**; traffic goes only to the provider you configure
- JSONL audit logs give you a complete record of every tool call and approval

### 2. Deep repo context — not just `@` mentions

Mitii **indexes your workspace in the background** before you ask for edits:

| Layer | What it does |
|-------|----------------|
| **FTS5** | Fast keyword search across indexed files |
| **Tree-sitter** | Symbol extraction across 100+ languages |
| **Repo map** | PageRank over imports/exports — surfaces structurally important files |
| **Vectors** | Optional MiniLM embeddings for semantic “find related code” |
| **Git + LSP** | Uncommitted diffs and diagnostics injected into context |
| **Project rules** | Auto-loads `AGENTS.md`, `.cursor/rules`, `.clinerules`, `.mitii/rules` |

A **hybrid retriever** merges all sources, a **reranker** trims noise, and a **token budgeter** fits the result into your model window. The **context debugger** in the sidebar shows exactly what was included, truncated, or dropped.

### 3. Plan before you act

Mitii separates **thinking** from **doing**:

| Mode | Writes | Shell | Use case |
|------|--------|-------|----------|
| **Ask** | Blocked | Read-only | Q&A, exploration |
| **Plan** | Blocked | Read-only | Structured plans, audits |
| **Agent** | With approval | With approval | Implementation |
| **Review** | Blocked | Read-only | Code review |

Plans persist to SQLite and `.mitii/tasks/`. You can use a **cheaper plan model** and a **stronger act model** — configured separately in settings.

### 4. Safety you can tune — not a single on/off switch

Two layers work together:

**Autonomy presets** — quick profiles:

| Preset | Behavior |
|--------|----------|
| **Safe** | All edits and commands need approval; network off |
| **Guided** (default) | Ask before file edits; read-only shell and web fetch allowed |
| **Builder** | Auto-approve writes; mutating shell still reviewed |
| **Pilot** | High autonomy for writes; shell still gated |
| **Enterprise** | Locked down — no network, full review |

**Approval modes** — fine-grained control: `review_all`, `ask_edits`, `ask_deletes`, `ask_commands`, `auto`.

Dangerous commands (`rm -rf`, `sudo`, force-push, etc.) are **blocked at the policy layer** regardless of mode.

### 5. Human-in-the-loop at every risky step

- **Approval cards** in the sidebar for writes, patches, and shell commands
- **Inline diff** decorations in the editor with Accept / Reject commands
- Optional **VS Code diff tabs** before changes land
- **Git-stash checkpoints** (or file-copy fallback) before approved writes — restore from the Checkpoints panel
- **Untrusted workspace** blocking unless you explicitly opt in

### 6. MCP without lock-in

Built-in MCP servers (filesystem, memory, sequential-thinking) start automatically. Add custom servers via:

- VS Code settings
- `.mitii/mcp.json` or `.mcp.json`
- **Stdio**, **HTTP SSE**, or **Streamable HTTP** transports
- Bearer token / OAuth headers for remote servers

MCP tools are namespaced as `mcp__server__tool` and pass through the **same approval policy** as built-in tools.

### 7. Memory that survives sessions

- `memory_search` / `memory_write` tools with FTS5 + optional vector hybrid search
- Post-task extraction captures decisions, bugfixes, and preferences
- **Memory panel** in the sidebar to browse and clear observations
- Secret filtering blocks API keys from being stored

### 8. Full observability

- **Context debugger** — budget meters, source breakdown, dropped items
- **Agent activity** — live tool and approval status
- **Token meter** — per-turn and session usage
- **Session logs** — structured JSONL in `.mitii/logs/`
- **History tab** — resume past conversations

## How Mitii compares

| Pain point | Typical agent | Mitii |
|------------|---------------|-------|
| Doesn't know the codebase | Searches on demand | Background index + hybrid retrieval |
| Wrong files in context | Fixed window | Reranker + budgeter + debugger |
| Edits without oversight | Auto-apply | Approval queue + inline diff |
| Plans never executed | Chat-only plans | Persisted plans + Act mode tool loop |
| Context runs out | Truncates silently | Compaction + auto-continue + task state |
| No audit trail | Opaque | JSONL logs + approval audit table |
| Vendor lock-in | One provider | 8 provider types + BYOM |
| Rules ignored | Manual paste | Auto-loads project rules from repo |

## Who Mitii is for

- **Solo developers** who want a local Ollama agent with real repo awareness
- **Teams** who need approval gates, audit logs, and enterprise safety presets
- **Power users** migrating from Cursor/Cline who want Plan/Act, MCP, and tunable autonomy
- **Privacy-conscious workflows** where code must not leave the machine

## What Mitii is not

- Not a hosted SaaS — you bring the model and the machine
- Not a headless browser — `fetch_web` is HTTP fetch for docs/APIs, not DOM automation
- Not a replacement for code review by humans — Review mode assists; you decide

## Next steps

- [Getting Started](/getting-started/)
- [Features overview](/features/)
- [Architecture](/architecture)
- [Recent improvements](/implementation/recent-improvements)
