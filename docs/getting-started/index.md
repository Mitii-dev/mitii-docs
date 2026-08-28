# Getting Started

> **Quick install** — VS Code: Extensions → "Mitii AI Agent" · CLI: `npm install -g @mitii/cli` · SDK: `npm install @mitii/sdk`

Get Mitii AI Agent running in VS Code (or the CLI) in a few minutes.

## Requirements

| Tool | Version |
|------|---------|
| VS Code | 1.124+ (Cursor, Windsurf, and other forks work) |
| Node.js | 20+ (for building from source or using the CLI) |
| pnpm | 10.13+ (for building from source) |

You also need an LLM endpoint: **Ollama** (recommended local), a cloud API, or **Echo** for testing.

## Install from Marketplace

1. Open VS Code Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`)
2. Search **Mitii AI Agent**
3. Install from publisher **mitii**
4. Open the Mitii sidebar from the activity bar

Or install directly: [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=mitii.mitii-ai-agent)

## Install the CLI

```bash
npm install -g @mitii/cli
# or try it without installing
npx @mitii/cli --help
```

The CLI is headless — same engine, no UI. Configure it once with `mitii setup` and it works in scripts, CI, and terminals.

## Install from source

```bash
git clone https://github.com/Mitii-dev/Mitii.git
cd Mitii
pnpm install
pnpm run build:all
```

Or use the one-shot setup script (install + native rebuild + build in one step):

```bash
pnpm run setup          # VS Code
pnpm run setup:cursor   # Cursor
```

Press **F5** to launch the Extension Development Host. Open a project folder, wait for indexing, then chat.

## Connect a model

1. Open **Settings → Provider** in the Mitii sidebar (or follow the onboarding prompt)
2. Pick a **preset** (Ollama, Anthropic, Gemini, …) — it auto-fills base URL and model
3. Add your API key if the provider requires one (local hosts usually don't)
4. Click **Test connection** → **Save**

Quick Ollama setup:

```json
{
  "mitii.provider.preset": "ollama",
  "mitii.provider.baseUrl": "http://localhost:11434/v1",
  "mitii.provider.model": "qwen3-coder:30b"
}
```

CLI equivalent:

```bash
mitii setup              # interactive — writes .mitii/config.json
# or
export ANTHROPIC_API_KEY=sk-...
mitii session
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
| Retrieved context | Expand to see the context debugger |
| Memory / Checkpoints | Side tabs below context |
| Plan panel | Active plan steps and run state |
| History | Past conversations |
| Settings → Provider | Connect a model, token limits, profiles |
| Settings → Workspace | Folder + repository index |
| Settings → Modes | Ask / Plan / Agent defaults and run budget |
| Settings → Context | What is attached to each turn |
| Settings → MCP | Optional MCP servers |
| Settings → Developer | Logging, token-budget tunables, diagnostics |

## Recommended first settings

```json
{
  "mitii.safety.autonomyPreset": "guided",
  "mitii.agent.checkpointStrategy": "git-stash",
  "mitii.indexing.autoIndexOnOpen": true,
  "mitii.indexing.vectorsEnabled": true,
  "mitii.telemetry.sessionLogging": true
}
```

## Next steps

- [Why Mitii?](/why-mitii) — what makes it different
- [Connect a model](/getting-started/connect-model)
- [Architecture](/architecture) — how the V8 engine works
- [Features](/features/)
- [Plan / Act workflow](/implementation/plan-act)
- [Configuration](/configuration)
- [Development](/development) — build from source, run tests
- [Recent improvements](/implementation/recent-improvements)
