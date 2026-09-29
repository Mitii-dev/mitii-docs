# Safety & approvals

Mitii controls what the agent is allowed to do through a two-layer safety system. This page covers how tool calls are evaluated, what requires your approval, and how to configure the level of autonomy you want.

## How it works

Every tool call the agent attempts passes through two layers before it executes:

1. **Decision Policy** — evaluates the request and produces an `ExecutionDecision`. This decision specifies which tools are allowed, what effects are permitted, which paths the agent may touch, and whether a human must approve the action first.
2. **Tool Runtime** — receives the decision and enforces it. It validates each tool call against the granted permissions and executes it through the host. It does not make its own allow/deny decisions; it strictly enforces what the Decision Policy granted.

When an action requires consent, an **approval queue** sits between the two layers. You see an approval card in the sidebar, review the proposed change, and approve or deny it.

### Tool call lifecycle

```
Agent requests a tool call
        ↓
Decision Policy evaluates → ExecutionDecision (allow | require_approval | block)
        ↓
ApprovalQueue (only if approval is required)
        ↓
You approve or deny
        ↓
Tool Runtime validates the call against the granted permissions
        ↓
Executes → bounded result + audit event
```

## Configuring autonomy

### Autonomy presets

The fastest way to set your comfort level is through a preset in **Settings → Modes**. Each preset bundles a set of permissions and approval behavior:

| Preset | File writes | Shell commands | Network | Approval mode |
|--------|-------------|----------------|---------|---------------|
| `safe` | Ask | Ask | **Off** | `review_all` |
| `guided` | Ask | Ask | On | `ask_edits` |
| `builder` | Auto | Ask | On | `ask_commands` |
| `pilot` | Auto | Ask | On | `ask_commands` |
| `enterprise` | Ask | Ask | **Off** | `review_all` |

The default is `guided`. Use `safe` or `enterprise` when you want maximum control and no network access. Use `builder` or `pilot` when you trust the agent to make file edits without asking but still want to review shell commands.

Setting: `mitii.safety.autonomyPreset`

### Approval modes

For finer control, set `mitii.safety.approvalMode` directly. This determines which categories of actions require your explicit approval:

| Mode | File edits | Shell commands |
|------|------------|----------------|
| `review_all` | Ask | Ask (except read-only) |
| `ask_edits` | Ask | Auto (except delete-like) |
| `ask_deletes` | Auto | Ask only for deletes |
| `ask_commands` | Auto | Ask |
| `auto` | Auto | Auto |

Regardless of the mode, commands on the blocked list (see below) are **always denied**.

## What is auto-allowed vs. what requires approval

### Read-only tools (no approval needed)

Tools that only inspect the workspace never require approval. These include:

`read_file`, `search`, `repo_map`, `retrieve_context`, `git_diff`, `diagnostics`, `memory_search`, `spawn_research_agent`

Two exceptions:

- `fetch_web` — requires network access to be enabled (off in `safe` and `enterprise` presets)
- `ask_question` — always pauses for your response, since it is a direct question to you

### Blocked command patterns

The following shell commands are always blocked, regardless of approval mode or preset:

- `rm -rf`, `sudo`, `chmod -R`
- `curl | sh`, `wget | sh`
- `git push --force`
- `npm publish`

You can extend or customize this list via `mitii.safety.blockDangerousCommands`.

## The ToolGrant (advanced)

Under the hood, the Decision Policy produces a `ToolGrant` object that the Tool Runtime enforces for the duration of the run. If you are building a custom host or debugging permission issues, this is the structure to inspect:

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

The **mutation budget** caps how much a single tool call can change — preventing one call from rewriting hundreds of files or emitting an oversized patch payload.

## Prompt-injection defense

Before the Decision Policy grants any permissions, it scans the incoming request for prompt-injection signals (e.g. instructions embedded in file content or tool output that attempt to escalate privileges). When detected, it clamps the resulting `ToolGrant` — reducing allowed effects, narrowing path scopes, or escalating the approval mode — so the Tool Runtime never sees an over-privileged grant.

## Approval experience

When an action requires your approval, Mitii presents it in the sidebar:

- **Approval cards** — show the proposed action with **Approve**, **Approve for task** (auto-approve similar actions for the rest of this run), or **Deny**.
- **Questions** — when the agent calls `ask_question`, it renders as multiple-choice buttons you can click.
- **Inline diff** — for file writes and patches, you can open the change in the editor to review the diff before approving.

### Inline diff commands

| Command | Action |
|---------|--------|
| Mitii: Accept Inline Diff | Approve the pending change |
| Mitii: Reject Inline Diff | Deny the pending change |
| Mitii: Show Inline Diff | Open the editor with diff decorations |

### Diff preview tabs

If you prefer to see changes in a dedicated VS Code diff tab before they execute, enable:

```json
{
  "mitii.agent.showDiffPreview": true
}
```

This is `false` by default to avoid stealing editor focus during a run.

## Verification requirements

The Decision Policy can require the agent to produce evidence before a run is considered complete. For example, it may mandate that tests or diagnostics pass before the agent reports success.

- `minimumEvidence` — the type of evidence required (e.g. `tests_or_diagnostics`)
- `allowUnavailable` — whether the run can proceed if the evidence source is not available

This prevents the agent from claiming a task is done without actually verifying the result.

## Network access

`mitii.safety.allowNetwork` controls whether the agent can use `fetch_web`. Autonomy presets set this automatically (`safe` and `enterprise` disable it). When network is enabled, the `ToolGrant.networkHosts` field provides per-endpoint control over which hosts the agent may reach.

## Untrusted workspaces

When VS Code marks a workspace as untrusted, Mitii blocks all writes and shell commands by default. To override this (not recommended for unfamiliar repositories):

```json
{
  "mitii.safety.allowUntrustedWorkspace": true
}
```

## MCP tool exclusions

In **Act mode**, you can exclude specific MCP (Model Context Protocol) tools from execution. The MCP integration is **off by default** — enable it with `mitii.mcp.enabled: true` and then configure exclusions as needed.

## Checkpoints

Before any approved write executes, Mitii creates an automatic checkpoint so you can revert the change. See [Memory & checkpoints](/understanding/agent-intelligence/memory-checkpoints) for details.

## Audit trail

Every tool call and approval decision is recorded for traceability:

- **Per-call audit** — `callId`, `toolName`, `status`, `inputPreview`, `bytesProduced`, `truncated`, `redacted`
- **SQLite** — `approval_audit` table (persistent, queryable)
- **JSONL session log** — `approval_decision` events
- **Reason codes** — structured codes on every `ExecutionDecision` (e.g. `execute_requested`, `localized_change`, `verification_required`) explaining *why* the policy made its decision

## Codebase location

| Concern | Package |
|---------|---------|
| Decision Policy (authority, grants, injection scan) | `@mitii/v8` → `modules/decision-policy/` |
| Tool Runtime (enforcement, execution, audit) | `@mitii/v8` → `engine/tool-runtime/` |
| Approval queue & UI | `apps/vscode` (sidebar webview) |
| Checkpoints & audit persistence | `@mitii/host` |
| Public safety API (for custom hosts) | `@mitii/sdk` |
