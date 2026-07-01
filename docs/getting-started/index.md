# Getting Started

Get Mitii AI Agent running in VS Code in a few minutes.

## Requirements

- **VS Code** 1.85+ (Cursor, Windsurf, and other forks work)
- **Node.js** 20+ (for building from source)
- An LLM endpoint: **Ollama** (recommended local), cloud API, or **Echo** for testing

## Install from Marketplace

1. Open VS Code Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`)
2. Search **Mitii AI Agent**
3. Install from publisher **mitii**
4. Open the Mitii sidebar from the activity bar

Or install directly: [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=mitii.mitii-ai-agent)

## Install from source

```bash
git clone https://github.com/codewithshinde/thunder-ai-agent.git
cd thunder-ai-agent
npm install
npm run rebuild:native   # if better-sqlite3 fails to load
npm run compile
```

Press **F5** to launch the Extension Development Host. Open a project folder, wait for indexing, then chat.

## Connect a model

1. Open **Settings** in the Mitii sidebar (gear icon)
2. **Model** tab — pick provider type (Ollama = `openai-compatible`)
3. Set base URL and model name
4. Click **Test connection**
5. Save

Quick Ollama setup:

```json
{
  "thunder.provider.type": "openai-compatible",
  "thunder.provider.baseUrl": "http://localhost:11434/v1",
  "thunder.provider.model": "qwen3-coder:30b"
}
```

[Detailed model guide →](/getting-started/connect-model) · [All providers →](/implementation/providers)

## First session

1. Open a **trusted** workspace folder
2. Wait for indexing (status in sidebar toolbar)
3. Pick a mode: **Plan**, **Agent**, or **Ask**
4. Ask about your codebase — use `@` to pin files/folders
5. In Agent mode, approve writes via approval cards

## Explore the UI

| Area | What it does |
|------|----------------|
| Chat | Messages, streaming, tool activity |
| Retrieved context | Expand to see context debugger |
| Memory / Checkpoints | Side tabs below context |
| Plan panel | Active plan steps |
| History | Past conversations |
| Settings | Model, agent, safety, MCP, context |

## Recommended first settings

```json
{
  "thunder.safety.autonomyPreset": "guided",
  "thunder.agent.checkpointStrategy": "git-stash",
  "thunder.indexing.autoIndexOnOpen": true,
  "thunder.telemetry.sessionLogging": true
}
```

## Next steps

- [Why Mitii?](/why-mitii) — what makes it different
- [Connect a model](/getting-started/connect-model)
- [Features](/features/)
- [Plan / Act workflow](/implementation/plan-act)
- [Configuration](/configuration)
- [Recent improvements](/implementation/recent-improvements)
