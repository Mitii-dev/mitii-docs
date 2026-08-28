# Built-in tools

Mitii exposes 20+ tools to the agent. Every tool call passes through two layers:

1. **Decision Policy** (V8's authority module) converts request evidence into an `ExecutionDecision` that scopes which tools may run.
2. **Tool Runtime** (V8's enforcement layer) validates the call against the `ToolGrant`, executes through host ports, sanitizes output, and emits a structured audit event.

The Tool Runtime never decides that a tool should be allowed — it only enforces the grant. If a call violates the grant, it is rejected before execution.

## Read tools (auto-allowed)

| Tool | Description |
|------|-------------|
| `read_file` | Read a single file |
| `read_many_files` | Read multiple files in one call (per-file byte caps) |
| `list_directory` | List directory contents |
| `glob_files` | Find files by glob pattern (`**/*.ts`) |
| `search_files` | Literal or regex text search across workspace |
| `file_metadata` | Size, mtime, kind, sha256 for a path |
| `read_diagnostics` | LSP errors/warnings (optional path filter) |
| `read_git_status` | Git status and optional diff summary |
| `read_package_scripts` | Read scripts from `package.json` |
| `memory_search` | Search long-term memory |
| `use_skill` | Invoke a `SKILL.md` skill |

## Write tools (approval gated)

| Tool | Description |
|------|-------------|
| `write_file` | Write or create a file |
| `apply_patch` | Structured oldText/newText patch (transactional) |
| `delete_file` | Delete a single workspace file |
| `delete_directory` | Delete a directory (recursive by default) |
| `move_file` | Move or rename a file/directory |
| `memory_write` | Store observation (low risk, usually auto) |
| `save_task_state` | Persist mid-task progress |

Blocked in Ask/Plan/Review modes. The Tool Runtime supports **mutation rollback** — if a write fails mid-transaction, prior state is restored.

## Shell tools

| Tool | Description |
|------|-------------|
| `run_readonly_command` | Read-only command (npm, pnpm, cargo, go, git status, etc.) |
| `run_command` | Mutating command (requires write grant + approval) |

Read-only commands (`grep`, `npm test`, `git diff`, etc.) may auto-allow depending on approval mode. Mutating commands require explicit approval.

## Navigation & impact tools

| Tool | Description |
|------|-------------|
| `goto_definition` | Resolve the definition of a symbol at a file/line/col |
| `find_references` | Find references and callers for a symbol |
| `analyze_change_impact` | Blast-radius: who depends on a file/symbol (or what it imports) |

These use the language server when available, otherwise the repository graph. `analyze_change_impact` walks callers, importers, references, and package edges.

## Agent tools

| Tool | Description |
|------|-------------|
| `ask_question` | Clarifying question → approval card |
| `mark_step_complete` | Advance plan step |
| `propose_plan_mutation` | Suggest plan changes |
| `propose_file_scope` | Declare candidate file paths before reading or editing (default Act contract) |

`propose_file_scope` is promoted in the Act-mode prompt so the model scopes its file reads and edits before invoking read/write tools.

## Web tool

| Tool | Description |
|------|-------------|
| `fetch_web` | HTTP fetch URL content (docs/APIs) |

- Not a headless browser — no JavaScript execution
- 30s timeout, 50k char cap, HTML → plain text
- Requires network (`allowNetwork` / autonomy preset)

## MCP tools (dynamic)

Format: `mcp__{server}__{tool}`

- **Off by default** — enable with `mitii.mcp.enabled`
- Registered at MCP server connect time
- Pass through the same Tool Runtime enforcement as built-in tools
- In **Act mode**, specific MCP tools can be excluded via MCP exclusions

## Tool loop limits

| Setting | Default |
|---------|--------|
| `mitii.agent.maxSteps` | 15 |
| `mitii.agent.autoContinue` | true |
| `mitii.agent.maxAutoContinues` | 2 |
| `mitii.agent.researchAgentMaxSteps` | 6 |

## Post-edit validation

After writes, `PostEditValidator` waits for LSP diagnostics. Agent may be blocked from completing a step until errors are fixed.

## Skills

Drop `SKILL.md` files in `.mitii/skills/`. Agent invokes via `use_skill` with skill name and parameters.

**12 bundled skills** ship with the SDK:

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

Approved scripts in `.mitii/` via `execute_workspace_script`:

- `write-checkpoint.sh` / `read-checkpoint.sh` — task state snapshots

## Project rules (not tools, but context)

Auto-loaded into every session:

- `AGENTS.md`, `CLAUDE.md`, `WARP.md`, `.cursorrules`
- `.mitii/rules`, `.clinerules`, `.cursor/rules`, `.continue/rules`

Commit these to your repo for consistent agent behavior.

## Tool Runtime guarantees

Every tool call, regardless of type, receives:

- **Grant validation** — rejected if outside the `ToolGrant` scope
- **Output sanitization** — secrets redacted, output truncated to bounded size
- **Structured audit** — tool name, args hash, duration, result status logged per call
- **Mutation rollback** — failed writes restore prior file state

## Codebase location

| Concern | Package |
|---------|---------|
| Tool definitions & registry | `@mitii/v8` (`createBuiltinToolRegistry`) |
| Tool Runtime (enforcement, audit, rollback) | `@mitii/v8` |
| Decision Policy (authority, grants) | `@mitii/v8` |
| MCP server lifecycle | `@mitii/host` |
| Approval UI & settings | `apps/vscode` |
| Public API surface | `@mitii/sdk` |
