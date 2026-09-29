# Built-in tools

Mitii provides 20+ tools that the agent can invoke to read, modify, and navigate your codebase. Tools are the primary mechanism through which the agent interacts with your project — every file read, edit, command execution, and symbol lookup goes through a tool call.

## How tool calls are authorized

Every tool call passes through two enforcement layers before it reaches your code:

1. **Decision Policy** — evaluates the current request context (mode, user intent, autonomy level) and produces an `ExecutionDecision` that defines which tools are permitted and under what constraints.
2. **Tool Runtime** — validates each individual call against the resulting `ToolGrant`, executes it, sanitizes the output, and records a structured audit event.

The Tool Runtime is purely an enforcement layer: it never decides *whether* a tool should be allowed. If a call falls outside the grant, it is rejected before any side effects occur.

## Tool categories

Tools are grouped by the kind of action they perform. Each category has a different default authorization level.

### Read tools (auto-allowed)

Read-only inspection of the workspace. These are permitted in all modes without approval.

| Tool | Description |
|------|-------------|
| `read_file` | Read a single file |
| `read_many_files` | Read multiple files in one call (per-file byte caps) |
| `list_directory` | List directory contents |
| `glob_files` | Find files by glob pattern (e.g. `**/*.ts`) |
| `search_files` | Literal or regex text search across the workspace |
| `file_metadata` | Size, mtime, kind, sha256 for a path |
| `read_diagnostics` | LSP errors/warnings (optional path filter) |
| `read_git_status` | Git status and optional diff summary |
| `read_package_scripts` | Read scripts from `package.json` |
| `memory_search` | Search long-term memory |
| `use_skill` | Invoke a `SKILL.md` skill |

### Write tools (approval-gated)

Mutations to the workspace. These require a write grant and, depending on your approval mode, explicit user confirmation.

| Tool | Description |
|------|-------------|
| `write_file` | Write or create a file |
| `apply_patch` | Structured oldText/newText patch (transactional) |
| `delete_file` | Delete a single workspace file |
| `delete_directory` | Delete a directory (recursive by default) |
| `move_file` | Move or rename a file or directory |
| `memory_write` | Store an observation (low risk, usually auto-allowed) |
| `save_task_state` | Persist mid-task progress |

Write tools are blocked entirely in Ask, Plan, and Review modes. The Tool Runtime supports **mutation rollback** — if a multi-file write fails partway through a transaction, prior file state is restored.

### Shell tools

Command execution within the workspace.

| Tool | Description |
|------|-------------|
| `run_readonly_command` | Read-only commands (e.g. `npm test`, `git diff`, `cargo build`) |
| `run_command` | Mutating commands (e.g. `npm install`, `git commit`) |

Read-only commands may auto-allow depending on your approval mode. Mutating commands always require a write grant and explicit approval.

### Navigation & impact tools

Symbol-level code intelligence for understanding how code relates.

| Tool | Description |
|------|-------------|
| `goto_definition` | Resolve the definition of a symbol at a given file, line, and column |
| `find_references` | Find all references and callers for a symbol |
| `analyze_change_impact` | Determine which files/symbols depend on a given target (or what it imports) |

These tools use the language server when one is available, falling back to the repository graph. `analyze_change_impact` walks callers, importers, references, and package dependency edges to estimate blast radius.

### Agent workflow tools

Tools the agent uses to manage its own task flow and communicate with you.

| Tool | Description |
|------|-------------|
| `ask_question` | Pose a clarifying question (surfaces as an approval card) |
| `mark_step_complete` | Advance the current plan step |
| `propose_plan_mutation` | Suggest changes to the active plan |
| `propose_file_scope` | Declare candidate file paths before reading or editing |

`propose_file_scope` is emphasized in Act mode so the agent declares which files it intends to touch before invoking read/write tools, giving you visibility into its scope.

### Web tool

| Tool | Description |
|------|-------------|
| `fetch_web` | Fetch URL content (documentation, API responses) |

- Not a headless browser — no JavaScript execution
- 30-second timeout, 50k character cap, HTML converted to plain text
- Requires network access (`allowNetwork` setting or an autonomy preset that permits it)

### MCP tools (dynamic)

[Model Context Protocol](https://modelcontextprotocol.io/) tools extend the agent with external capabilities (e.g. database queries, custom integrations). They appear as `mcp__{server}__{tool}`.

- **Off by default** — enable with `mitii.mcp.enabled`
- Registered at MCP server connect time
- Pass through the same Tool Runtime enforcement as built-in tools
- In Act mode, specific MCP tools can be excluded via MCP exclusions

## Configuration

### Tool loop limits

These settings control how many steps the agent can take in a single run:

| Setting | Default | Description |
|---------|---------|-------------|
| `mitii.agent.maxSteps` | 15 | Maximum tool-call steps per run |
| `mitii.agent.autoContinue` | `true` | Whether the agent may continue after hitting the step limit |
| `mitii.agent.maxAutoContinues` | 2 | Maximum number of auto-continuations |
| `mitii.agent.researchAgentMaxSteps` | 6 | Step limit for the research sub-agent |

### Post-edit validation

After a write tool completes, the `PostEditValidator` waits for LSP diagnostics to settle. If new errors are introduced, the agent is blocked from marking the step complete until they are resolved.

## Skills

Skills are reusable instruction sets that shape the agent's behavior for specific task types. Drop a `SKILL.md` file in `.mitii/skills/` to add a custom skill; the agent invokes it via `use_skill` with the skill name and optional parameters.

Twelve skills ship bundled with the SDK:

| Skill | Purpose |
|-------|---------|
| `ask-concise` | Keep answers short and direct |
| `bugfix-localize` | Isolate the minimal fix |
| `code-review-and-quality` | Review for correctness, style, and edge cases |
| `debugging-and-error-recovery` | Systematic debugging workflow |
| `git-workflow-and-versioning` | Atomic commits, clear history |
| `incremental-implementation` | Small, verifiable steps |
| `planning-and-task-breakdown` | Decompose specs into ordered tasks |
| `planning-default` | Default planning behavior |
| `safety-always` | Safety-first guardrails |
| `security-and-hardening` | OWASP-class hardening |
| `spec-driven-development` | Build from specs, not vibes |
| `test-driven-development` | Write tests before implementation |

## Workspace scripts

Approved shell scripts placed in `.mitii/` can be executed via `execute_workspace_script`. The SDK ships two checkpoint scripts:

- `write-checkpoint.sh` — snapshot task state
- `read-checkpoint.sh` — restore task state

## Project rules

In addition to tools, Mitii auto-loads project rule files into every session as contextual guidance. These are not tools — they shape the agent's behavior without requiring a tool call.

Recognized rule files:

- `AGENTS.md`, `CLAUDE.md`, `WARP.md`, `.cursorrules`
- `.mitii/rules`, `.clinerules`, `.cursor/rules`, `.continue/rules`

Commit these to your repository for consistent agent behavior across the team.

## Runtime guarantees

Every tool call, regardless of category, receives the following guarantees from the Tool Runtime:

- **Grant validation** — the call is rejected if it falls outside the `ToolGrant` scope
- **Output sanitization** — secrets are redacted and output is truncated to a bounded size
- **Structured audit** — tool name, args hash, duration, and result status are logged per call
- **Mutation rollback** — failed multi-file writes restore prior file state

## Codebase location

| Concern | Package |
|---------|---------|
| Tool definitions & registry | `@mitii/v8` (`createBuiltinToolRegistry`) |
| Tool Runtime (enforcement, audit, rollback) | `@mitii/v8` |
| Decision Policy (authority, grants) | `@mitii/v8` |
| MCP server lifecycle | `@mitii/host` |
| Approval UI & settings | `apps/vscode` |
| Public API surface | `@mitii/sdk` |
