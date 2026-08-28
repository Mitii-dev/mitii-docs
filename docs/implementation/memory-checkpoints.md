# Memory & checkpoints

Mitii persists knowledge and file state so you can recover from mistakes and build on past sessions. The **Memory** module (in `@mitii/v8`) retrieves and commits durable facts scoped to a **user**, **workspace**, or **project**, and supplies relevant prior preferences to Prompt Construction as instruction blocks. Checkpoints (managed by `@mitii/host`) capture file state before approved writes so you can roll back.

---

## Long-term memory

### What it does

- Retrieves candidate memory facts from an injected store
- Filters by **scope** (user / workspace / project), **privacy**, **expiry**, and **superseded versions**
- Ranks with **BM25** fused with file-target hits and an optional embedding port
- Applies **access-based retention** — cold facts lose rank over time (no hard 30-day delete)
- Enforces a **token budget** and **max-fact limit**
- Returns **prompt-ready instruction blocks** that Prompt Construction injects into the next turn
- Commits new facts after **privacy redaction**, **hash reinforcement**, and **Jaccard supersede** (near-duplicate detection)

### Tools

| Tool | Purpose |
|------|---------|
| `memory_search` | Hybrid BM25 + optional vector search over stored facts |
| `memory_write` | Store decisions, preferences, bugfixes, architecture notes |

### Observation types

`decision`, `bugfix`, `refactor`, `architecture`, `user_preference`, `failed_attempt`, `file_fact`, `command_result`

### How memory gets populated

1. **Agent writes** — the model calls `memory_write` during a task
2. **Post-task extraction** — a host capture helper (`buildSyntheticMemoryDraft`) summarizes completed work asynchronously
3. **Passive injection** — relevant memories are retrieved and injected as instruction blocks into the next chat turn

### Storage

| Location | What lives there |
|----------|-----------------|
| `.mitii/memory/facts.json` | Committed memory facts (workspace-scoped) |
| SQLite `observations` table | VS Code Memento-backed observations (app-level) |

An empty store is a **cold start** (`memory_empty` reason code), not a missing adapter. Reusable facts are only available after a prior run committed them.

### Settings

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.memory.enabled` | `true` | Enable the memory system |
| `mitii.memory.hybridSearchEnabled` | `true` | BM25 + vector hybrid search |
| `mitii.memory.maxItems` | `500` | Max facts returned per retrieval |
| `mitii.memory.summarizeAfterTask` | `true` | Extract memories after task completion |

### Memory panel

The sidebar **Memory** tab lists recent observations. Delete individual items or **Clear all**.

### Safety

- Secret patterns (API keys, tokens) are **redacted** before commit
- Privacy level is stored per-fact and enforced at retrieval time
- Near-duplicate facts are superseded via Jaccard similarity (no unbounded growth)

---

## Checkpoints

Checkpoints capture file state **before approved writes** so you can roll back. They are part of V8's safety model: "Safe execution with explicit capabilities, approvals, checkpoints, and evidence."

### Strategies

Set `mitii.agent.checkpointStrategy`:

| Strategy | Behavior |
|----------|----------|
| `git-stash` (default) | `git stash push` for affected files when in a git repo |
| `shadow-git` | Stash with `mitii-shadow:` message prefix |
| `file-copy` | Copy files to `.mitii/checkpoints/<id>/` |

If git stash fails, Mitii falls back to file copy automatically.

### When checkpoints are created

- Before approved `write_file` or `apply_patch` (enforced by the **Tool Runtime**)
- Metadata includes branch name and diff snapshot when git is available

### Restore

1. Open **Checkpoints** tab in the chat sidebar
2. Click **Restore** on a checkpoint
3. Files revert via stash apply or file copy

### Storage

| Location | What lives there |
|----------|-----------------|
| SQLite | Checkpoint metadata (id, timestamp, strategy, file list) |
| `.mitii/checkpoints/<id>/` | File copies (file-copy strategy) |

### Cleanup

Old checkpoints are pruned after **7 days** by default.

---

## Session history

- **History tab** — browse past chat threads (title, message count, token totals)
- **Resume** — open a thread to continue conversation
- Stored in SQLite `agent_sessions` / `agent_turns` (injected by the app)

---

## Plan persistence

Plans save to:

- SQLite `task_plans` table
- `.mitii/tasks/<session-id>/plan.json`

Survives VS Code restarts and approval pauses.

---

## Session logs

Structured JSONL in `.mitii/logs/<session-id>.jsonl`:

- Tool start/end events
- Approval decisions
- Token usage rollups
- Errors and timing

Export via **Mitii: Export Session Log** command.

---

## Codebase location

| Concern | Owner |
|---------|-------|
| Memory pipeline (retrieve, rank, commit, budget) | `@mitii/v8` → `memory/` module |
| Memory store adapter (file-based) | `@mitii/host` → `ports/memory` |
| VS Code Memento memory | `apps/vscode` |
| Checkpoint strategies (git-stash, file-copy) | `@mitii/host` → `ports/checkpoints` |
| Checkpoint enforcement (when to snapshot) | `@mitii/v8` → Tool Runtime |
| Session / plan persistence (SQLite) | App (injected via `openDatabase` port) |
| Public API surface | `@mitii/sdk` |
