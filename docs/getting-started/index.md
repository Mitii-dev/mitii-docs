# Getting Started

Mitii is a local-first AI coding agent. It indexes your codebase, plans before acting, and keeps every operation under your control — all on your machine.

## Prerequisites

- **Node.js 20+** (22 recommended) — required for CLI, SDK, and Daemon
- **VS Code 1.124+** — required for the extension
- An LLM endpoint — [Ollama](https://ollama.com) (local, no API key) or a cloud provider (Anthropic, OpenAI, Gemini, etc.)

## Install the VS Code Extension

Use this if you want Mitii inside your editor for day-to-day coding.

1. **Install the extension**

   [Install from VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=mitii.mitii-ai-agent)

   Or open the Extensions panel (`Cmd+Shift+X` / `Ctrl+Shift+X`), search **Mitii AI Agent**, and click **Install**.

2. **Open your project**

   Open a trusted workspace folder in VS Code.

3. **Connect a model**

   Click the Mitii icon in the activity bar → **Settings → Provider** → pick a preset → add your API key → **Test connection** → **Save**.

4. **Start a session**

   Click the Mitii sidebar icon, wait for indexing to finish, then type your task. Use `@filename` to pin files.

More details: [VS Code Extension Overview](/using/vscode/overview)

## Install the CLI

Use this if you want Mitii in terminal workflows (interactive + automation).

1. **Install Node.js**

   Install Node.js 20+ (22 recommended).

2. **Install CLI**

   ```bash
   npm install -g @mitii/cli
   ```

3. **Authenticate**

   ```bash
   mitii setup
   ```

   Interactive wizard: pick a provider, enter your API key, choose a model.

4. **Run Mitii**

   ```bash
   mitii session
   # or
   mitii "your task"
   ```

More details: [CLI Setup & Providers](/using/CLI/setup)

## Install the SDK

Use this if you want to embed Mitii in your own Node.js application.

1. **Install the package**

   ```bash
   npm install @mitii/sdk
   ```

2. **Create an agent**

   ```ts
   import { createAgent } from "@mitii/sdk";
   const agent = createAgent({ cwd: "/path/to/repo" });
   ```

3. **Run a task**

   ```ts
   await agent.run("Refactor utils to named exports");
   ```

More details: [SDK Reference](/using/sdk)

## Install the Daemon

Use this if you want unattended, long-running automation (cron jobs, event triggers).

1. **Install the package**

   ```bash
   npm install -g @mitii/daemon
   ```

2. **Start the daemon**

   ```bash
   mitii-daemon --cwd /path/to/repo
   ```

More details: [Daemon docs](/using/daemon)

## Next steps

- [Configuration](/using/configuration) — every setting, explained
- [Connect a model](/using/connect-model) — full provider guide
- [Features](/features) — indexing, memory, skills, MCP, and more
- [Automation](/automation/) — cron jobs, event triggers
- [Why Mitii?](/why-mitii) — design philosophy
