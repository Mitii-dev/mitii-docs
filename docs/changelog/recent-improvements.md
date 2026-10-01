# Changelog

This page tracks the major capabilities shipped in Mitii AI Agent. Use the version headings below to jump to a release.

<ChangelogSelector />

## [2.9.67] - 2026-09-27

### Added
- Git working tree pane: unified AI job runner for commit message, changelog, release notes, PR summary, and code review generation, with a single active-job state and a Stop button (new `IconStop`) to abort in-flight generation.
- Right-click context menu on working tree files for running AI jobs against a selected set of paths.
- "More" overflow menu in the working tree pane toolbar for secondary actions.
- `gitStash` engine API (`git stash push` with pathspec, optional `--include-untracked`, and optional stash message) with path and message sanitization.
- `POST /v1/git/stash` engine server endpoint (auth-protected) and `gitStashFiles` renderer API client.
- `changelogMerge` utility (`mergeChangelogSection`, `unwrapRecipeAnswer`) to merge generated Keep a Changelog sections into an existing `CHANGELOG.md`, plus unit tests (`changelogMerge.spec.ts`).
- Upsert behavior for generated markdown: saves to an existing workspace file or creates it (including parent path) when missing.

### Changed
- Working tree pane now merges untracked files into the "Changes" group (separate "Untracked" group removed) and sorts the combined list by path.
- Replaced separate `genBusy`/`reviewBusy` states with a single `activeJob` state and `AbortController`-based cancellation across all AI jobs.
- Recipe prompts now accept an optional note that is prepended when not already present in the compiled prompt.

### Fixed
- Stash message input is validated via `assertSafeGitArg` to prevent shell/argument injection through the stash label.

## [2.9.67] - 2025-01-15

### Added
- **Git: stash selected files** — New `gitStash` engine API (`git stash push` with optional `--include-untracked` and message) exposed via `POST /v1/git/stash`, with path sanitization and stash-message argument safety checks; renderer client `gitStashFiles` and a "Stash" action in the Git working-tree pane.
- **Changelog generation with merge** — New `changelogMerge` module (`mergeChangelogSection`, `unwrapRecipeAnswer`) that merges a generated Keep a Changelog section into `CHANGELOG.md` (upserting the file if missing), plus unit tests (`changelogMerge.spec.ts`).
- **Unified SCM job runner with Stop** — Commit message, changelog, release notes, PR summary, and code review now share a single job state with an abortable stream (`AbortController`) and a new Stop button (`IconStop`) to cancel in-flight generation.
- **File context menu** — Right-click context menu on working-tree files for multi-file actions, with click-outside and Escape dismissal.

### Changed
- **Git pane: merged "Untracked" into "Changes"** — Staged and Changes groups now cover all dirty and untracked files (sorted), simplifying selection and per-file actions; untracked files are detected per-path for stash behavior.
- **Changelog output saved to workspace** — Generated changelog sections are written back to `CHANGELOG.md` (create-or-update) instead of only being displayed.

### Fixed
- Recipe answer unwrapping (fenced-code-block stripping) centralized in `changelogMerge` to avoid duplicated, inconsistent parsing in the Git pane.

## [Unreleased]

### Added
- **Mode profiles (`.mitii/modes.json`)** — Optional workspace overlays on Ask / Plan / Agent. Built-ins: `architect`, `code`, `ask`, `debug`. Custom profiles support role text, `toolGroups`, and `mutationRelativePathRegex`. Set `active` to apply a profile on every run; omit `active` to leave the UI/CLI mode control in charge. Hosted in `@mitii/host` (`loadModeProfiles`, `compileModeProfile`, `mergeUserSafetyRules`); wired in VS Code and CLI start paths.
- **Workspace safety (`.mitii/safety.json`)** — Tighten-only deny tools/commands, command allowlists, `protectedPathGlobs`, category `autoApprove` (`write` / `execute` / `mcp` / `network` / `external`), optional `approvalCeiling` and `mutationRelativePathRegex`. VS Code requires `mitii.safety.userRulesEnabled: true`. Defaults for protected paths via `withDefaultProtectedPaths` / `DEFAULT_PROTECTED_PATH_GLOBS`.
- **Environment details in prompts** — Hosts inject optional `instructions.environment` (visible files, open tabs, terminals, mode reminder). Prompt Construction budgets the block with the system section. VS Code collects IDE state; CLI passes a mode reminder. SDK: `MitiiStartInput.environment`.
- **ToolGrant approval UX metadata** — `approvalSkipCategories`, `protectedPathGlobs`, and `mutationRelativePathRegex` on grants; Tool Runtime skips approval by category, always asks on protected paths, and enforces mutation path regex on apply_patch / delete / move.
- Hardened large-repository indexing with explicit scan/index/cancel phases, partial-index status, progress detail, and "degraded but usable" messaging in the VS Code UI and CLI.
- Expanded first-run onboarding into Echo, local Ollama/OpenAI-compatible, optional cloud key, and safety/index steps with connection testing at each provider stage.
- Promoted `propose_file_scope` to the default Act contract in prompts so file reads and edits are scoped before model tool use.
- Polished async local jobs with worker leases, job show/retry/cancel commands, worker limits, JSON worker events, and overnight-worker documentation.

### Changed
- `UserSafetyRules` / SDK start input use the shared V8 safety schema (including auto-approve and protected paths) instead of a duplicated subset.
- `IntersectUserSafetyRules` copies host UX fields onto the grant without widening tools or effects; `grantNeverWidens` ignores those metadata fields.
- Child-run safety fragments include `protectedPathGlobs` for schema compatibility.
- Public `@mitii/v8` exports extended for mode compilation (`MUTATION_TOOL_IDS`, `NETWORK_TOOL_IDS`, `OPT_IN_MUTATION_TOOL_IDS`, `GITHUB_MUTATION_TOOL_IDS`, `PROCESS_TOOL_IDS`, approval-skip helpers).

## [2.7.54] - 2026-07-15

### Added
- Enhanced context panel functionality and improved the chat input and Plan panel layout. (e90ac58)
- Introduced the `propose_file_scope` tool and enhanced file reading guidance so models declare candidate paths before reading or editing. (86216d4)

### Changed
- Refactored path resolution and skill catalog integration for more consistent workspace discovery. (356ddcc)

## [2.7.52] - 2026-07-10

### Added
- Added external file reading with user approval in `ToolExecutor` and related components. (1271094)
- Enhanced native module rebuilding and indexing policy defaults for large workspaces. (3aa756b)

### Changed
- Reordered Act intent feature detection and refreshed README version metadata. (91c0457)
- Updated README version metadata to 2.7.50 and optimized imports in session recovery tests. (9c6ded0)
- Refactored internal code structure for maintainability. (1216666)

## [2.7.50] - 2026-07-07

### Added
- Added base URL, model, and API key support to the manual benchmark runner. (e7f0453)
- Added base URL, model, and API key support to benchmark tasks. (b511bdb)
- Added medium-severity planning benchmark tasks. (1cb4886)
- Enhanced README routing detection so README updates classify as documentation work. (463de7d)

### Changed
- Updated dispose methods to be async and handle promises safely. (c541a8f)

## [2.7.49] - 2026-07-05

### Added
- Added call graph context with language service integration. (a361ad4)
- Added runtime health tracking for embedding providers and vector backends, including degraded-state UI. (dfc81b7)
- Added the retrieval eval harness with additive instrumentation and benchmark tooling. (d28da4c)
- Enhanced PlanActEngine and UI components with clipboard copy support and theme styling updates. (9d1556b)
- Improved token display with input/output details in token chips. (28c4988)

### Changed
- Improved retrieval metrics with deduplication logic. (fbd683a)
- Refined ThinkingRow display, global CSS, agent edit nudges, Markdown patching tests, and generated benchmark timestamps. (c0de1d1)

## [2.7.32] - 2026-07-04

### Added
- Enhanced path resolution and tool guidance. (ad48013)
- Introduced team management and durable job queue services. (af4e6dd)

## [2.7.30] - 2026-07-03

### Added
- Added subagent architecture, workspace agent loading, task board service, parallel agent runner, task commands, daemon support, and daemon/parallel agent tests. (464a24b)
- Enhanced memory management and CLI functionality. (eef546a)
- Added eval and benchmark scripts, documentation, and generated coding tasks. (78f4ff4, 1b9cc88)
- Restored chat sessions and active plans across workspace reloads. (5af82f0)
- Added provider profiles, autonomy presets, onboarding, review diff features, and improved commit-message detection. (62b38ef, d651d56, 3df0628)

### Changed
- Migrated the project from npm to pnpm and added pnpm configuration. (9c6fe93, f1455d1)
- Updated README/package version metadata to 2.7.29 and synchronized generated benchmark timestamps. (e47cd01)
- Replaced native selects with custom dropdowns in the composer footer. (9ec5aff)

## [2.7.17] - 2026-07-02

### Added
- Implemented the backlog end-to-end across the repo: diff-first micro-task routing, unified SCM commit message generation, changelog/release generation core, one-click audit pack export, improved reasoning stream UI, enterprise settings/docs, Windows path hardening, CLI MVP for changelog/prepare-release/export-audit, and focused tests. (8a00fd5)
- add AWS Bedrock, Azure OpenAI, and OpenRouter provider support (cac73bc)
- **modes:** add pilot and enterprise depth levels to Ask, Plan, and Act modes (ca3d2da)
- **orchestrator:** add planning clarification question flow with resume support (0d05293)
- auto-discover verify commands, add retry with install, cap sequential-thinking calls (6786a1d)
- improve plan step UI, add skipped tool handling, and strip channel markers (d65a817)
- add GitHub token setting and improve issue comment pagination (7c8e53d)
- Implemented the core folder structure migration safely. (017ddd4)
- auto-fetch GitHub issue context when user pastes an issue URL (1f0b368)
- add retrieval timing metrics, repeated tool failure guard, and Act mode MCP exclusions (dda2e8f)
- add Act orchestration boundary for Agent mode execution (0620f2e)
- **docs:** update README with enhanced project description, features, and usage instructions (920bf12)
- **plan:** add skill-aware planning pipeline with phased PlanPanel UI (e23f19d)
- bundle skill playbooks inside extension and auto-install on workspace init (07a8323)
- add planDepth setting and skill frontmatter parsing (d77ed8f)
- **plan-mode:** add Plan mode orchestration with intent routing and read-only grounding (14372af)
- **core:** add file read caching and parallelize read files tool (95dee1d)
- **scm:** add AI-generated commit messages and ask-mode depth controls (8ea9411)
- **ask:** add structured ask mode with intent routing, scope resolution, and impact analysis (aa2660f)

### Changed
- add project-goals entry to .gitignore configuration (81ecf0d)
- Merge branch 'main' of https://github.com/codewithshinde/thunder-ai-agent (9574697)
- **tools:** remove unused resolveToolDirPath and related imports (44a3dd3)

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
