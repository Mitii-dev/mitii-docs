# Memory & checkpoints

Mitii persists knowledge and file state so you can recover from mistakes and build on past sessions.

## Long-term memory

### Tools

| Tool | Purpose |
|------|---------|
| `memory_search` | Hybrid FTS5 + optional vector search over observations |
| `memory_write` | Store decisions, preferences, bugfixes, architecture notes |

### Observation types

`decision`, `bugfix`, `refactor`, `architecture`, `user_preference`, `failed_attempt`, `file_fact`, `command_result`

### How memory gets populated

1. **Agent writes** via `memory_write` during tasks
2. **Post-task extraction** — `MemoryExtractor` summarizes completed work (async)
3. **Passive injection** — relevant memories auto-injected into new chat context

### Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `thunder.memory.enabled` | `true` | Enable memory system |
| `thunder.memory.hybridSearchEnabled` | `true` | FTS + vector hybrid search |
| `thunder.memory.maxItems` | `500` | Max observations |
| `thunder.memory.summarizeAfterTask` | `true` | Extract memories after tasks |

### Memory panel

The sidebar **Memory** tab lists recent observations. Delete individual items or **Clear all**. Data stored in `mitii.sqlite` → `observations` table.

### Safety

Secret patterns (API keys, tokens) are filtered from memory writes.

---

## Checkpoints

Checkpoints capture file state **before approved writes** so you can roll back.

### Strategies

Set `thunder.agent.checkpointStrategy`:

| Strategy | Behavior |
|----------|----------|
| `git-stash` (default) | `git stash push` for affected files when in a git repo |
| `shadow-git` | Stash with `mitii-shadow:` message prefix |
| `file-copy` | Copy files to `.mitii/checkpoints/<id>/` |

If git stash fails, Mitii falls back to file copy automatically.

### When checkpoints are created

- Before approved `write_file` or `apply_patch`
- Metadata includes branch name and diff snapshot when git is available

### Restore

1. Open **Checkpoints** tab in the chat sidebar
2. Click **Restore** on a checkpoint
3. Files revert via stash apply or file copy

Checkpoint metadata stored in SQLite; file copies in `.mitii/checkpoints/`.

### Cleanup

Old checkpoints are pruned after 7 days by default (`CheckpointService.cleanup`).

---

## Session history

- **History tab** — browse past chat threads (title, message count, token totals)
- **Resume** — open a thread to continue conversation
- Stored in SQLite `agent_sessions` / `agent_turns`

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
