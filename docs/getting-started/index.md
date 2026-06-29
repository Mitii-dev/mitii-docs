# Getting Started

Get Mitii AI Agent running in VS Code in a few minutes.

## Requirements

- **VS Code** 1.85 or later (Cursor and other VS Code forks work too)
- **Node.js** 20 or later
- A local or remote **OpenAI-compatible** LLM endpoint (Ollama recommended)

## Install from source

```bash
git clone https://github.com/codewithshinde/thunder-ai-agent.git
cd thunder-ai-agent
npm install
npm run compile
```

Press **F5** in VS Code to launch the Extension Development Host. Open a project folder, wait for indexing to finish (status bar in the Mitii sidebar), then start chatting.

## Connect a model

1. Open **Settings** in the Mitii sidebar (or VS Code settings under `Mitii AI Agent`)
2. Set `thunder.provider.type` to `openai-compatible`
3. Point `thunder.provider.baseUrl` at your endpoint (default: `http://localhost:11434/v1` for Ollama)
4. Set `thunder.provider.model` (default: `qwen3-coder:30b`)

Use the **Echo** provider for UI testing without an LLM. API keys are stored in VS Code SecretStorage via the settings UI.

## First session

1. Open a trusted workspace folder
2. Wait for the indexing status bar to show completion
3. Choose a mode: **Plan**, **Act**, or **Review**
4. Ask about your codebase — mention files with `@` for explicit context

## Next steps

- [Connect a model in detail](/getting-started/connect-model)
- [Explore features](/features/)
- [Configure safety and indexing](/configuration)
