# Features

Mitii combines **deep workspace indexing** with a **safe Plan/Act agent workflow** — local-first, approval-gated, and auditable.

::: tip New in v2.6
Context debugger, memory browser, checkpoint panel, 8 LLM providers, plan/act model split, MCP HTTP/SSE, git-stash checkpoints, inline diff accept/reject, **Cursor-style Planner UI**, and **planning skills auto-load**. See [Recent improvements](/implementation/recent-improvements).
:::

## Why Mitii?

[What makes Mitii different →](/why-mitii)

## Context and indexing

- **Workspace scanner** respects `.gitignore` and `.mitiiignore`; auto-indexes on folder open
- **FTS5 full-text search** with ripgrep fallback for unindexed paths
- **Tree-sitter WASM** symbol extraction (100+ languages) with regex fallback
- **PageRank repo map** — surfaces structurally important files
- **Vector search** — local MiniLM via `@xenova/transformers`; SQLite or LanceDB backend
- **Hybrid retriever + reranker** — merges search, vectors, rules, mentions, git, LSP, memory
- **Context debugger** — live budget meters, source breakdown, dropped-item visibility
- **Pinned `@` context** — explicit file/folder mentions always considered

[Deep dive: Context & indexing →](/implementation/context-indexing)

## Agent workflow

- **Ask / Plan / Agent / Review modes** — separate analysis from execution
- **Plan vs Act models** — optional cheaper planner, stronger implementer
- **Tool loop** — 20+ built-in tools + dynamic MCP tools
- **Research subagents** — `spawn_research_agent` for parallel read-only exploration
- **Task decomposition** — multi-step plans with lifecycle tracking and persistence
- **Cursor-style Planner panel** — phased steps, requirement analysis, skill chips, expandable step details in Plan mode
- **Planning skills** — auto-loads `planning-and-task-breakdown` and related playbooks during orchestrated planning
- **Post-edit verification** — configurable lint/test after Act-mode runs
- **Skills catalog** — `.mitii/skills/SKILL.md` invoked via `use_skill` and auto-injected during planning
- **Auto-continue** — agent keeps working across step-limit boundaries
- **Conversation compaction** — long sessions trimmed intelligently

[Deep dive: Plan / Act →](/implementation/plan-act)

## Safety and control

- **Five autonomy presets** — safe, guided, builder, pilot, enterprise (distinct behavior)
- **Five approval modes** — review_all, ask_edits, ask_deletes, ask_commands, auto
- **Dangerous command blocking** — rm -rf, sudo, force-push, etc.
- **Untrusted workspace blocking** — writes/shell disabled unless opted in
- **Git-stash checkpoints** — restore from Checkpoints panel
- **Inline diff** — accept/reject in editor; optional VS Code diff tabs
- **Approval cards** — approve once, approve for task, or deny

[Deep dive: Safety →](/implementation/safety)

## Memory and persistence

- **Long-term memory** — `memory_search` / `memory_write` with FTS5 + vector hybrid
- **Memory panel** — browse and clear observations in sidebar
- **Post-task extraction** — async summarization after completed work
- **Session history** — resume from History tab
- **Plan persistence** — SQLite + `.mitii/tasks/`
- **JSONL audit logs** — every tool, approval, token event in `.mitii/logs/`

[Deep dive: Memory & checkpoints →](/implementation/memory-checkpoints)

## LLM providers

Eight provider types: OpenAI-compatible, OpenAI, Anthropic, Gemini, DeepSeek, Cursor, Codex, Echo.

- Native Anthropic Messages API and Gemini GenerateContent API
- Local Ollama/vLLM via OpenAI-compatible endpoint
- API keys in VS Code SecretStorage
- Connection test in settings UI

[Deep dive: Providers →](/implementation/providers)

## MCP and integrations

- **Built-in servers** — filesystem, memory, sequential-thinking (keyless via npx)
- **Transports** — stdio, HTTP SSE, Streamable HTTP
- **Remote auth** — bearer tokens in headers
- **Workspace config** — `.mitii/mcp.json`, `.mcp.json`, VS Code settings
- **Integrations UI** — toggle builtins, add custom servers, view status

[Deep dive: MCP →](/implementation/mcp)

## Web fetch

- **`fetch_web` tool** — HTTP fetch for external docs and API references
- HTML stripped to plain text; network gated by safety preset

## UI

React sidebar webview:

- Chat with streaming, Shiki code blocks, markdown
- History, Settings (7 tabs)
- Plan panel, approval cards, agent activity
- Context debugger, memory browser, checkpoint browser
- Pinned context, token meter, indexing status
- Context warning banner when budget is tight

## Project rules

Auto-loaded from repo:

- `AGENTS.md`, `CLAUDE.md`, `WARP.md`, `.cursorrules`
- `.mitii/rules`, `.clinerules`, `.cursor/rules`, `.continue/rules`

## How Mitii compares

| Pain point | What Mitii does |
|------------|------------------|
| Agent doesn't know the codebase | Background index: FTS, symbols, vectors, repo map |
| Wrong files in context | Hybrid retrieval + reranker + context debugger |
| Edits without oversight | Approval queue + inline diff + checkpoints |
| Plans that never get executed | Plan mode persists steps; Agent mode runs tool loop |
| Context runs out mid-task | Compaction, auto-continue, task state across approvals |
| No audit trail | JSONL session logs + approval audit table |
| Locked into one vendor | 8 provider types + MCP + project rules from any editor |
| Opaque safety | Named presets + approval modes + policy engine |

## Tool reference

[Full built-in tool catalog →](/implementation/tools)
