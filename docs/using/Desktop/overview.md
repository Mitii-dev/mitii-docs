# Desktop

Mitii Desktop is a standalone window for working with your code. Chat with the agent, browse your file tree, manage git, and configure MCP servers, skills, and recipes, all in one place. It runs the same engine as the CLI, so behavior, tools, and model routing are identical.

![Mitii Desktop overview](/mitii-desktop.png)

## First 5 minutes

1. **Open the app** and pick a workspace folder (the repo you want to work on).
2. **Connect a model.** Go to **Settings > Provider**, pick a preset (Ollama, Anthropic, OpenAI, Gemini, etc.), paste your API key, and hit **Test connection**.
3. **Send your first message.** Type what you want done in the chat composer. Use `@filename` to point Mitii at a specific file.

That is it. Mitii reads your codebase, plans, and acts within the permissions you set.

## What you can do

| Task | Where |
|---|---|
| Chat with the agent (streaming responses) | Chat pane |
| Browse and edit files | Explorer pane |
| View diffs | Explorer > Diff view |
| Stage, unstage, discard, commit, switch branches | Git pane |
| Manage MCP servers | MCP pane |
| Manage skills | Skills pane |
| Manage recipes | Recipes pane |
| Switch between connected repos | Settings > Repositories |

## Where your data lives

- **Settings** are stored in the app's local data directory (`mitii-desktop.sqlite`).
- **API keys** are encrypted with your OS keychain (Electron `safeStorage`).
- **Per-repo data** (index, memory, chat history) lives in that repo's `.mitii/` folder, the same folder the CLI uses. Nothing is duplicated.
- CLI-compatible `config.json` and `mcp.json` are still written so other tools can read them.

## For developers

The desktop app is an Electron shell around a local HTTP engine. The renderer talks to the engine over the `mitii-desktop/v1` protocol on a loopback port.

| Layer | Responsibility |
|---|---|
| Electron main | Window, workspace picker, settings/secrets IPC, engine spawn |
| Engine | `MitiiClient`, streaming runs, tool gate |
| Renderer | Chat, explorer, git, MCP/skills/recipes UI |

## Next steps

- [Setup](./setup): install, launch, and troubleshoot the desktop app
- [Engine Protocol](./protocol): the internal HTTP API
- [Development Setup](../../development/development-setup): full monorepo build guide
