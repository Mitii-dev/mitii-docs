# Built-in tools

Mitii exposes 20+ tools to the agent. All pass through `ToolPolicyEngine` unless noted.

## Read tools (auto-allowed)

| Tool | Description |
|------|-------------|
| `read_file` | Read a single file |
| `read_files` | Read multiple files (max 12 paths) |
| `list_files` | List directory contents |
| `search` | FTS / ripgrep search |
| `search_batch` | Multiple search queries |
| `repo_map` | PageRank repo structure |
| `retrieve_context` | Hybrid context retrieval |
| `git_diff` | Uncommitted changes |
| `diagnostics` | LSP errors/warnings |
| `memory_search` | Search long-term memory |
| `search_script_catalog` | Find workspace helper scripts |
| `execute_workspace_script` | Run approved `.mitii` scripts |
| `use_skill` | Invoke a `SKILL.md` skill |

## Write tools (approval gated)

| Tool | Description |
|------|-------------|
| `write_file` | Write or create a file |
| `apply_patch` | Search/replace patch |
| `memory_write` | Store observation (low risk, usually auto) |
| `save_task_state` | Persist mid-task progress |

Blocked in Ask/Plan/Review modes.

## Shell tools

| Tool | Description |
|------|-------------|
| `run_command` | Execute shell command in workspace |
| `execute_workspace_script` | Run checkpoint/read/write scripts |

Read-only commands (`grep`, `npm test`, `git diff`, etc.) may auto-allow depending on approval mode.

## Agent tools

| Tool | Description |
|------|-------------|
| `spawn_research_agent` | Parallel read-only subagent |
| `ask_question` | Clarifying question → approval card |
| `mark_step_complete` | Advance plan step |
| `propose_plan_mutation` | Suggest plan changes |

## Web tool

| Tool | Description |
|------|-------------|
| `fetch_web` | HTTP fetch URL content (docs/APIs) |

- Not a headless browser — no JavaScript execution
- 30s timeout, 50k char cap, HTML → plain text
- Requires network (`allowNetwork` / autonomy preset)

## MCP tools (dynamic)

Format: `mcp__{server}__{tool}`

Registered at MCP server connect time. Same approval policy as built-in tools.

## Tool loop limits

| Setting | Default |
|---------|---------|
| `thunder.agent.maxSteps` | 15 |
| `thunder.agent.autoContinue` | true |
| `thunder.agent.maxAutoContinues` | 2 |
| `thunder.agent.researchAgentMaxSteps` | 6 |

## Post-edit validation

After writes, `PostEditValidator` waits for LSP diagnostics. Agent may be blocked from completing a step until errors are fixed.

## Skills

Drop `SKILL.md` files in `.mitii/skills/`. Agent invokes via `use_skill` with skill name and parameters.

## Workspace scripts

Approved scripts in `.mitii/` via `execute_workspace_script`:

- `write-checkpoint.sh` / `read-checkpoint.sh` — task state snapshots

## Project rules (not tools, but context)

Auto-loaded into every session:

- `AGENTS.md`, `CLAUDE.md`, `WARP.md`, `.cursorrules`
- `.mitii/rules`, `.clinerules`, `.cursor/rules`, `.continue/rules`

Commit these to your repo for consistent agent behavior.
