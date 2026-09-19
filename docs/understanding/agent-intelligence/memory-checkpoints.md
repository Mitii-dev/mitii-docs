# Memory & checkpoints

Mitii persists two kinds of state across sessions:

- **Memory** — durable facts about your project, your preferences, and past decisions. The memory pipeline (in `@mitii/v8`) retrieves relevant facts at the start of each turn and injects them into the model's context so the agent doesn't start from zero.
- **Checkpoints** — snapshots of file state taken before approved writes, so you can roll back a change. Checkpoint strategies are implemented in `@mitii/host`.

Together they give the agent continuity (memory) and safety (checkpoints).

---

## Long-term memory

Memory stores structured facts — decisions, preferences, bugfixes, architecture notes — scoped to a **user**, **workspace**, or **project**. At the start of a turn, the memory pipeline retrieves the facts most relevant to the current request and hands them to Prompt Construction as **instruction blocks**, which are appended to the model's context for that turn.

### How retrieval works

1. Candidate facts are pulled from the memory store.
2. They are filtered by **scope** (user / workspace / project), **privacy level**, **expiry**, and **superseded versions** (older facts replaced by newer ones).
3. Surviving facts are ranked using **BM25** (a keyword-relevance score) fused with file-target hits and, when available, an optional embedding-based (vector) score.
4. **Access-based retention** adjusts the ranking: frequently retrieved facts stay prominent, while cold facts gradually lose rank. There is no hard 30-day deletion.
5. A **token budget** and **max-fact limit** cap how much memory context is injected.
6. The result is a set of prompt-ready instruction blocks for the next turn.

### How facts are committed

When a new fact is stored, it passes through three safeguards:

- **Privacy redaction** — secret patterns (API keys, tokens) are stripped before the fact is written.
- **Hash reinforcement** — a content hash is attached so identical facts can be detected.
- **Jaccard supersede** — near-duplicate facts (high Jaccard similarity) replace the older version instead of accumulating, so the store doesn't grow unbounded.

### Tools

| Tool | Purpose |
|------|---------|
| `memory_search` | Hybrid BM25 + optional vector search over stored facts |
| `memory_write` | Store decisions, preferences, bugfixes, architecture notes |

Facts are typed with one of these observation types: `decision`, `bugfix`, `refactor`, `architecture`, `user_preference`, `failed_attempt`, `file_fact`, `command_result`.

### How memory gets populated

1. **Agent writes** — the model calls `memory_write` during a task (e.g. after learning a project convention).
2. **Post-task extraction** — a host capture helper (`buildSyntheticMemoryDraft`) asynchronously summarizes completed work into candidate facts.
3. **Passive injection** — on the next turn, relevant facts are retrieved and injected as instruction blocks.

A typical cycle: in session one you tell the agent "we use pnpm, not npm" and it commits that as a `user_preference`. In session two, the retrieval pipeline surfaces that fact before the agent runs any install command.

### Storage

| Location | What lives there |
|----------|-----------------|
| `.mitii/memory/facts.json` | Committed memory facts (workspace-scoped) |
| SQLite `observations` table | VS Code Memento-backed observations (app-level) |

An empty store is a **cold start** (reported with the `memory_empty` reason code), not a missing adapter. Reusable facts only exist after a prior run committed them.

### Settings

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.memory.enabled` | `true` | Enable the memory system |
| `mitii.memory.hybridSearchEnabled` | `true` | BM25 + vector hybrid search |
| `mitii.memory.maxItems` | `500` | Max facts returned per retrieval |
| `mitii.memory.summarizeAfterTask` | `true` | Extract memories after task completion |

### Memory panel

The sidebar **Memory** tab lists recent observations. Delete individual items or **Clear all**.

---

## Checkpoints

Checkpoints capture file state **before approved writes** so you can roll back. They are part of V8's safety model: "Safe execution with explicit capabilities, approvals, checkpoints, and evidence."

### When checkpoints are created

- Before any approved `write_file` or `apply_patch` (enforced by the **Tool Runtime**)
- Metadata includes the branch name and a diff snapshot when git is available

### Strategies

Set `mitii.agent.checkpointStrategy` to choose how state is captured:

| Strategy | Behavior |
|----------|----------|
| `git-stash` (default) | `git stash push` for affected files when in a git repo |
| `shadow-git` | Stash with a `mitii-shadow:` message prefix |
| `file-copy` | Copy files to `.mitii/checkpoints/<id>/` |

If git stash fails, Mitii falls back to file copy automatically.

### Restoring a checkpoint

1. Open the **Checkpoints** tab in the chat sidebar.
2. Click **Restore** on the checkpoint you want.
3. Files revert via stash apply or file copy, depending on the strategy used.

### Storage

| Location | What lives there |
|----------|-----------------|
| SQLite | Checkpoint metadata (id, timestamp, strategy, file list) |
| `.mitii/checkpoints/<id>/` | File copies (file-copy strategy) |

Old checkpoints are pruned after **7 days** by default.

---

## Session persistence

Beyond memory and checkpoints, Mitii persists session-level state:

- **History** — the **History** tab lists past chat threads (title, message count, token totals). Open a thread to resume the conversation. Stored in SQLite `agent_sessions` / `agent_turns` (injected by the app).
- **Plans** — saved to the SQLite `task_plans` table and `.mitii/tasks/<session-id>/plan.json`. Plans survive VS Code restarts and approval pauses.
- **Session logs** — structured JSONL in `.mitii/logs/<session-id>.jsonl`, containing tool start/end events, approval decisions, token usage rollups, and errors with timing. Export via the **Mitii: Export Session Log** command.

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

For a deeper look at the memory module's internal structure, contracts, and types, see [Memory](/understanding/agent-intelligence/memory).
