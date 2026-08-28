# Safety & approvals

Mitii gates every risky operation through two cooperating layers:

1. **Decision Policy** (V8's authority module) — converts request evidence into a single `ExecutionDecision` that determines the execution route, planning depth, tool grant, verification requirements, and approval mode.
2. **Tool Runtime** (V8's enforcement layer) — validates every tool call against the `ToolGrant` and executes through host ports. It never decides whether a tool is allowed; it only enforces the grant it receives.

A human approval queue sits between the two for any action that requires consent.

## Policy flow

```
Tool call → Decision Policy → ExecutionDecision → allow | require_approval | block
                ↓
         ApprovalQueue (if required)
                ↓
         User approves / denies
                ↓
         Tool Runtime validates against ToolGrant
                ↓
         Execute through host ports → bounded ToolResult + audit event
```

## What Decision Policy decides

| Concern | Detail |
|---------|--------|
| Execution route | `execute`, `plan`, or `clarify` |
| Planning depth | `none`, `light`, `full` |
| Plan gate | Whether a plan must be approved before execution |
| Tool grant | Allowed tools, effects, path scopes, command rules, network hosts, limits, mutation budget |
| Verification | Required evidence (e.g. tests or diagnostics) before the run is considered complete |
| Prompt-injection scan | Detects injection signals in the request and clamps authority when needed |
| Reason codes | Structured codes (e.g. `execute_requested`, `localized_change`, `verification_required`) for audit and debugging |

## Autonomy presets

Quick profiles in **Settings → Modes**:

| Preset | Writes | Shell | Network | Approval mode |
|--------|--------|-------|---------|---------------|
| `safe` | Ask | Ask | **Off** | `review_all` |
| `guided` | Ask | Ask | On | `ask_edits` |
| `builder` | Auto | Ask | On | `ask_commands` |
| `pilot` | Auto | Ask | On | `ask_commands` |
| `enterprise` | Ask | Ask | **Off** | `review_all` |

Setting: `mitii.safety.autonomyPreset` (default: `guided`)

## Approval modes

Fine-grained control via `mitii.safety.approvalMode`:

| Mode | File edits | Shell commands |
|------|------------|----------------|
| `review_all` | Ask | Ask (except read-only) |
| `ask_edits` | Ask | Auto (except delete-like) |
| `ask_deletes` | Auto | Ask only for deletes |
| `ask_commands` | Auto | Ask |
| `auto` | Auto | Auto |

Dangerous commands are **always blocked** regardless of mode.

## Tool grant & mutation budget

Every `ExecutionDecision` carries a `ToolGrant` that the Tool Runtime enforces:

| Field | Purpose |
|-------|---------|
| `maximumWorkspaceEffect` | Highest effect allowed (`read`, `write`, `execute`) |
| `allowedTools` / `allowedEffects` | Which tools and side-effects are permitted |
| `pathScopes` | Workspace paths the agent may touch |
| `commandRules` | Allowed / blocked shell command patterns |
| `networkHosts` | Permitted network endpoints (empty = no network) |
| `limits` | `maxToolCalls`, `maxWallTimeMs`, `maxOutputBytes` |
| `mutationBudget` | `maxPatchesPerCall`, `maxUniqueFilesPerCall`, `maxPatchPayloadCharacters`, `requireBatchedExecution` |
| `approvalMode` | `on_request`, `auto`, or `never` |

The mutation budget prevents a single tool call from rewriting an unbounded number of files or emitting oversized payloads.

## Blocked command patterns

Examples always blocked:

- `rm -rf`, `sudo`, `chmod -R`
- `curl | sh`, `wget | sh`
- `git push --force`
- `npm publish`

Configurable via `mitii.safety.blockDangerousCommands`.

## Read-only tools (auto-allowed)

`read_file`, `search`, `repo_map`, `retrieve_context`, `git_diff`, `diagnostics`, `memory_search`, `spawn_research_agent`, etc.

Exceptions:

- `fetch_web` — requires `allowNetwork` (off in safe/enterprise)
- `ask_question` — always requires user response

## Prompt-injection defense

Decision Policy scans the incoming request for prompt-injection signals. When detected, it clamps the resulting `ToolGrant` — reducing allowed effects, narrowing path scopes, or escalating the approval mode — before the Tool Runtime ever sees the call.

## Untrusted workspaces

VS Code untrusted workspaces block writes and shell unless:

```json
{
  "mitii.safety.allowUntrustedWorkspace": true
}
```

## MCP tool exclusions

In **Act mode**, certain MCP tools can be excluded from execution via MCP exclusions. The master switch `mitii.mcp.enabled` is **off by default**.

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
  "mitii.agent.showDiffPreview": true
}
```

Default is `false` to avoid editor focus changes.

## Checkpoints

Auto-checkpoint before approved writes — see [Memory & checkpoints](/implementation/memory-checkpoints).

## Audit trail

Every tool call and approval decision produces structured audit data:

- **Tool Runtime audit** — `callId`, `toolName`, `status`, `inputPreview`, `bytesProduced`, `truncated`, `redacted` (emitted per call)
- **SQLite** — `approval_audit` table
- **JSONL session log** — `approval_decision` events
- **Reason codes** — structured codes on every `ExecutionDecision` for traceability

## Verification requirements

Decision Policy can require evidence before a run is considered complete:

- `minimumEvidence` — e.g. `tests_or_diagnostics`
- `allowUnavailable` — whether the run can proceed if the evidence source is unavailable

This ensures the agent does not claim success without running applicable checks.

## Network access

`mitii.safety.allowNetwork` controls `fetch_web`. Autonomy presets set this automatically. The `ToolGrant.networkHosts` field provides per-endpoint control when network is enabled.

## Codebase location

| Concern | Package |
|---------|---------|
| Decision Policy (authority, grants, injection scan) | `@mitii/v8` → `modules/decision-policy/` |
| Tool Runtime (enforcement, execution, audit) | `@mitii/v8` → `engine/tool-runtime/` |
| Approval queue & UI | `apps/vscode` (sidebar webview) |
| Checkpoints & audit persistence | `@mitii/host` |
| Public safety API (for custom hosts) | `@mitii/sdk` |
