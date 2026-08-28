# Configuration

All Mitii settings live in the **sidebar Settings tab** (or VS Code Settings → *Mitii AI Agent*). They use the `mitii.*` namespace, so you can also edit them directly in `settings.json`.

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

That's all you need to start. Everything else has sensible defaults.

---

## Provider

Which model powers Mitii.

| Setting | What it does |
|---------|-------------|
| `mitii.provider.type` | Provider family: `openai-compatible`, `openai`, `anthropic`, `gemini`, `deepseek`, `cursor`, `codex`, `echo` |
| `mitii.provider.baseUrl` | API endpoint (defaults per provider) |
| `mitii.provider.model` | Model name to send requests to |
| `mitii.provider.contextWindow` | Token budget — Mitii trims prompts to fit this cap |
| API key | Stored in VS Code SecretStorage; set via the Settings UI, not `settings.json` |

### Plan / Act model overrides

You can use a different (often cheaper) model for planning vs. acting:

| Setting | Purpose |
|---------|---------|
| `mitii.agent.planModel` / `planBaseUrl` | Model used during Plan mode |
| `mitii.agent.actModel` / `actBaseUrl` | Model used during Act mode |
| `mitii.agent.orchestrationEnabled` | Enables the multi-step planner (default `true`) |

[Full provider guide →](/implementation/providers)

---

## Safety

Controls how much freedom Mitii has before asking you.

| Setting | Values | What it does |
|---------|--------|-------------|
| `mitii.safety.autonomyPreset` | `safe`, `guided`, `builder`, `pilot`, `enterprise` | One-click safety profile (most common way to configure) |
| `mitii.safety.approvalMode` | `review_all`, `ask_edits`, `ask_deletes`, `ask_commands`, `auto` | Fine-grained: which actions still need your OK |
| `mitii.safety.allowNetwork` | `true` / `false` | Whether `fetch_web` is available |
| `mitii.safety.allowUntrustedWorkspace` | `true` / `false` | Allow writes when the workspace isn't trusted |

The preset sets a baseline; individual settings override it. For example, `guided` asks before edits, but you can flip `approvalMode` to `auto` to skip that.

[Full safety guide →](/implementation/safety)

---

## Agent behaviour

How Mitii runs, how long it runs, and what it does after.

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.agent.maxSteps` | `15` | Max tool-call rounds per turn |
| `mitii.agent.autoContinue` | `true` | Keep going after hitting the step limit |
| `mitii.agent.maxAutoContinues` | `2` | How many times it can auto-continue |
| `mitii.agent.subagentsEnabled` | `true` | Spawn research subagents for parallel exploration |
| `mitii.agent.researchAgentMaxSteps` | `6` | Step cap for each subagent |
| `mitii.agent.researchAgentModel` | `""` | Optional cheaper model for subagents |
| `mitii.agent.showDiffPreview` | `false` | Open VS Code diff tabs before applying writes |
| `mitii.agent.checkpointStrategy` | `git-stash` | How to snapshot before edits: `file-copy`, `git-stash`, `shadow-git` |
| `mitii.agent.verifyOnActComplete` | `true` | Run verification commands after Act finishes |
| `mitii.agent.verifyCommands` | `["npm run lint", "npm test"]` | The commands to run for verification |

---

## Indexing

How Mitii builds its understanding of your codebase.

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.indexing.enabled` | `true` | Master switch for workspace indexing |
| `mitii.indexing.autoIndexOnOpen` | `true` | Index automatically when you open a folder |
| `mitii.indexing.vectorsEnabled` | `true` | Build semantic vectors for similarity search |
| `mitii.indexing.embeddingProvider` | `minilm` | Embedding model: `minilm` (quality) or `hash` (fast, no network) |
| `mitii.indexing.vectorBackend` | `sqlite` | Storage: `sqlite` (default) or `lancedb` (larger corpora) |
| `mitii.indexing.treeSitterEnabled` | `true` | Use Tree-sitter WASM for symbol extraction |
| `mitii.indexing.maxConcurrency` | `2` | Parallel index workers |

[Full indexing guide →](/implementation/context-indexing)

---

## Context retrieval

How Mitii picks the most relevant code for each prompt.

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.context.rerankerEnabled` | `true` | Rerank retrieval candidates before injecting them |
| `mitii.context.rerankerCandidatePool` | `20` | How many candidates to pull before reranking |
| `mitii.context.rerankerTopK` | `8` | How many survive into the prompt |

---

## Memory

Durable facts Mitii remembers across sessions (preferences, decisions, project context).

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.memory.enabled` | `true` | Master switch |
| `mitii.memory.hybridSearchEnabled` | `true` | Combine full-text + vector search |
| `mitii.memory.maxItems` | `500` | Cap on stored observations |

[Full memory guide →](/implementation/memory-checkpoints)

---

## MCP (Model Context Protocol)

Connect external tool servers (filesystem, databases, custom APIs).

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.mcp.enabled` | `true` | Master switch |
| `mitii.mcp.preloadBuiltin` | `true` | Start built-in servers on launch |
| `mitii.mcp.maxConcurrentStartup` | `4` | Parallel server connections at startup |
| `mitii.mcp.servers` | `{}` | Custom server definitions (name → command/args) |
| `mitii.mcp.builtinServers` | object | Per-builtin on/off toggles |

[Full MCP guide →](/implementation/mcp)

---

## Telemetry

Local-only logging. Nothing leaves your machine.

| Setting | Default | What it does |
|---------|---------|-------------|
| `mitii.telemetry.sessionLogging` | `true` | Write JSONL session logs to `.mitii/logs/` |
| `mitii.telemetry.debugMetrics` | `false` | Add extra diagnostic fields to logs |

---

## Project rules

Mitii auto-loads methodology and style files from your repo so it follows your conventions without you repeating them:

- `AGENTS.md`, `CLAUDE.md`, `WARP.md`, `.cursorrules`
- `.mitii/rules/`, `.mitii/agents/`, `.mitii/checks/`, `.mitii/prompts/`
- `.clinerules`, `.continue/rules/`, `.cursor/rules/`

Drop a file in any of those locations and Mitii picks it up on the next run.

---

## Developer

Hidden by default. Toggle on in the Settings sidebar for advanced switches (log level, experimental flags, etc.). Leave off unless you're debugging.

---

## Where to find the full schema

Every key is declared in the extension's `package.json` → `contributes.configuration`. The sidebar Settings UI is generated from that schema, so what you see in the UI is the complete list.
