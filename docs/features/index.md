# Features

Mitii combines deep workspace indexing with a safe Plan/Act agent workflow.

## Context and indexing

- **Workspace scanner** respects `.gitignore` and `.thunderignore`; auto-indexes on folder open
- **FTS5 full-text search** with ripgrep fallback for unindexed paths
- **Symbol extraction** for TypeScript, JavaScript, Python, Java, Go
- **PageRank repo map** — surfaces structurally important files
- **Vector search** — local MiniLM embeddings via `@xenova/transformers`; SQLite or LanceDB backend
- **Hybrid retriever + reranker** — merges search, vectors, mentioned files, git state, and LSP diagnostics

## Agent workflow

- **Plan / Act / Review modes** — plan before you touch code; act with tools; review without rewriting
- **Tool loop** — `read_file`, `search`, `write_file`, `apply_patch`, `run_command`, `git_diff`, `diagnostics`, and more
- **Research subagents** — parallel read-only workers for exploration
- **Task decomposition** — multi-step plans with lifecycle tracking
- **Post-edit verification** — configurable lint/test commands after Act-mode runs
- **Skills catalog** — drop `SKILL.md` files in `.thunder/skills/` and invoke via `use_skill`

## Safety and control

- **Approval modes** — `review_all`, `ask_edits`, `ask_deletes`, `ask_commands`, `auto`
- **Autonomy presets** — `safe`, `guided`, `builder`, `pilot`, `enterprise` (network disabled)
- **Untrusted workspace blocking** — writes and shell disabled unless you opt in
- **Auto-checkpoints** before approved file writes
- **Optional diff preview** in VS Code before patches land

## Memory and persistence

- **Long-term memory** — `memory_search` / `memory_write` with FTS5 + optional vector hybrid search
- **Post-task memory extraction** — observations captured after completed work
- **Session history** — resume from the History tab
- **Plan persistence** — plans saved to SQLite and `.thunder/tasks/`

## MCP and integrations

Preloaded keyless MCP servers (disable with `thunder.mcp.preloadBuiltin: false`):

| Server | Purpose |
|--------|---------|
| `filesystem` | Scoped file access for the open workspace |
| `memory` | Cross-session knowledge graph |
| `sequential-thinking` | Structured reasoning helper |

Add your own via `thunder.mcp.servers`, `.thunder/mcp.json`, or `.mcp.json`.

## UI

React sidebar webview with chat, history, settings, approval cards, subagent activity panel, plan panel, checkpoint browser, indexing status, context budget warnings, and token meter.

## How Mitii compares

| Pain point | What Mitii does |
|------------|------------------|
| Agent doesn't know the codebase | Background workspace index with FTS, symbols, vectors, repo map |
| Wrong files in context | Hybrid retrieval + reranker + token budgeter |
| Edits without oversight | Approval queue for writes and shell; tunable autonomy presets |
| Plans that never get executed | Plan mode persists steps; Act mode runs the tool loop |
| Context runs out mid-task | Conversation compaction, auto-continue, task state between pauses |
| No audit trail | JSONL session logs in `.thunder/logs/` |
| Locked into one vendor's rules | Loads AGENTS.md, .cursor/rules, .clinerules, and `.thunder/rules` |
