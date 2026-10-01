# Getting Started

Mitii is a local-first AI coding agent. It reads your codebase, thinks before it acts, and only does what you allow, all on your own machine.

There are a few ways to use Mitii, depending on where you like to work. Pick the one that fits you:

| I want to… | Use |
|---|---|
| Code inside my editor | [VS Code Extension](#install-the-vs-code-extension) |
| Chat with Mitii in a standalone window | [Desktop app](#install-the-desktop-app) |
| Work from the terminal | [CLI](#install-the-cli) |
| Build Mitii into my own app | [SDK](#install-the-sdk) |
| Let Mitii work while I'm away | [Automation](#set-up-automation) |

## Before you start

- **Node.js 20+** (22 recommended): needed for the CLI, SDK, and automation
- **VS Code 1.124+**: only if you're using the extension
- **A model to talk to**: either [Ollama](https://ollama.com) running locally (no API key needed) or a cloud provider like Anthropic, OpenAI, or Gemini

## Install the VS Code Extension

This is the quickest way to get started: Mitii lives right inside your editor, next to your code.

1. **Add the extension**

   [Install it from the VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=mitii.mitii-ai-agent), or open the Extensions panel (`Cmd+Shift+X` / `Ctrl+Shift+X`), search for **Mitii AI Agent**, and click **Install**.

2. **Open your project**

   Open the folder you want to work on in VS Code.

3. **Connect a model**

   Click the Mitii icon in the activity bar, go to **Settings → Provider**, pick a preset, add your API key, hit **Test connection**, then **Save**.

4. **Say hello**

   Open the Mitii sidebar, wait for indexing to finish, and type what you'd like done. Tip: use `@filename` to point Mitii at a specific file.

More details: [VS Code Extension Overview](/using/vscode/overview)

## Install the Desktop app

Prefer a dedicated window over an editor panel? The desktop app gives you chat, repository management, and git in one place: powered by the same engine as everything else.

1. **Get the code**

   ```bash
   git clone https://github.com/Mitii-dev/Mitii
   cd Mitii
   ```

2. **Install and build**

   ```bash
   pnpm install
   pnpm --filter @mitii/sdk --filter @mitii/host --filter @mitii/mcp build
   pnpm --filter @mitii/desktop build
   ```

3. **Launch it**

   ```bash
   pnpm --filter @mitii/desktop dev
   ```

4. **Connect a model**

   Open **Settings** in the app, pick a provider, and add your API key or run `mitii setup` once and the desktop app will pick up the same configuration.

More details: [Desktop Overview](/using/Desktop/overview) and [Desktop Setup](/using/Desktop/setup)

## Install the CLI

The CLI is for people who live in the terminal. It's the same agent, just driven by commands.

1. **Install Node.js**

   Node.js 20+ (22 recommended).

2. **Install the CLI**

   ```bash
   npm install -g @mitii/cli
   ```

3. **Set up your model**

   ```bash
   mitii setup
   ```

   This walks you through picking a provider, entering your API key, and choosing a model.

4. **Run it**

   ```bash
   mitii session
   # or give it a task directly:
   mitii "your task"
   ```

More details: [CLI Setup & Providers](/using/CLI/setup)

## Install the SDK

Building your own tool and want Mitii inside it? The SDK lets you embed the agent in any Node.js application.

1. **Add the package**

   ```bash
   npm install @mitii/sdk
   ```

2. **Create an agent**

   ```ts
   import { createAgent } from "@mitii/sdk";
   const agent = createAgent({ cwd: "/path/to/repo" });
   ```

3. **Give it a task**

   ```ts
   await agent.run("Refactor utils to named exports");
   ```

More details: [SDK Reference](/using/sdk)

## Set up automation

Want Mitii to keep working while you're away: running scheduled jobs, reacting to pushes or CI failures, opening draft PRs on its own? That's what the daemon is for.

1. **Install the daemon**

   ```bash
   npm install -g @mitii/daemon
   ```

2. **Start it**

   ```bash
   mitii-daemon --cwd /path/to/repo
   ```

3. **Tell it what to do**

   Drop a small agent spec into `.mitii/cron/` or wire up a webhook and pick an autonomy preset (`readonly`, `apply`, `apply_and_pr`) to set the boundaries.

More details: [Automation overview](/automation/) and [Daemon docs](/using/daemon)

## Next steps

- [Configuration](/using/configuration)(every setting, explained)
- [Connect a model](/using/connect-model)(the full provider guide)
- [Features](/features)(indexing, memory, skills, MCP, and more)
- [Automation](/automation/)(cron jobs, event triggers, and shipped agents)
- [Why Mitii?](/why-mitii)(the design philosophy behind it all)
