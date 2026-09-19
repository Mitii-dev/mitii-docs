# Tool Runtime

Tool Runtime is the enforcement and execution layer for tool calls. When the model requests a tool (e.g. `read_file`, `apply_patch`, `run_command`), Agent Engine passes the request to Tool Runtime along with a `ToolGrant` — the authorization decision produced by Decision Policy. Tool Runtime validates the request against that grant, executes it through host ports, and returns a bounded `ToolResult` with audit information.

Tool Runtime never decides whether a tool call is allowed. It enforces the grant it receives and nothing more.

## How a Tool Call Flows

1. **Receive** — Tool Runtime receives a `ToolInvocationInput` containing the tool name, arguments, workspace root, and the `ToolGrant`.
2. **Validate** — It checks the tool name, effect, path scope, command rules, network hosts, output limits, and mutation batch limits against the grant.
3. **Execute** — The tool runs through registered definitions and host ports (filesystem, process, network, git, etc.).
4. **Sanitize** — Output is redacted, truncated, and bounded by the minimum of tool, grant, and session limits.
5. **Audit** — A structured audit event is emitted for every call.
6. **Return** — A `ToolResult` with status, output, warnings, and audit data is returned to Agent Engine.

If the tool supports rollback (e.g. `apply_patch`), Tool Runtime can revert the mutation on failure.

## Key Types

| Type | Purpose |
| --- | --- |
| `ToolInvocationInput` | The request: `callId`, `toolName`, raw `arguments`, the exact `ToolGrant`, `workspaceRoot`, and optional `pinnedState`. |
| `ToolResult` | The response: status, reason code, optional output, truncation/redaction flags, duration, bytes, warnings, and audit event. |
| `ToolGrant` | The authorization decision from Decision Policy that Tool Runtime enforces. |
| `ToolDefinition` | Model-facing name, description, input schema, effects, and output limits. |
| `RegisteredTool` | A `ToolDefinition` plus its execute function. |
| `ToolRuntimePorts` | Host capabilities: filesystem, process, network, git, diagnostics, search, and repository graph access. |

## Directory Structure

```text
tool-runtime/
  pipeline/                 ToolRuntimePipeline and execution helpers
  contracts/
    input/                  ToolInvocationInput
    output/                 ToolResult, ToolCapability
    ports/                  Filesystem, process, network, git, diagnostics, search
    errors/                 ToolRuntimeErrors
  actions/                  Grant validation, mutation batch validation, built-ins
  adapters/                 Node and in-memory host adapters
  internal/                 Registry, shadow authorization, sanitization, budgets
  tests/                    Registry, grant, mutation, network, command tests
```

## Registry and Tool Definitions

- `ToolRegistry` stores built-in and custom tool definitions.
- `createBuiltinToolRegistry` wires the default V8 tools.
- `defineTool` creates typed custom tool definitions.
- `StructuralShadowGrantAuthorizer` can evaluate a Cedar-shaped structural grant in parallel with normal validation.

## Mutation Safety

Mutation tools (`apply_patch`, `delete_file`, `move_file`) have additional constraints beyond standard path scoping:

- **Path scopes** — Mutation tools authorize against `grant.mutationPathScopes` when present; discovery tools (e.g. `read_file`, `search_files`) use `grant.pathScopes`.
- **Batch limits** — Each call enforces `maxPatchesPerCall`, `maxUniqueFilesPerCall`, and `maxPatchPayloadCharacters`. Exceeding any cap fails preflight with `mutation_budget_exceeded` (not a generic `limit_exceeded`).

### `apply_patch` Matching Rules

`apply_patch` uses exact `oldText` matching — no fuzzy match, no regex.

- By default, `oldText` must match exactly one location in the file.
- `replaceAll: true` replaces every exact occurrence in that file.
- An empty `oldText` means "create new file" or "full-file replace" and rejects `replaceAll`.

Distinct reason codes describe why a hunk failed:

| Reason code | Meaning |
| --- | --- |
| `old_text_not_found` | The `oldText` does not appear in the file. |
| `old_text_ambiguous` | The `oldText` matches more than one location (and `replaceAll` is not set). |
| `patch_target_missing` | The file path does not exist (for a non-creation patch). |
| `patch_hash_mismatch` | The file changed since the patch was generated. |
| `identical_old_and_new` | `oldText` and `newText` are the same. |
| `patch_syntax_invalid` | The patch structure is malformed. |

Retryable conflicts attach clipped `currentContent` in the tool result so the caller can retry with corrected text. `patch_conflict` remains as a legacy umbrella code for older hosts.

## Process and Network

- Process execution always goes through `ProcessPort`.
- Network access always goes through `NetworkPort` and host allow-lists.

## Output Handling

Output is bounded by the minimum of tool, grant, and session limits. Tool Runtime sanitizes, redacts, and truncates output before returning it.

## Search Behavior

- `search_files.path` may be a file or a directory. Adapters MUST stat the root before `readdir`; a file root returns that single file.
- `search_files` is line-oriented and returns structured matches.
- The contract supports `mode: "auto" | "literal" | "regex"` so hosts and models can search text generically without depending on a specific CLI search tool. Auto mode prefers literal search unless the query shows clear regex intent.

## Ownership Boundaries

**Owns:** tool registration, preflight authorization, execution through ports, output safety, mutation batch limits, rollback support, and audit records.

**Does not own:** route selection, approval UI, prompt construction, model calls, repository indexing, or verification policy.

## Public Exports

`ToolRuntimePipeline`, `ToolRegistry`, `defineTool`, `createBuiltinToolRegistry`, `BUILTIN_TOOLS`, built-in adapters, schemas, contracts, and shadow authorization helpers are exported from `@mitii/v8`.

## Testing

```bash
pnpm exec vitest run packages/v8/src/engine/tool-runtime
```

## Example: `read_file` Call

The following example shows a realistic `read_file` request and response. The values are representative — ids and timings are illustrative, but the shape matches the actual contract.

### Input

```json
{
  "schemaVersion": 1,
  "callId": "call-read-login",
  "toolName": "read_file",
  "arguments": { "path": "src/LoginForm.tsx" },
  "workspaceRoot": "/repo",
  "pinnedState": { "workspaceId": "workspace-1", "stateToken": "state-abc" },
  "grant": "decision.toolGrant"
}
```

### What happens

1. Tool Runtime validates the schema, version, and grant limits.
2. It checks that `src/LoginForm.tsx` is within the grant's path scope.
3. It executes the read through the filesystem port.
4. It bounds the output to the configured limits.
5. It emits an audit event and returns the result.

### Output

```json
{
  "schemaVersion": 1,
  "callId": "call-read-login",
  "toolName": "read_file",
  "status": "ok",
  "output": { "path": "src/LoginForm.tsx", "contentPreview": "export function LoginForm() { ... }" },
  "truncated": false,
  "redacted": false,
  "bytesProduced": 4812,
  "warnings": [],
  "audit": {
    "callId": "call-read-login",
    "toolName": "read_file",
    "status": "ok",
    "path": "src/LoginForm.tsx",
    "inputPreview": "{\"path\":\"src/LoginForm.tsx\"}",
    "bytesProduced": 4812,
    "truncated": false,
    "redacted": false
  }
}
```
