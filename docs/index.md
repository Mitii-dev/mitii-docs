---
layout: home

hero:
  name: Mitii AI Agent
  text: Local-first coding agent
  tagline: Your local-first AI coding agent for complex work. Read files, write code, run commands — all with your approval.
  image:
    src: /logo.svg
    alt: Mitii AI Agent
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/
    - theme: alt
      text: View on GitHub
      link: https://github.com/codewithshinde/thunder-ai-agent

features:
  - icon: 🔍
    title: Deep repo context
    details: SQLite + FTS5 indexing, tree-sitter symbols, PageRank repo map, and optional MiniLM vectors — the agent knows your codebase before it edits.
  - icon: 🛡️
    title: Plan / Act / Review
    details: Plan before you touch code, act with tools under approval policies, and review without rewriting.
  - icon: 🔑
    title: Bring your own model
    details: Ollama, vLLM, or any OpenAI-compatible endpoint. Your code stays on your machine.
  - icon: 🔌
    title: MCP integrations
    details: Built-in filesystem, memory, and sequential-thinking servers plus workspace mcp.json support.
  - icon: 📋
    title: Audit trail
    details: JSONL session logs in .thunder/logs/ — every tool call, approval, token usage, and timing.
  - icon: ⚙️
    title: Tunable safety
    details: Autonomy presets from safe through enterprise. Dangerous commands blocked at the policy layer.
---

## What is Mitii?

Mitii is an AI coding agent that lives in VS Code. It can read and write files, run terminal commands, use MCP tools, and help you build features through natural conversation. Every write and shell action can require your explicit approval. You're always in control.

## Model access

Choose the model access path that fits your workflow:

<div class="card-grid">

<div class="card">

### Local runtime

Run models on your machine with **Ollama** or **vLLM**. Default endpoint: `http://localhost:11434/v1`.

</div>

<div class="card">

### OpenAI-compatible API

Point Mitii at any cloud or self-hosted endpoint that speaks the OpenAI chat completions API.

</div>

<div class="card">

### Echo provider

Test the UI and tool loop without a running LLM — useful for development and demos.

</div>

</div>

## Applications

<div class="card-grid">

<div class="card">

### VS Code Extension

AI coding assistant in your editor. Create files, run commands, browse context, and use tools with human-in-the-loop approval.

[Getting started →](/getting-started/)

</div>

<div class="card">

### Documentation

Guides for installation, configuration, architecture, and development.

[Read the docs →](/getting-started/)

</div>

</div>

## Community

<div class="card-grid">

<div class="card">

### GitHub

Source code, issues, and pull requests.

[github.com/codewithshinde/thunder-ai-agent](https://github.com/codewithshinde/thunder-ai-agent)

</div>

<div class="card">

### Discord

Chat with the community, ask questions, and share feedback.

[Join Discord](https://discord.gg/sa8rubf6HH)

</div>

</div>

## Other editor support

Mitii runs as a VS Code extension and works in **VS Code**, **Cursor**, **Windsurf**, and other VS Code-compatible editors.
