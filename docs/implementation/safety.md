# Safety & approvals

Mitii gates every risky operation through a policy engine and human approval queue.

## Policy flow

```
Tool call → ToolPolicyEngine → allow | require_approval | block
                ↓
         ApprovalQueue (if required)
                ↓
         User approves / denies
                ↓
         ToolExecutor.executeApproved()
```

## Autonomy presets

Quick profiles in **Settings → Safety**:

| Preset | Writes | Shell | Network | Approval mode |
|--------|--------|-------|---------|---------------|
| `safe` | Ask | Ask | **Off** | `review_all` |
| `guided` | Ask | Ask | On | `ask_edits` |
| `builder` | Auto | Ask | On | `ask_commands` |
| `pilot` | Auto | Ask | On | `ask_commands` |
| `enterprise` | Ask | Ask | **Off** | `review_all` |

Setting: `thunder.safety.autonomyPreset` (default: `guided`)

## Approval modes

Fine-grained control via `thunder.safety.approvalMode`:

| Mode | File edits | Shell commands |
|------|------------|----------------|
| `review_all` | Ask | Ask (except read-only) |
| `ask_edits` | Ask | Auto (except delete-like) |
| `ask_deletes` | Auto | Ask only for deletes |
| `ask_commands` | Auto | Ask |
| `auto` | Auto | Auto |

Dangerous commands are **always blocked** regardless of mode.

## Blocked command patterns

Examples always blocked:

- `rm -rf`, `sudo`, `chmod -R`
- `curl | sh`, `wget | sh`
- `git push --force`
- `npm publish`

Configurable via `thunder.safety.blockDangerousCommands`.

## Read-only tools (auto-allowed)

`read_file`, `search`, `repo_map`, `retrieve_context`, `git_diff`, `diagnostics`, `memory_search`, `spawn_research_agent`, etc.

Exceptions:

- `fetch_web` — requires `allowNetwork` (off in safe/enterprise)
- `ask_question` — always requires user response

## Untrusted workspaces

VS Code untrusted workspaces block writes and shell unless:

```json
{
  "thunder.safety.allowUntrustedWorkspace": true
}
```

## Approval UI

- **Approval cards** — Approve, Approve for task, Deny
- **Questions** — `ask_question` renders as multiple-choice buttons
- **View in editor** — inline diff for write/patch approvals

## Inline diff commands

| Command | Action |
|---------|--------|
| Mitii: Accept Inline Diff | Approve pending change |
| Mitii: Reject Inline Diff | Deny pending change |
| Mitii: Show Inline Diff | Open editor decorations |

## Diff preview tabs

Optional VS Code diff tabs before execution:

```json
{
  "thunder.agent.showDiffPreview": true
}
```

Default is `false` to avoid editor focus changes.

## Checkpoints

Auto-checkpoint before approved writes — see [Memory & checkpoints](/implementation/memory-checkpoints).

## Audit trail

Every approval decision logged to:

- SQLite `approval_audit` table
- JSONL session log (`approval_decision` events)

## Network access

`thunder.safety.allowNetwork` controls `fetch_web`. Autonomy presets set this automatically.
