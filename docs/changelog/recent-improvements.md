# Recent improvements

This page covers the major capabilities shipped in Mitii AI Agent v2.6.x. Mitii is an AI coding agent that integrates with VS Code and the command line, helping you plan, write, and review code with configurable autonomy levels.

All settings use the `mitii.*` namespace in VS Code. The product brand is **Mitii**.

## Architecture: the V8 module stack

The agent core is organized as a modular stack of focused modules rather than a single monolithic package. Each module has a clear responsibility:

| Module | Responsibility |
|--------|---------------|
| **Decision Policy** | Analyzes the request and produces an `ExecutionDecision` — the route to take, whether planning is needed, and which tools are in scope |
| **Agent Engine** | Runs the agent loop: builds prompts, calls the LLM, dispatches tool results |
| **Tool Runtime** | Executes tools with policy checks, transactions, and approval gates |
| **Memory** | Stores and retrieves durable facts scoped to user, workspace, or project |
| **Change Impact** | Walks the repository graph to estimate how a change affects other files |
| **Code Navigation** | Resolves definitions, references, and hover info via LSP or the repository graph |

The SDK (`@mitii/sdk`) exposes a host-neutral API over this stack, so the VS Code extension, CLI, and custom hosts all share the same agent core.

## Skills: structured playbooks for common tasks

A **skill** is a structured playbook that guides the agent through a specific type of work (e.g., debugging, code review, planning). Each skill defines Planning → Change → Verify phases with acceptance criteria, so the agent follows a consistent workflow rather than improvising.

Bundled skills install to `.mitii/skills/` when you scaffold a workspace. The agent selects the most relevant skill for the task at hand.

| Skill | What it guides |
|-------|---------------|
| `planning-and-task-breakdown` | Decompose a spec into atomic tasks with acceptance criteria |
| `planning-default` | General-purpose planning fallback |
| `using-agent-skills` | Meta-skill: how to discover and apply skills |
| `ask-concise` | Keep answers short and direct |
| `bugfix-localize` | Isolate root cause before proposing a fix |
| `code-review-and-quality` | Review diffs for correctness, style, and risk |
| `debugging-and-error-recovery` | Systematic error triage and recovery |
| `git-workflow-and-versioning` | Atomic commits, clear history, safe branching |
| `incremental-implementation` | Small reviewable diffs, one concern at a time |
| `safety-always` | Safety guardrails applied to every task |
| `security-and-hardening` | Threat modeling, input validation, hardening |
| `spec-driven-development` | Implement from specs with explicit acceptance checks |
| `test-driven-development` | Write tests first, then implement |

**Workspace skills** (in `.mitii/skills/`) override bundled skills with the same ID, so you can customize or replace any playbook per project.

## UI panels

Three diagnostic panels are now fully integrated into the chat view (below pinned context):

| Panel | What it shows |
|-------|---------------|
| **Context debugger** | Retrieved vs included tokens, source breakdown, dropped items, request-size meter |
| **Memory browser** | Browse, delete, and clear long-term observations |
| **Checkpoint browser** | List pre-write snapshots; restore with one click |

Memory and checkpoints share a tabbed side panel.

## LLM providers

Mitii supports native integration paths for major providers, plus a generic OpenAI-compatible endpoint for local or proxy servers:

| Provider | Preset | Type | Notes |
|----------|--------|------|-------|
| OpenAI-compatible | `openai-compatible` | `openai-compatible` | Ollama, LM Studio, vLLM, proxies |
| OpenAI | `openai` | `openai` | `api.openai.com` defaults |
| Anthropic | `anthropic` | `anthropic` | Native Messages API + streaming |
| Google Gemini | `gemini` | `gemini` | Native Gemini API |
| DeepSeek | `deepseek` | `openai-compatible` | OpenAI-compatible preset |
| Cursor | `cursor` | `openai-compatible` | OpenAI-compatible preset |
| OpenAI Codex | `codex` | `openai-compatible` | OpenAI-compatible preset |
| Echo | `echo` | `echo` | UI/testing stub (no real LLM calls) |

**To configure:** open **Settings → Provider**, select a preset (which sets the type, base URL, and model defaults), then use **Test connection** before saving.

## Token budget & profiles

- **Context window** is the single configuration knob — derived budgets (max output, tool results, system prompt) are computed from it automatically.
- **Reset budgets to defaults** restores the derived values if you've overridden them.
- **Profiles** (`.mitii/profiles.json`) let you save and switch between provider + model + budget configurations without re-entering settings.

## Plan vs Act models

Mitii operates in two modes: **Plan** (analysis and strategy) and **Act** (implementation). You can assign different models to each:

- `mitii.agent.planModel` + `planBaseUrl` — a cheaper/faster model for planning
- `mitii.agent.actModel` + `actBaseUrl` — a stronger model for implementation

Leave blank to use the main provider model for both modes. Configure in **Settings → Agent**.

## Autonomy presets

Autonomy presets control how much the agent can do without asking. Each preset has **distinct behavior**:

| Preset | Network | Write approval | Shell |
|--------|---------|---------------|-------|
| **Safe / Enterprise** | Off (`fetch_web` blocked) | Full review | Blocked |
| **Guided** | On (docs fetch only) | `ask_edits` mode | Gated |
| **Builder** | On | Auto-approve writes | Review mutating commands |
| **Pilot** | On | High write autonomy | Gated |

Select a preset in **Settings → Safety**.

## MCP (Model Context Protocol) servers

MCP lets you connect external tool servers to the agent. It is **off by default** — enable with `mitii.mcp.enabled`.

| Transport | Config fields | Typical use |
|-----------|---------------|-------------|
| **stdio** | `command`, `args`, `env` | Local `npx` servers |
| **sse** | `url`, `headers` | Remote SSE endpoints |
| **streamable-http** | `url`, `headers` | MCP Streamable HTTP spec |

Authenticate via `headers.Authorization` or `oauth.accessToken` in the server config. Edit servers in **Settings → Integrations**. In **Act mode**, specific MCP tools can be excluded via MCP exclusions.

## Checkpoints

Before writing files, Mitii creates a checkpoint so you can restore the previous state. The strategy is configurable via `mitii.agent.checkpointStrategy`:

| Strategy | Behavior |
|----------|----------|
| **`git-stash`** (default) | `git stash push` before writes (when a git repo is available) |
| **`shadow-git`** | Shadow stash with a distinct message prefix |
| **`file-copy`** | Copies files to `.mitii/checkpoints/` (fallback for non-git projects) |

Restore from the **Checkpoints** panel or via the controller API.

## Inline diff accept/reject

When a write or patch awaits approval:

1. Click **View in editor** on the approval card to open inline decorations.
2. Run **Mitii: Accept Inline Diff** or **Mitii: Reject Inline Diff** from the command palette.
3. Optional **diff preview tabs** are still available via `mitii.agent.showDiffPreview`.

## Browser tool (`fetch_web`)

The `fetch_web` tool retrieves external documentation and API references on the agent's behalf:

- 30-second timeout, 50k character cap, HTML stripped to plain text
- Gated by `mitii.safety.allowNetwork` and the active autonomy preset
- Blocked entirely in **safe** and **enterprise** presets

## On-device semantic indexing

Semantic indexing now uses a **host-owned bundled embedding model** — vectors are produced locally without calling the chat-model provider or any external API:

- No network round-trips, no API costs
- LanceDB remains optional for vector storage (default: SQLite)
- `minilm` (quality) or `hash` (speed) backends selectable
- Works offline; degrades gracefully if the model is unavailable

## Large-repo indexing

Large repositories now index with explicit **scan → index → cancel** phases:

- **Partial-index status** — usable results while indexing continues
- Progress detail in the VS Code UI and CLI
- "Degraded but usable" messaging when the index is incomplete
- Cancel support without corrupting existing index state

## CLI

`@mitii/cli` is a headless CLI that wraps the same agent core as the VS Code extension:

```bash
npm install -g @mitii/cli
# or
npx @mitii/cli
```

- `mitii setup` — interactive provider configuration
- `--echo` flag — test the pipeline without a real LLM
- Env vars: `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `MITII_API_KEY`
- Same agent core, skills, and safety model as the VS Code extension

## Workspace data: `.mitii/`

All workspace data lives under **`.mitii/`** (migrated from the legacy `.thunder/` path):

| Path | Contents |
|------|----------|
| `mitii.sqlite` | Index, sessions, memory, plans, checkpoints |
| `logs/` | JSONL session logs |
| `checkpoints/` | File-copy snapshots |
| `tasks/` | Plan JSON files |
| `mcp.json` | Workspace MCP server definitions |
| `skills/` | `SKILL.md` skill definitions |
| `diff-preview/` | Temporary diff preview files |
| `profiles.json` | Saved provider/model/budget profiles |

Legacy `.thunder/` paths are still ignored for backward compatibility.

## Test coverage

New Vitest suites cover providers, autonomy presets, MCP auth, plan/act config, checkpoint strategy, `fetch_web` policy, and planning skill routing (`test/features.test.ts`, `test/plan-skill-routing.test.ts`).

## Plan mode UI

Plan mode uses a dedicated **Planner** panel (above the chat) as the single source of truth for the plan:

| UI element | What it shows |
|------------|---------------|
| **Planning pipeline** | Live status: discovery → requirement analysis → compile |
| **Requirement analysis** | Collapsible section streamed into the panel |
| **Skill chips** | Applied playbooks (e.g., `planning-and-task-breakdown`) |
| **Phased steps** | Diagnostics / Review / Execute / Verify groups |
| **Step details** | Objective, tools, success criteria, dependencies, risk |

Chat shows a short summary when the plan is ready; the panel holds the full detail.

## Planning skills integration

The planner now actively loads and applies skills during planning:

1. **PlanOrchestrator** resolves skills by intent and pre-loads playbook content
2. **Discovery / analysis / compiler prompts** include skill guidance and injected playbooks
3. **Plan nudges** mention `use_skill` when grounding is missing
4. **Quality gate** expects verification-oriented success criteria on multi-step plans

Bundled skills install to `.mitii/skills/` on workspace scaffold (12 playbooks including `planning-and-task-breakdown`, `safety-always`, and `test-driven-development`).

## SDK

`@mitii/sdk` provides a stable, host-neutral API for embedding the agent in custom applications:

```ts
import { createMitiiClient } from "@mitii/sdk";

const client = createMitiiClient({
  llm: myLlmPort, // implement LlmPort
  // optional: memory, checkpoints, skills adapters
});

const result = await client.run("Fix the failing test in src/auth.ts");
```

- No VS Code or Node-specific dependencies in the core path
- `LlmPort` injection lets you plug in any provider
- Same safety, memory, and skill system as the VS Code extension and CLI
