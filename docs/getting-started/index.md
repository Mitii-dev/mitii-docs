# Getting Started

Mitii is a local-first AI coding agent that lives inside your editor. It indexes your workspace, plans multi-file changes, and executes them with your approval — all without sending your code to a vendor server.

This page walks you through installing Mitii, connecting a model, and using every available feature. The full setup takes about five minutes.

::: tip Quick install
VS Code: Extensions → "Mitii AI Agent" · CLI: `npm install -g @mitii/cli` · SDK: `npm install @mitii/sdk`
:::

## Requirements

| Tool | Version | Needed for |
|------|---------|------------|
| VS Code (or Cursor, Windsurf) | 1.124+ | Extension install |
| Node.js | 20+ | CLI, SDK, or building from source |
| pnpm | 10.13+ | Building from source only |

You also need an LLM endpoint:

- **Ollama** — free, local, no API key (recommended for getting started)
- **Cloud API** — Anthropic, OpenAI, Gemini, DeepSeek, Azure, OpenRouter, any OpenAI-compatible `/v1`
- **Echo** — built-in mock provider for testing without a real model

## Install

### VS Code extension (recommended)

1. Open the Extensions panel (`Cmd+Shift+X` / `Ctrl+Shift+X`)
2. Search for **Mitii AI Agent** (publisher: **mitii**)
3. Click **Install**, then open the Mitii sidebar from the activity bar

### CLI

```bash
npm install -g @mitii/cli
# or try it once
npx @mitii/cli --help
```

### From source

```bash
git clone https://github.com/Mitii-dev/Mitii.git
cd Mitii
pnpm run setup          # install + native rebuild + build
# pnpm run setup:cursor # for Cursor
```

Press **F5** to launch the Extension Development Host, open a project folder, and start chatting.

## Connect a model

### In the editor

1. Open **Settings → Provider** in the Mitii sidebar
2. Pick a **preset** (Ollama, Anthropic, Gemini, etc.) — auto-fills base URL and model
3. Add your API key if required (local hosts like Ollama don't need one)
4. Click **Test connection**, then **Save**

### With the CLI

```bash
mitii setup              # interactive wizard — writes .mitii/config.json
```

### Ollama (local, no API key)

Install [Ollama](https://ollama.com), pull a model, then add to VS Code `settings.json`:

```json
{
  "mitii.provider.preset": "ollama",
  "mitii.provider.baseUrl": "http://localhost:11434/v1",
  "mitii.provider.model": "qwen3-coder:30b"
}
```

## Run your first session

1. Open a **trusted** workspace folder in VS Code
2. Wait for indexing to finish (status indicator in the sidebar toolbar)
3. Choose a **mode**:
   - **Ask** — read-only Q&A about your codebase
   - **Plan** — structured analysis and planning, no writes
   - **Agent** — full implementation with approval gates on every write and shell command
   - **Review** — structured code review of diffs, commits, or workspaces
4. Type a question or task. Use `@` to pin files/folders into context
5. In Agent mode, review each proposed change in an approval card before it's applied

## Using all Mitii features

### Workspace Indexing

Mitii builds a multi-layer index automatically when you open a folder:

| Layer | What it provides |
|-------|-----------------|
| **FTS5** | Fast full-text keyword search |
| **Tree-sitter** | Symbol extraction (functions, classes, imports) across 100+ languages |
| **Repo map** | PageRank over import/export edges — surfaces structurally important files |
| **Vectors** | On-device MiniLM embeddings for semantic similarity search |
| **Git + LSP** | Uncommitted diffs and live diagnostics injected into context |
| **Project rules** | Auto-loads `AGENTS.md`, `.cursor/rules`, `.clinerules`, `.mitii/rules` |

To control indexing, go to **Settings → Workspace** and toggle `autoIndexOnOpen` or `vectorsEnabled`.

### Memory & Checkpoints

- **Memory** — Mitii stores durable facts (decisions, preferences, architecture notes) scoped to user/workspace/project. At each turn, relevant facts are retrieved and injected into context automatically. Manage via **Settings → Memory**.
- **Checkpoints** — Before each approved write, Mitii creates a git-stash snapshot. Roll back any change from the **Memory / Checkpoints** panel in the sidebar.

To enable:

```json
{ "mitii.agent.checkpointStrategy": "git-stash" }
```

### Skills

Mitii ships 12 bundled behavior-shaping skills (commit messages, PR summaries, changelogs, etc.) and supports custom skills via `.mitii/skills/` in your project. Skills are auto-selected based on your task — no manual activation needed.

To add a custom skill, create a markdown file in `.mitii/skills/` with a title, description, and playbook body.

### Code Intelligence

- **Navigation** — Resolve definitions, references, hover info, and call hierarchies via the integrated language service.
- **Change Impact** — Before editing, Mitii walks the repository graph to estimate blast radius (affected files, packages, callers).

These run automatically in Agent and Plan modes. In Ask mode, ask "what depends on this file?" to trigger impact analysis.

### Safety & Control

Every risky operation passes through two layers:

1. **Decision Policy** — decides what is allowed (route, tools, paths, commands, network)
2. **Tool Runtime** — enforces the grant (validates each call, enforces limits, supports rollback)

Configure your autonomy level in **Settings → Safety**:

```json
{ "mitii.safety.autonomyPreset": "guided" }
```

- `guided` — Mitii asks before every write and shell command (default)
- `autonomous` — Mitii proceeds without per-step approval (use with caution)

### FIM Autocomplete

Optional inline code completion in VS Code. Enable in **Settings → Autocomplete** and point it at any OpenAI-compatible `prompt` + `suffix` endpoint (Ollama, LM Studio, etc.).

### Web Retrieval

Mitii can search the web and fetch content-aware pages (Stack Overflow, GitHub issues, Wikipedia, arXX, HTML readability). Enable in **Settings → Integrations** and configure a search provider (SearXNG, Brave, or Tavily).

### MCP Integration

Mitii acts as an MCP **client** — connect external MCP servers to add custom tools. Off by default.

1. Open **Settings → MCP**
2. Toggle `mitii.mcp.enabled` to `true`
3. Install a server from the built-in catalog (`filesystem`, `memory`, `sequential-thinking`) or add your own via config

Once running, MCP tools appear in the agent's tool list for the next conversation.

### Session Logs & Audit

Every tool call, approval, and model response is logged as structured JSONL in `.mitii/logs/`. View logs in **Settings → Developer** or open the Log Viewer. Export an audit pack from the VS Code host for compliance review.

### Automation & Agents

Mitii supports cron-based automation and reusable agent definitions for recurring tasks (PR review, post-commit coverage, incident triage). See [Automation](/automation/) for setup.

## Suggested initial settings

```json
{
  "mitii.safety.autonomyPreset": "guided",
  "mitii.agent.checkpointStrategy": "git-stash",
  "mitii.indexing.autoIndexOnOpen": true,
  "mitii.indexing.vectorsEnabled": true,
  "mitii.telemetry.sessionLogging": true
}
```

## The sidebar at a glance

| Area | Purpose |
|------|---------|
| **Chat** | Messages, streaming responses, tool activity |
| **Retrieved context** | Inspect exactly which files/symbols were in the prompt |
| **Memory / Checkpoints** | Long-term observations and git-stash restore points |
| **Plan panel** | Step-by-step plan with run state (Plan mode) |
| **History** | Past conversations |
| **Settings → Provider** | Model, base URL, token limits, profiles |
| **Settings → Workspace** | Folder and repository index controls |
| **Settings → Modes** | Ask / Plan / Agent / Review defaults and run budget |
| **Settings → Context** | What gets attached to each turn |
| **Settings → MCP** | Optional MCP servers |
| **Settings → Developer** | Logging, token-budget tunables, diagnostics |

## Next steps

- [Why Mitii?](/why-mitii) — what makes it different
- [Connect a model](/using/connect-model) — full provider guide
- [Features](/features) — overview of everything Mitii can do
- [Plan / Act workflow](/understanding/agent-intelligence/plan-act) — how planning and execution work
- [Configuration](/using/configuration) — every setting, explained
- [Development](/development/development-setup) — for contributors
- [Recent improvements](/changelog/recent-improvements) — what's new
