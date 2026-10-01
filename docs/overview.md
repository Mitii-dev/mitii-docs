# Mitii Overview

Mitii is a **local-first AI coding agent** that indexes your codebase, plans before acting, and keeps every operation under your control, all on your machine.

## What Mitii Does

| Capability | Description |
|---|---|
| **Repository Understanding** | Deep code navigation, context indexing, and dependency analysis that gives Mitii full awareness of your codebase. |
| **Agent Intelligence** | Memory checkpoints, skills, and task planning that let Mitii reason through complex multi-step workflows. |
| **Multi-Platform** | Works seamlessly across CLI, VS Code, Desktop, and SDK integrations. One agent, every surface you code in. |
| **Automation** | Cron schedules, event triggers, and purpose-built agents (PR review, post-commit cover, incident triage) for unattended work. |
| **Integrations** | MCP client for external tools, pluggable LLM providers (local or cloud), and a search kit for web results. |

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│  Apps:  CLI · VS Code · Desktop · ACP · Daemon         │
├─────────────────────────────────────────────────────────┤
│  @mitii/sdk  —  public programmatic API                │
├─────────────────────────────────────────────────────────┤
│  @mitii/v8   —  agent runtime, tool pipeline, policy   │
├─────────────────────────────────────────────────────────┤
│  @mitii/host —  indexing, memory, checkpoints, skills  │
└─────────────────────────────────────────────────────────┘
```

- **@mitii/v8** owns the agent loop: request intake → planning → tool execution → review → response.
- **@mitii/host** provides durable state: codebase index, memory store, skill registry, and session checkpoints.
- **Apps** are thin shells that wire the runtime to a UI (terminal, editor panel, desktop window, or stdio protocol).

## Key Concepts

| Concept | Where to learn more |
|---|---|
| **Memory** | Durable facts about your project, preferences, and past decisions- retrieved each turn. [Docs](/understanding/agent-intelligence/memory) |
| **Planning** | Mitii decomposes a task into steps, validates them, then executes. [Docs](/understanding/agent-intelligence/planning) |
| **Decision Policy** | Every tool call passes through a grant/audit gate. [Docs](/understanding/agent-intelligence/decision-policy) |
| **Skills** | Reusable prompt+tool bundles you can attach to any session. [Docs](/using/skills) |
| **MCP** | Connect external tool servers without writing integration code. [Docs](/integrations/mcp) |

## Supported Surfaces

| Surface | Use case |
|---|---|
| **CLI** | Interactive terminal coding, scripting, CI pipelines |
| **VS Code** | In-editor agent with sidebar chat, diff preview, and inline edits |
| **Desktop** | Standalone Electron app for chat, repo management, and git inspection |
| **SDK** | Embed Mitii in your own Node.js application |
| **Daemon** | Long-running automation: cron jobs, event triggers, unattended agents |
| **ACP** | Stdio JSON-lines bridge for embedding in external tools |

## Getting Started

1. **Install** — pick your surface: [Getting Started](/getting-started/)
2. **Connect a model** — Ollama (local) or any cloud provider: [Connect a Model](/using/connect-model)
3. **Run a task** — type a prompt, watch Mitii plan and execute
4. **Automate** — add cron triggers or event-based agents: [Automation](/automation/)

## Design Principles

- **Local-first**: your code and data stay on your machine; no telemetry required.
- **Plan before act**: Mitii reasons through a plan and shows it before mutating files.
- **Policy-gated**: every tool call is validated against a decision policy; nothing runs ungranted.
- **Transparent**: full session logs, memory inspection, and audit trails are available.

## Learn More

- [Why Mitii?](/why-mitii) (design philosophy and trade-offs)
- [Features](/features) (detailed feature reference)
- [Configuration](/using/configuration) (every setting explained)
- [Automation](/automation/) (cron, events, and built-in agents)
- [Integrations](/integrations/mcp) (MCP, providers, search)
