# Recent improvements

This page tracks major capabilities shipped in Mitii AI Agent v2.6.x. Settings use the `mitii.*` namespace in VS Code; the product brand is **Mitii**.

## V8 module stack

The agent core is now a modular V8 stack rather than a monolithic `packages/core`:

| Module | What it does |
|--------|-------------|
| **Decision Policy** | Converts request evidence into an `ExecutionDecision` (route, planning, tool scope) |
| **Agent Engine** | Orchestrates the agent loop: prompt construction, LLM calls, tool dispatch |
| **Tool Runtime** | Executes tools with policy checks, transactions, and approval gates |
| **Memory** | Retrieves and commits durable facts scoped to user / workspace / project |
| **Change Impact** | Walks the repository graph to estimate blast radius of a change |
| **Code Navigation** | Resolves definitions, references, and hover via LSP or repo graph |

The SDK (`@mitii/sdk`) exposes a host-neutral API over V8, so the VS Code extension, CLI, and custom hosts share the same agent core.

## Bundled skills (12 playbooks)

Bundled skills install to `.mitii/skills/` on workspace scaffold. The agent selects the most relevant skill and follows its Planning → Change → Verify phases with acceptance criteria.

| Skill | Focus |
|-------|-------|
| `planning-and-task-breakdown` | Decompose specs into atomic tasks with acceptance criteria |
| `planning-default` | General-purpose planning fallback |
| `using-agent-skills` | Meta-skill: how to discover and apply skills |
| `ask-concise` | Short, direct answers without over-explaining |
| `bugfix-localize` | Isolate root cause before proposing a fix |
| `code-review-and-quality` | Review diffs for correctness, style, and risk |
| `debugging-and-error-recovery` | Systematic error triage and recovery |
| `git-workflow-and-versioning` | Atomic commits, clear history, safe branching |
| `incremental-implementation` | Small reviewable diffs, one concern at a time |
| `safety-always` | Safety guardrails applied to every task |
| `security-and-hardening` | Threat modeling, input validation, hardening |
| `spec-driven-development` | Implement from specs with explicit acceptance checks |
| `test-driven-development` | Write tests first, then implement |

Workspace skills (in `.mitii/skills/`) override bundled skills with the same ID.

## UI panels wired end-to-end

Previously built but not visible in the chat UI — now fully integrated:

| Panel | What you see |
|-------|----------------|
| **Context debugger** | Retrieved vs included tokens, source breakdown, dropped items, request-size meter |
| **Memory browser** | Browse, delete, and clear long-term observations |
| **Checkpoint browser** | List pre-write snapshots; restore with one click |

Open them in the chat view below pinned context. Memory and checkpoints share a tabbed side panel.

## First-class LLM providers

Beyond generic OpenAI-compatible endpoints, Mitii now has native paths for:

| Provider | Preset | Type | Notes |
|----------|--------|------|-------|
| OpenAI-compatible | `openai-compatible` | `openai-compatible` | Ollama, LM Studio, vLLM, proxies |
| OpenAI | `openai` | `openai` | `api.openai.com` defaults |
| Anthropic | `anthropic` | `anthropic` | Native Messages API + streaming |
| Google Gemini | `gemini` | `gemini` | Native Gemini API |
| DeepSeek | `deepseek` | `openai-compatible` | OpenAI-compatible preset |
| Cursor | `cursor` | `openai-compatible` | OpenAI-compatible preset |
| OpenAI Codex | `codex` | `openai-compatible` | OpenAI-compatible preset |
| Echo | `echo` | `echo` | UI/testing stub |

Configure in **Settings → Provider**. Select a **preset** (which sets the type, base URL, and model defaults). Use **Test connection** before saving.

## Token budget & profiles

- **Context window** is the single knob — derived budgets (max output, tool results, system prompt) are computed from it automatically.
- **Reset budgets to defaults** restores the derived values.
- **Profiles** (`.mitii/profiles.json`) let you save and switch between provider + model + budget configurations without re-entering settings.

## Separate Plan vs Act models

Optional overrides in **Settings → Agent**:

- `mitii.agent.planModel` + `planBaseUrl` — cheaper model for planning
- `mitii.agent.actModel` + `actBaseUrl` — stronger model for implementation

Leave blank to use the main provider model for both modes.

## Differentiated autonomy presets

`safe`, `guided`, `builder`, `pilot`, and `enterprise` now have **distinct behavior** — not identical logic:

- **Safe / Enterprise** — network off (`fetch_web` blocked), full review
- **Guided** — `ask_edits` approval mode, network on for docs fetch
- **Builder** — auto-approve writes, review mutating shell
- **Pilot** — high write autonomy, shell still gated

Selector available in **Settings → Safety**.

## MCP remote transports

MCP is **off by default** — enable with `mitii.mcp.enabled`. Servers support three transports:

| Transport | Config |
|-----------|--------|
| **stdio** | `command`, `args`, `env` (local `npx` servers) |
| **sse** | `url`, `headers` (remote SSE) |
| **streamable-http** | `url`, `headers` (MCP Streamable HTTP spec) |

OAuth / bearer tokens via `headers.Authorization` or `oauth.accessToken` in server config. Edit in **Settings → Integrations**. In **Act mode**, certain MCP tools can be excluded via MCP exclusions.

## Git-stash checkpoints

Checkpoint strategy is configurable (`mitii.agent.checkpointStrategy`):

- **`git-stash`** (default) — `git stash push` before writes when repo available
- **`shadow-git`** — shadow stash with distinct message prefix
- **`file-copy`** — copies to `.mitii/checkpoints/` (fallback)

Restore from the **Checkpoints** panel or via controller API.

## Inline diff accept/reject

When a write or patch awaits approval:

1. **View in editor** on the approval card opens inline decorations
2. Run **Mitii: Accept Inline Diff** or **Mitii: Reject Inline Diff** from the command palette
3. Optional **diff preview tabs** still available via `mitii.agent.showDiffPreview`

## Browser tool (`fetch_web`)

HTTP fetch for external docs and API references:

- 30s timeout, 50k char cap, HTML stripped to text
- Gated by `mitii.safety.allowNetwork` / autonomy preset
- Blocked in **safe** and **enterprise** presets

## Bundled embedding (on-device)

Semantic indexing now uses a **host-owned bundled embedding** — vectors are produced on-device without calling the chat-model provider or any external API:

- No network round-trips, no API costs
- LanceDB remains optional for vector storage (default: SQLite)
- `minilm` (quality) or `hash` (speed) backends selectable
- Works offline; degrades gracefully if the model is unavailable

## Hardened large-repo indexing

Large repositories now index with explicit **scan → index → cancel** phases:

- Partial-index status — usable results while indexing continues
- Progress detail in the VS Code UI and CLI
- "Degraded but usable" messaging when the index is incomplete
- Cancel support without corrupting existing index state

## CLI as first-class app

`@mitii/cli` is a headless CLI over `@mitii/sdk` → `@mitii/v8` (with `@mitii/host` for indexing, checkpoints, memory, and skills):

```bash
npm install -g @mitii/cli
# or
npx @mitii/cli
```

- `mitii setup` — interactive provider configuration
- `--echo` flag — test without a real LLM
- Env vars: `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `MITII_API_KEY`
- Same agent core, same skills, same safety model as VS Code

## Workspace path migration: `.thunder/` → `.mitii/`

All new workspace data uses **`.mitii/`**:

| Path | Contents |
|------|----------|
| `mitii.sqlite` | Index, sessions, memory, plans, checkpoints |
| `logs/` | JSONL session logs |
| `checkpoints/` | File-copy snapshots |
| `tasks/` | Plan JSON files |
| `mcp.json` | Workspace MCP servers |
| `skills/` | `SKILL.md` skill definitions |
| `diff-preview/` | Temporary diff preview files |
| `profiles.json` | Saved provider/model/budget profiles |

Legacy `.thunder/` paths are still ignored for backward compatibility.

## Test coverage

New Vitest suites cover providers, autonomy presets, MCP auth, plan/act config, checkpoint strategy, `fetch_web` policy, and planning skill routing (`test/features.test.ts`, `test/plan-skill-routing.test.ts`).

## Cursor-style Plan mode UI

Plan mode now uses a dedicated **Planner** panel (above chat) instead of duplicating the plan in chat prose:

| UI element | What it shows |
|------------|----------------|
| **Planning pipeline** | Live status: discovery → requirement analysis → compile |
| **Requirement analysis** | Collapsible section streamed into the panel |
| **Skill chips** | Applied playbooks (`planning-and-task-breakdown`, etc.) |
| **Phased steps** | Diagnostics / Review / Execute / Verify groups |
| **Step details** | Objective, tools, success criteria, dependencies, risk |

Chat shows a short summary when the plan is ready; the panel is the single source of truth.

## Planning skills integration

Previously, `use_skill` was allowed during planning but never prompted or auto-loaded — the model often searched source code instead of loading playbooks.

Now:

1. **PlanOrchestrator** resolves skills by intent and pre-loads playbook content
2. **Discovery / analysis / compiler prompts** include skill guidance and injected playbooks
3. **Plan nudges** mention `use_skill` when grounding is missing
4. **Quality gate** expects verification-oriented success criteria on multi-step plans

Bundled skills install to `.mitii/skills/` on workspace scaffold (12 playbooks including `planning-and-task-breakdown`, `safety-always`, and `test-driven-development`).

## SDK host-neutral API

`@mitii/sdk` provides a stable, host-neutral surface for custom integrations:

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
- Same safety, memory, and skill system as the apps
