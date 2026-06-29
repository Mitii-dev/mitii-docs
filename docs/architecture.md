# Architecture

Mitii is a VS Code extension with a local agent core — no central server required.

## High-level layout

```
VS Code Extension
  └─ ThunderController
       ├─ SQLite Index (FTS5, symbols, vectors, sessions, memory)
       ├─ HybridRetriever → ContextBudgeter
       ├─ ChatOrchestrator
       │    ├─ AgentLoop (tool round-trip)
       │    └─ PlanExecutor (step engine)
       ├─ ToolRuntime → ToolPolicyEngine → ApprovalQueue
       ├─ PatchApplyService / CheckpointService
       ├─ MemoryService + PostTaskMemoryWorker
       └─ McpManager
```

## Data storage

All workspace data lives in `.thunder/` inside your project:

| Path | Purpose |
|------|---------|
| `thunder.sqlite` | Index, sessions, memory, plans |
| `logs/*.jsonl` | Session audit logs |
| `checkpoints/` | File snapshots before writes |
| `tasks/` | Persisted plan JSON |

Nothing is sent to a Mitii server — there isn't one.

## Source layout

| Directory | Role |
|-----------|------|
| `src/core/` | Agent loop, indexing, retrieval, tools, safety, MCP |
| `src/vscode/` | VS Code commands, webview provider |
| `src/webview-ui/` | React sidebar UI |
| `src/shared/` | Shared constants (brand, etc.) |

## Context pipeline

1. User message + `@` mentions + editor state
2. Hybrid retriever merges FTS, vectors, repo map, git diff, diagnostics
3. Reranker trims to top chunks
4. Token budgeter fits context into model window
5. Agent loop calls tools; approvals gate writes and shell

## Retrieval stack

- **FTS5** — fast lexical search over indexed files
- **Vectors** — semantic similarity via local MiniLM embeddings
- **Repo map** — PageRank over import/symbol graph
- **Git + LSP** — recent changes and diagnostics

## Safety layer

Every tool call passes through `ToolPolicyEngine`. Writes and shell commands enter an approval queue based on your autonomy preset and approval mode. Dangerous command patterns are blocked before execution.

## Webview

The sidebar is a Vite-built React app communicating with the extension via `postMessage`. State includes chat messages, indexing progress, pending approvals, plan steps, and settings.

See [Development](/development) for build and test commands.
