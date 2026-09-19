# Configuration

Mitii is a local-first AI coding agent that runs inside your editor. It reads your workspace, plans changes, and executes them — but how it behaves depends on how you configure it.

All settings live in the **sidebar Settings tab** (or VS Code Settings → *Mitii AI Agent*). They use the `mitii.*` namespace, so you can also edit them directly in `settings.json`.

This page covers every setting group. You only need to configure a few of them to get started; the rest have sensible defaults.

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

- **Provider** — points Mitii at your local Ollama instance and tells it which model to use.
- **Safety** — `guided` means Mitii asks before writing files or running commands, but handles read-only operations on its own.
- **Checkpoint** — `git-stash` snapshots your working tree before edits so you can roll back.
- **Indexing** — Mitii builds a semantic index of your codebase when you open a folder, so it can find relevant files without you pointing it at them.
- **Verification** — after Mitii finishes a task, it runs your lint and test commands to confirm nothing broke.

That's all you need. Everything else has sensible defaults.

---

## Provider

The provider settings determine which LLM powers Mitii and how it connects to that model.

| Setting | What it does |
|---------|-------------|
| `mitii.provider.type` | Provider family: `openai-compatible`, `openai`, `anthropic`, `gemini`, `deepseek`, `cursor`, `codex`, `echo` |
| `mitii.provider.baseUrl` | API endpoint (defaults per provider) |
| `mitii.provider.model` | Model name to send requests to |
| `mitii.provider.contextWindow` | Token budget — Mitii trims prompts to fit this cap |
| API key | Stored in VS Code SecretStorage; set via the Settings UI, not `settings.json` |

::: tip
`openai-compatible` works with any endpoint that speaks the OpenAI chat-completions API — Ollama, LM Studio, vLLM, and most self-hosted servers.
:::

### Plan / Act model overrides

Mitii operates in two phases: **Plan** (it analyses the task and drafts a multi-step strategy) and **Act** (it executes the plan by calling tools). You can assign a different model to each phase — for example, a fast, cheap model for planning and a stronger model for execution:

| Setting | Purpose |
|---------|---------|
| `mitii.agent.planModel` / `planBaseUrl` | Model used during Plan mode |
| `mitii.agent.actModel` / `actBaseUrl` | Model used during Act mode |
| `mitii.agent.orchestrationEnabled` | Enables the multi-step planner (default `true`) |

[Full provider guide →](/integrations/providers)

---

## Safety

Safety settings control how much the agent can do on its own versus how often it pauses to ask you. This is the most important section if you're new to Mitii.

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
| `enterprise` | Strictest profile — no network, all actions reviewed |

The preset sets a baseline; individual settings override it. For example, `guided` asks before edits, but you can flip `approvalMode` to `auto` to skip that.

[Full safety guide →](/understanding/agent-intelligence/safety)

---

## Agent behaviour

These settings control how Mitii executes a task: how long it runs, whether it delegates work to parallel subagents, and what it does when it finishes.

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.agent.maxSteps` | `15` | Max tool-call rounds per turn (one round = one tool invocation + result) |
| `mitii.agent.autoContinue` | `true` | Keep going after hitting the step limit |
| `mitii.agent.maxAutoContinues` | `2` | How many times it can auto-continue |
| `mitii.agent.subagentsEnabled` | `true` | Spawn research subagents for parallel exploration (e.g. searching multiple files at once) |
| `mitii.agent.researchAgentMaxSteps` | `6` | Step cap for each subagent |
| `mitii.agent.researchAgentModel` | `""` | Optional cheaper model for subagents |
| `mitii.agent.showDiffPreview` | `false` | Open VS Code diff tabs before applying writes |
| `mitii.agent.checkpointStrategy` | `git-stash` | How to snapshot before edits: `file-copy` (copies files), `git-stash` (stashes working tree), `shadow-git` (separate git repo) |
| `mitii.agent.verifyOnActComplete` | `true` | Run verification commands after Act finishes |
| `mitii.agent.verifyCommands` | `["npm run lint", "npm test"]` | The commands to run for verification |

::: info Checkpoint strategies in practice
`git-stash` is the best default for most projects — it's fast, reversible, and works with any Git repo. Use `file-copy` if you're not in a Git repo, or `shadow-git` if you want a fully isolated snapshot that doesn't touch your real `.git` directory.
:::

---

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

---

## Context retrieval

When you ask Mitii a question or give it a task, it needs to find the most relevant code in your workspace. Context retrieval controls how it selects and ranks those candidates before injecting them into the model's prompt.

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.context.rerankerEnabled` | `true` | Rerank retrieval candidates before injecting them |
| `mitii.context.rerankerCandidatePool` | `20` | How many candidates to pull before reranking |
| `mitii.context.rerankerTopK` | `8` | How many survive into the prompt |

In practice: Mitii pulls 20 candidate snippets, reranks them by relevance, and injects the top 8 into the model context. Increase `rerankerTopK` if you find Mitii missing relevant files; decrease it to save tokens.

---

## Memory

Memory stores durable facts Mitii learns across sessions — your preferences, architectural decisions, project conventions — so it doesn't forget them between conversations.

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.memory.enabled` | `true` | Master switch |
| `mitii.memory.hybridSearchEnabled` | `true` | Combine full-text + vector search |
| `mitii.memory.maxItems` | `500` | Cap on stored observations |

[Full memory guide →](/understanding/agent-intelligence/memory-checkpoints)

---

## MCP (Model Context Protocol)

MCP lets Mitii connect to external tool servers — databases, custom APIs, filesystems, or any service that speaks the MCP protocol. This extends the agent's capabilities beyond its built-in tools.

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.mcp.enabled` | `true` | Master switch |
| `mitii.mcp.preloadBuiltin` | `true` | Start built-in servers on launch |
| `mitii.mcp.maxConcurrentStartup` | `4` | Parallel server connections at startup |
| `mitii.mcp.servers` | `{}` | Custom server definitions (name → command/args) |
| `mitii.mcp.builtinServers` | object | Per-builtin on/off toggles |

[Full MCP guide →](/integrations/mcp)

---

## Telemetry

Local-only logging. Nothing leaves your machine.

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.telemetry.sessionLogging` | `true` | Write JSONL session logs to `.mitii/logs/` |
| `mitii.telemetry.debugMetrics` | `false` | Add extra diagnostic fields to logs |

---

## Project rules

Mitii auto-loads methodology and style files from your repo so it follows your conventions without you repeating them in every prompt. Supported locations:

- `AGENTS.md`, `CLAUDE.md`, `WARP.md`, `.cursorrules`
- `.mitii/rules/`, `.mitii/agents/`, `.mitii/checks/`, `.mitii/prompts/`
- `.clinerules`, `.continue/rules/`, `.cursor/rules/`

Drop a file in any of those locations and Mitii picks it up on the next run. For example, a `.mitii/rules/style.md` file containing your team's naming conventions will be injected into every session automatically.

---

## Developer

Hidden by default. Toggle on in the Settings sidebar for advanced switches (log level, experimental flags, etc.). Leave off unless you're debugging.

---

## Where to find the full schema

Every key is declared in the extension's `package.json` → `contributes.configuration`. The sidebar Settings UI is generated from that schema, so what you see in the UI is the complete list.
