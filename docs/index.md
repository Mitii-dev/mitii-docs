---
layout: home

hero:
  name: Mitii AI Agent
  text: Local-first coding agent
  tagline: Deep repo context, Plan/Act workflow, tunable safety — your code stays on your machine.
  image:
    src: /logo.svg
    alt: Mitii AI Agent
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/
    - theme: alt
      text: Why Mitii?
      link: /why-mitii
    - theme: alt
      text: View on GitHub
      link: https://github.com/codewithshinde/thunder-ai-agent

features:
  - icon: 🔍
    title: Deep repo context
    details: SQLite + FTS5, tree-sitter symbols, PageRank repo map, MiniLM vectors, hybrid retriever, and a live context debugger.
  - icon: 🛡️
    title: Plan / Act / Review
    details: Plan before you edit. Separate plan and act models. Execute with approval gates. Review without rewriting.
  - icon: 🔑
    title: 8 LLM providers
    details: Ollama, OpenAI, Anthropic, Gemini, DeepSeek, Cursor, Codex — or Echo for testing. BYOM, local-first.
  - icon: 🔌
    title: MCP integrations
    details: Built-in filesystem, memory, sequential-thinking. Remote SSE/HTTP servers. Bearer OAuth headers.
  - icon: 🧠
    title: Memory & checkpoints
    details: Long-term observations, memory browser, git-stash checkpoints, restore from sidebar.
  - icon: ⚙️
    title: Tunable safety
    details: Five autonomy presets, inline diff accept/reject, dangerous command blocking, JSONL audit logs.
---

## What is Mitii?

Mitii is an AI coding agent inside VS Code (and Cursor, Windsurf, and other compatible editors). It reads and writes files, runs terminal commands, uses MCP tools, and helps you ship features through natural conversation. Every write and shell action can require your explicit approval.

**[What makes Mitii different →](/why-mitii)**

## Model access

<div class="card-grid">

<div class="card">

### Local (Ollama / vLLM)

Run models on your machine. Default: `http://localhost:11434/v1`. Zero data leaves your network.

</div>

<div class="card">

### Cloud providers

Native **Anthropic** and **Gemini** APIs. OpenAI, DeepSeek, Cursor, Codex via first-class presets.

</div>

<div class="card">

### OpenAI-compatible

Any endpoint that speaks chat completions — Azure, proxies, self-hosted.

</div>

<div class="card">

### Echo provider

Test UI, approvals, indexing, and tool loop without a running LLM.

</div>

</div>

[Full provider guide →](/implementation/providers)

## Documentation map

<div class="card-grid">

<div class="card">

### Getting started

Install, connect a model, first session.

[Start here →](/getting-started/)

</div>

<div class="card">

### Implementation guides

Plan/Act, providers, MCP, safety, context, tools.

[Browse guides →](/implementation/recent-improvements)

</div>

<div class="card">

### Architecture

System design, data flow, `.mitii/` layout.

[Read architecture →](/architecture)

</div>

</div>

## Community

<div class="card-grid">

<div class="card">

### GitHub

Source, issues, pull requests.

[thunder-ai-agent](https://github.com/codewithshinde/thunder-ai-agent)

</div>

<div class="card">

### Discord

Questions, feedback, community.

[Join Discord](https://discord.gg/sa8rubf6HH)

</div>

</div>

## Editor support

Mitii runs as a VS Code extension in **VS Code**, **Cursor**, **Windsurf**, and other VS Code-compatible editors.
