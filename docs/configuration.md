# Configuration

Mitii settings live under the `thunder.*` namespace in VS Code settings or the in-sidebar Settings tab.

## Quick reference

```json
{
  "thunder.provider.type": "openai-compatible",
  "thunder.provider.baseUrl": "http://localhost:11434/v1",
  "thunder.provider.model": "qwen3-coder:30b",
  "thunder.safety.autonomyPreset": "guided",
  "thunder.safety.approvalMode": "review_all",
  "thunder.indexing.autoIndexOnOpen": true,
  "thunder.indexing.vectorsEnabled": true,
  "thunder.agent.verifyCommands": ["npm run lint", "npm test"],
  "thunder.telemetry.sessionLogging": true
}
```

## Provider

| Setting | Description |
|---------|-------------|
| `thunder.provider.type` | `openai-compatible` or `echo` |
| `thunder.provider.baseUrl` | API base URL (default Ollama: `http://localhost:11434/v1`) |
| `thunder.provider.model` | Model name sent in chat requests |
| `thunder.provider.apiKey` | Stored in VS Code SecretStorage |

## Safety

| Setting | Description |
|---------|-------------|
| `thunder.safety.autonomyPreset` | `safe`, `guided`, `builder`, `pilot`, `enterprise` |
| `thunder.safety.approvalMode` | When to pause for human approval |

## Indexing

| Setting | Description |
|---------|-------------|
| `thunder.indexing.autoIndexOnOpen` | Index workspace when a folder is opened |
| `thunder.indexing.vectorsEnabled` | Enable local embedding vectors |
| `thunder.indexing.vectorBackend` | `sqlite` or `lancedb` |

## Agent

| Setting | Description |
|---------|-------------|
| `thunder.agent.verifyCommands` | Shell commands run after Act-mode edits |
| `thunder.agent.maxToolRounds` | Max tool loop iterations per turn |

## MCP

| Setting | Description |
|---------|-------------|
| `thunder.mcp.preloadBuiltin` | Load built-in filesystem, memory, sequential-thinking servers |
| `thunder.mcp.servers` | Additional MCP server definitions |

## Project rules

Mitii picks up methodology files automatically:

- `AGENTS.md`, `CLAUDE.md`, `WARP.md`, `.cursorrules`
- `.thunder/rules`, `.thunder/agents`, `.thunder/checks`, `.thunder/prompts`
- `.clinerules`, `.continue/rules`, `.cursor/rules`

Commit these to your repo so every session starts with the same conventions.

## Full schema

See `package.json` → `contributes.configuration` in the repository for every available key.
