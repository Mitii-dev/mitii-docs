# Configuration

Mitii settings use the `thunder.*` namespace in VS Code (historical internal name). Configure via the sidebar **Settings** tab or VS Code Settings → **Mitii AI Agent**.

## Quick start

```json
{
  "thunder.provider.type": "openai-compatible",
  "thunder.provider.baseUrl": "http://localhost:11434/v1",
  "thunder.provider.model": "qwen3-coder:30b",
  "thunder.provider.contextWindow": 32768,
  "thunder.safety.autonomyPreset": "guided",
  "thunder.agent.checkpointStrategy": "git-stash",
  "thunder.indexing.autoIndexOnOpen": true,
  "thunder.indexing.vectorsEnabled": true,
  "thunder.agent.verifyCommands": ["npm run lint", "npm test"],
  "thunder.telemetry.sessionLogging": true
}
```

## Provider

| Setting | Values | Description |
|---------|--------|-------------|
| `thunder.provider.type` | `openai-compatible`, `openai`, `anthropic`, `gemini`, `deepseek`, `cursor`, `codex`, `echo` | LLM provider |
| `thunder.provider.baseUrl` | URL | API base (provider-specific default) |
| `thunder.provider.model` | string | Model name |
| `thunder.provider.contextWindow` | number | Token cap for prompt trimming |
| API key | — | VS Code SecretStorage (settings UI) |

[Provider guide →](/implementation/providers)

## Plan / Act models

| Setting | Description |
|---------|-------------|
| `thunder.agent.planModel` | Optional plan-mode model override |
| `thunder.agent.planBaseUrl` | Optional plan-mode URL override |
| `thunder.agent.actModel` | Optional agent-mode model override |
| `thunder.agent.actBaseUrl` | Optional agent-mode URL override |
| `thunder.agent.orchestrationEnabled` | Multi-step planner in Plan mode (default `true`) |

## Safety

| Setting | Values | Description |
|---------|--------|-------------|
| `thunder.safety.autonomyPreset` | `safe`, `guided`, `builder`, `pilot`, `enterprise` | Quick safety profile |
| `thunder.safety.approvalMode` | `review_all`, `ask_edits`, `ask_deletes`, `ask_commands`, `auto` | Fine-grained approval |
| `thunder.safety.allowNetwork` | boolean | `fetch_web` access (presets override) |
| `thunder.safety.allowUntrustedWorkspace` | boolean | Allow writes in untrusted workspaces |

[Safety guide →](/implementation/safety)

## Agent

| Setting | Default | Description |
|---------|---------|-------------|
| `thunder.agent.maxSteps` | `15` | Max tool rounds per turn |
| `thunder.agent.autoContinue` | `true` | Continue after step limit |
| `thunder.agent.maxAutoContinues` | `2` | Max continuation rounds |
| `thunder.agent.subagentsEnabled` | `true` | Research subagents |
| `thunder.agent.researchAgentMaxSteps` | `6` | Subagent step limit |
| `thunder.agent.researchAgentModel` | `""` | Optional subagent model |
| `thunder.agent.showDiffPreview` | `false` | VS Code diff tabs before writes |
| `thunder.agent.checkpointStrategy` | `git-stash` | `file-copy`, `git-stash`, `shadow-git` |
| `thunder.agent.verifyOnActComplete` | `true` | Run verify commands after Act |
| `thunder.agent.verifyCommands` | `["npm run lint", "npm test"]` | Post-act shell commands |

## Indexing

| Setting | Default | Description |
|---------|---------|-------------|
| `thunder.indexing.enabled` | `true` | Workspace indexing |
| `thunder.indexing.autoIndexOnOpen` | `true` | Index on folder open |
| `thunder.indexing.vectorsEnabled` | `true` | Semantic vectors |
| `thunder.indexing.embeddingProvider` | `minilm` | `minilm` or `hash` |
| `thunder.indexing.vectorBackend` | `sqlite` | `sqlite` or `lancedb` |
| `thunder.indexing.treeSitterEnabled` | `true` | WASM symbol extraction |
| `thunder.indexing.maxConcurrency` | `2` | Parallel index workers |

## Context

| Setting | Default | Description |
|---------|---------|-------------|
| `thunder.context.rerankerEnabled` | `true` | Rerank retrieval candidates |
| `thunder.context.rerankerCandidatePool` | `20` | Candidates before rerank |
| `thunder.context.rerankerTopK` | `8` | Items after rerank |

## Memory

| Setting | Default | Description |
|---------|---------|-------------|
| `thunder.memory.enabled` | `true` | Memory system |
| `thunder.memory.hybridSearchEnabled` | `true` | FTS + vector hybrid |
| `thunder.memory.maxItems` | `500` | Max observations |

## MCP

| Setting | Default | Description |
|---------|---------|-------------|
| `thunder.mcp.enabled` | `true` | MCP master switch |
| `thunder.mcp.preloadBuiltin` | `true` | Built-in servers on startup |
| `thunder.mcp.maxConcurrentStartup` | `4` | Parallel server connections |
| `thunder.mcp.servers` | `{}` | Custom server definitions |
| `thunder.mcp.builtinServers` | object | Per-builtin toggles |

[MCP guide →](/implementation/mcp)

## Telemetry

| Setting | Default | Description |
|---------|---------|-------------|
| `thunder.telemetry.sessionLogging` | `true` | JSONL logs in `.mitii/logs/` |
| `thunder.telemetry.debugMetrics` | `false` | Extra diagnostics in logs |

## Project rules

Auto-loaded methodology files:

- `AGENTS.md`, `CLAUDE.md`, `WARP.md`, `.cursorrules`
- `.mitii/rules`, `.mitii/agents`, `.mitii/checks`, `.mitii/prompts`
- `.clinerules`, `.continue/rules`, `.cursor/rules`

## Full schema

Every key is defined in the extension `package.json` → `contributes.configuration`. Browse the [thunder-ai-agent repo](https://github.com/codewithshinde/thunder-ai-agent) for the authoritative list.
