# Getting Started

Mitii is a local-first AI coding agent that lives inside your editor. It indexes your workspace, plans multi-file changes, and executes them with your approval — all without sending your code to a vendor server.

This page walks you through installing Mitii, connecting a model, and running your first session. The whole flow takes about five minutes.

::: tip Quick install
VS Code: Extensions → "Mitii AI Agent" · CLI: `npm install -g @mitii/cli` · SDK: `npm install @mitii/sdk`
:::

## Requirements

| Tool | Version | Needed for |
|------|---------|------------|
| VS Code (or Cursor, Windsurf, etc.) | 1.124+ | Extension install |
| Node.js | 20+ | CLI, SDK, or building from source |
| pnpm | 10.13+ | Building from source only |

You also need an LLM endpoint. The most common choices:

- **Ollama** — free, runs locally, no API key required (recommended for getting started)
- **Cloud API** — Anthropic, OpenAI, Gemini, DeepSeek, and others
- **Echo** — a built-in mock provider for testing without a real model

## Install

### VS Code extension (recommended)

1. Open the Extensions panel (`Cmd+Shift+X` / `Ctrl+Shift+X`)
2. Search for **Mitii AI Agent** (publisher: **mitii**)
3. Click **Install**, then open the Mitii sidebar from the activity bar

You can also install directly from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=mitii.mitii-ai-agent).

> [Full VS Code guide →](/using/VSCode/overview) — keyboard shortcuts, profiles, and advanced settings.

### CLI

The CLI gives you the same agent engine in your terminal — useful for scripts, CI pipelines, and quick one-off questions.

```bash
npm install -g @mitii/cli
# or try it once without installing
npx @mitii/cli --help
```

> [Full CLI reference →](/using/cli)

### From source

For contributors who want to build and debug the extension:

```bash
git clone https://github.com/Mitii-dev/Mitii.git
cd Mitii
pnpm run setup          # one-shot: install + native rebuild + build (VS Code)
# pnpm run setup:cursor # for Cursor
```

Press **F5** to launch the Extension Development Host, open a project folder, and start chatting.

> [Development setup guide →](/development/development-setup)

## Connect a model

Mitii needs a model to generate responses. You configure this once and it persists across sessions.

### In the editor

1. Open **Settings → Provider** in the Mitii sidebar (or follow the onboarding prompt on first launch)
2. Pick a **preset** — Ollama, Anthropic, Gemini, etc. — which auto-fills the base URL and model name
3. Add your API key if the provider requires one (local hosts like Ollama don't)
4. Click **Test connection**, then **Save**

### With the CLI

```bash
mitii setup              # interactive wizard — writes .mitii/config.json
```

Or set an environment variable and skip the wizard:

```bash
export ANTHROPIC_API_KEY=sk-...
mitii session
```

### Ollama (local, no API key)

If you prefer a local model, install [Ollama](https://ollama.com), pull a model, then add this to your VS Code `settings.json`:

```json
{
  "mitii.provider.preset": "ollama",
  "mitii.provider.baseUrl": "http://localhost:11434/v1",
  "mitii.provider.model": "qwen3-coder:30b"
}
```

[Full provider guide →](/using/connect-model) · [All supported providers →](/integrations/providers)

## Run your first session

1. Open a workspace folder in VS Code (it must be a **trusted** folder)
2. Wait for indexing to finish — the status indicator in the sidebar toolbar shows progress
3. Choose a **mode**:
   - **Ask** — read-only Q&A about your codebase
   - **Plan** — structured analysis and planning, no writes
   - **Agent** — full implementation with approval gates on every write and shell command
4. Type a question or task. Use `@` to pin specific files or folders into context (e.g. `@src/auth/ explain the token refresh flow`)
5. In Agent mode, review each proposed change in an approval card before it's applied

> [How Plan / Act works in detail →](/understanding/agent-intelligence/plan-act)

A typical first conversation might look like:

> **You:** `@src/api/ What endpoints handle user authentication, and where are the rate limits configured?`
>
> **Mitii:** *(reads the relevant files, traces the call chain, and explains the flow with file references)*

## The sidebar at a glance

| Area | Purpose |
|------|---------|
| **Chat** | Messages, streaming responses, tool activity |
| **Retrieved context** | Expand to inspect exactly which files and symbols were included in the prompt |
| **Memory / Checkpoints** | Long-term observations and [git-stash restore points](/understanding/agent-intelligence/memory-checkpoints) |
| **Plan panel** | Step-by-step plan with run state (Plan mode) |
| **History** | Past conversations |
| **Settings → Provider** | Model, base URL, token limits, profiles |
| **Settings → Workspace** | Folder and repository index controls |
| **Settings → Modes** | Ask / Plan / Agent defaults and run budget |
| **Settings → Context** | What gets attached to each turn |
| **Settings → MCP** | Optional [MCP](/integrations/mcp) servers |
| **Settings → Developer** | Logging, token-budget tunables, diagnostics |

## Suggested initial settings

These are sensible defaults for a first-time setup. You can change any of them later in **Settings**:

```json
{
  "mitii.safety.autonomyPreset": "guided",
  "mitii.agent.checkpointStrategy": "git-stash",
  "mitii.indexing.autoIndexOnOpen": true,
  "mitii.indexing.vectorsEnabled": true,
  "mitii.telemetry.sessionLogging": true
}
```

- `autonomyPreset: "guided"` — Mitii asks before every write and shell command
- `checkpointStrategy: "git-stash"` — creates a git stash before each run so you can roll back
- `autoIndexOnOpen` — indexes the workspace automatically when you open a folder
- `vectorsEnabled` — enables semantic (embedding-based) search alongside keyword search
- `sessionLogging` — writes JSONL audit logs to `.mitii/` for review

> [Full configuration reference →](/using/configuration)

## Tips

- **Search** — Press `Ctrl+K` (or `⌘+K` on macOS) to open the search bar and jump to any page instantly.
- **Dark mode** — Click the moon/sun icon in the top-right to toggle between light and dark themes.
- **Table of contents** — On longer pages, use the "On this page" panel on the right to navigate sections.

> [Full feature list →](/features#vitepress-features)

## Next steps

- [Why Mitii?](/why-mitii) — what makes it different from other AI coding tools
- [Connect a model](/using/connect-model) — full provider guide and configuration reference
- [Features](/features) — overview of everything Mitii can do
- [Plan / Act workflow](/understanding/agent-intelligence/plan-act) — how planning and execution work together
- [Architecture](/understanding/architecture/system-architecture) — how the engine is structured
- [Configuration](/using/configuration) — every setting, explained
- [Development](/development/development-setup) — build from source, run tests, contribute
- [Recent improvements](/changelog/recent-improvements) — what's new
