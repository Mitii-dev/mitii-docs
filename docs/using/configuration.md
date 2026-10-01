# Configuration

All settings use the `mitii.*` namespace. You can change them in the **sidebar Settings tab**, in VS Code Settings (*Mitii AI Agent*), or directly in `settings.json`.

This page covers every setting group. Most have sensible defaults; you only need to configure a few to get started.

## Setting groups at a glance

| Group | What it controls |
|-------|-----------------|
| [Provider](#provider) | Which LLM Mitii talks to |
| [Safety](#safety) | How much Mitii can do without asking |
| [Agent behaviour](#agent-behaviour) | Execution limits, subagents, checkpoints, verification |
| [Indexing](#indexing) | How Mitii builds its codebase understanding |
| [Context retrieval](#context-retrieval) | How Mitii selects relevant code for the prompt |
| [Memory](#memory) | Durable facts across sessions |
| [MCP](#mcp-model-context-protocol) | External tool servers |
| [Telemetry](#telemetry) | Local session logging |
| [Project rules](#project-rules) | Auto-loaded methodology files |
| [Developer](#developer) | Advanced / experimental switches |

## Quick start

A minimal working config for a local Ollama model:

```json
{
  "mitii.provider.type": "openai-compatible",
  "mitii.provider.baseUrl": "http://localhost:11434/v1",
  "mitii.provider.model": "qwen3-coder:30b",
  "mitii.provider.contextWindow": 32768,
  "mitii.safety.autonomyPreset": "guided",
  "mitii.agent.checkpointStrategy": "git-stash",
  "mitii.indexing.autoIndexOnOpen": true,
  "mitii.indexing.vectorsEnabled": true,
  "mitii.agent.verifyCommands": ["npm run lint", "npm test"],
  "mitii.telemetry.sessionLogging": true
}
```

What this does in practice:

- **Provider**: points Mitii at your local Ollama instance and tells it which model to use.
- **Safety**: `guided` means Mitii asks before writing files or running commands, but handles read-only operations on its own.
- **Checkpoint**: `git-stash` snapshots your working tree before edits so you can roll back.
- **Indexing**: Mitii builds a semantic index of your codebase when you open a folder, so it can find relevant files without you pointing it at them.
- **Verification**: after Mitii finishes a task, it runs your lint and test commands to confirm nothing broke.

That's all you need.

## Provider

Which LLM powers Mitii and how it connects.

| Setting | What it does |
|---------|-------------|
| `mitii.provider.type` | Provider family: `openai-compatible`, `openai`, `anthropic`, `gemini`, `deepseek`, `cursor`, `codex`, `echo` |
| `mitii.provider.baseUrl` | API endpoint (defaults per provider) |
| `mitii.provider.model` | Model name to send requests to |
| `mitii.provider.contextWindow` | Token budget; Mitii trims prompts to fit this cap |
| API key | Stored in VS Code SecretStorage; set via the Settings UI, not `settings.json` |

::: tip
`openai-compatible` works with any endpoint that speaks the OpenAI chat-completions API: Ollama, LM Studio, vLLM, and most self-hosted servers.
:::

[Full provider guide →](/integrations/providers)

## Safety

How much Mitii can do on its own versus how often it pauses to ask you. This is the most important section if you're new to Mitii.

| Setting | Values | What it does |
|---------|--------|-------------|
| `mitii.safety.autonomyPreset` | `safe`, `guided`, `builder`, `pilot`, `enterprise` | One-click safety profile (most common way to configure) |
| `mitii.safety.approvalMode` | `review_all`, `ask_edits`, `ask_deletes`, `ask_commands`, `auto` | Fine-grained: which actions still need your OK |
| `mitii.safety.allowNetwork` | `true` / `false` | Whether `fetch_web` is available |
| `mitii.safety.allowUntrustedWorkspace` | `true` / `false` | Allow writes when the workspace isn't trusted |

### Choosing a preset

| Preset | Typical use case |
|--------|-----------------|
| `safe` | You want to review every single action before it runs |
| `guided` | Mitii handles reads and searches freely, but asks before writing files or running commands |
| `builder` | File edits are automatic; shell commands still require approval |
| `pilot` | Same as `builder` with a slightly broader tool allowance |
| `enterprise` | Strictest profile: no network, all actions reviewed |

The preset sets a baseline; individual settings override it. For example, `guided` asks before edits, but you can flip `approvalMode` to `auto` to skip that.

[Full safety guide →](/understanding/agent-intelligence/safety)

## Agent behaviour

How Mitii executes a task: execution limits, parallel subagents, model overrides, checkpoints, and post-task verification.

### Execution limits

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.agent.maxSteps` | `15` | Max tool-call rounds per turn |
| `mitii.agent.autoContinue` | `true` | Keep going after hitting the step limit |
| `mitii.agent.maxAutoContinues` | `2` | How many times it can auto-continue |
| `mitii.agent.showDiffPreview` | `false` | Open VS Code diff tabs before applying writes |

### Subagents

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.agent.subagentsEnabled` | `true` | Spawn research subagents for parallel exploration |
| `mitii.agent.researchAgentMaxSteps` | `6` | Step cap for each subagent |
| `mitii.agent.researchAgentModel` | `""` | Optional cheaper model for subagents |

### Plan / Act model overrides

Mitii operates in two phases: **Plan** (analyses the task, drafts a strategy) and **Act** (executes the plan by calling tools). You can assign a different model to each phase, for example a fast, cheap model for planning and a stronger model for execution.

| Setting | Purpose |
|---------|---------|
| `mitii.agent.planModel` / `planBaseUrl` | Model used during Plan mode |
| `mitii.agent.actModel` / `actBaseUrl` | Model used during Act mode |
| `mitii.agent.orchestrationEnabled` | Enables the multi-step planner (default `true`) |

### Checkpoints & verification

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.agent.checkpointStrategy` | `git-stash` | How to snapshot before edits: `file-copy`, `git-stash`, or `shadow-git` |
| `mitii.agent.verifyOnActComplete` | `true` | Run verification commands after Act finishes |
| `mitii.agent.verifyCommands` | `["npm run lint", "npm test"]` | The commands to run for verification |

::: info Checkpoint strategies in practice
`git-stash` is the best default for most projects: fast, reversible, works with any Git repo. Use `file-copy` if you're not in a Git repo, or `shadow-git` if you want a fully isolated snapshot that doesn't touch your real `.git` directory.
:::

## Indexing

Indexing is how Mitii builds its understanding of your codebase. When enabled, it parses your files, extracts symbols and structure, and (optionally) builds semantic vectors so it can find relevant code by meaning rather than just by name.

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.indexing.enabled` | `true` | Master switch for workspace indexing |
| `mitii.indexing.autoIndexOnOpen` | `true` | Index automatically when you open a folder |
| `mitii.indexing.vectorsEnabled` | `true` | Build semantic vectors for similarity search |
| `mitii.indexing.embeddingProvider` | `minilm` | Embedding model: `minilm` (quality) or `hash` (fast, no network) |
| `mitii.indexing.vectorBackend` | `sqlite` | Storage: `sqlite` (default) or `lancedb` (larger corpora) |
| `mitii.indexing.treeSitterEnabled` | `true` | Use Tree-sitter WASM for symbol extraction |
| `mitii.indexing.maxConcurrency` | `2` | Parallel index workers |

[Full indexing guide →](/understanding/repository-understanding/context-indexing)

## Context retrieval

How Mitii selects and ranks the most relevant code before injecting it into the model's prompt.

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.context.rerankerEnabled` | `true` | Rerank retrieval candidates before injecting them |
| `mitii.context.rerankerCandidatePool` | `20` | How many candidates to pull before reranking |
| `mitii.context.rerankerTopK` | `8` | How many survive into the prompt |

In practice: Mitii pulls 20 candidate snippets, reranks them by relevance, and injects the top 8 into the model context. Increase `rerankerTopK` if Mitii misses relevant files; decrease it to save tokens.

## Memory

Durable facts Mitii learns across sessions: preferences, architectural decisions, project conventions.

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.memory.enabled` | `true` | Master switch |
| `mitii.memory.hybridSearchEnabled` | `true` | Combine full-text + vector search |
| `mitii.memory.maxItems` | `500` | Cap on stored observations |

[Full memory guide →](/understanding/agent-intelligence/memory-checkpoints)

## MCP (Model Context Protocol)

Connect Mitii to external tool servers: databases, custom APIs, filesystems, or any service that speaks the MCP protocol.

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.mcp.enabled` | `true` | Master switch |
| `mitii.mcp.preloadBuiltin` | `true` | Start built-in servers on launch |
| `mitii.mcp.maxConcurrentStartup` | `4` | Parallel server connections at startup |
| `mitii.mcp.servers` | `{}` | Custom server definitions (name → command/args) |
| `mitii.mcp.builtinServers` | object | Per-builtin on/off toggles |

[Full MCP guide →](/integrations/mcp)

## Telemetry

Local-only logging. Nothing leaves your machine.

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.telemetry.sessionLogging` | `true` | Write JSONL session logs to `.mitii/logs/` |
| `mitii.telemetry.debugMetrics` | `false` | Add extra diagnostic fields to logs |

## Project rules

Mitii auto-loads methodology and style files from your repo so it follows your conventions without repeating them in every prompt. Supported locations:

- `AGENTS.md`, `CLAUDE.md`, `WARP.md`, `.cursorrules`
- `.mitii/rules/`, `.mitii/agents/`, `.mitii/checks/`, `.mitii/prompts/`
- `.clinerules`, `.continue/rules/`, `.cursor/rules/`

Drop a file in any of those locations and Mitii picks it up on the next run.

## Developer

Hidden by default. Toggle on in the Settings sidebar for advanced switches (log level, experimental flags, etc.). Leave off unless you're debugging.

## Where to find the full schema

Every key is declared in the extension's `package.json` → `contributes.configuration`. The sidebar Settings UI is generated from that schema, so what you see in the UI is the complete list.
