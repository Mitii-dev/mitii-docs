# VS Code Extension — Overview

Mitii is a local-first AI coding agent for VS Code. It indexes your repository, answers in Ask mode, plans in Plan mode, applies changes in Agent mode, and can provide FIM inline autocomplete — with approvals, checkpoints, and OpenAI-compatible providers (Ollama, LM Studio, cloud `/v1` APIs).

**Marketplace id:** `mitii.mitii-ai-agent`

## Install

1. In VS Code: **Extensions** → search **Mitii AI Agent** → Install
   Or open: [Marketplace – mitii.mitii-ai-agent](https://marketplace.visualstudio.com/items?itemName=mitii.mitii-ai-agent)
2. Open a trusted workspace folder
3. Click the Mitii icon in the activity bar
4. Wait for indexing to finish (status in the sidebar / Settings → Index)
5. In **Settings → Provider**, choose:
   - **echo** – local stub (no API key)
   - **Anthropic (Claude)** / **Gemini** / **DeepSeek** / **OpenAI** / **OpenRouter**
   - **Custom OpenAI-compatible** – any `/v1/chat/completions` API

For cloud providers, run **Mitii: Set Provider API Key** (stored in VS Code SecretStorage). Local Ollama/LM Studio usually need no key.

**Requires VS Code 1.124+.** License: AGPL-3.0-or-later.

## What you get

- **Repository-aware context** – SQLite FTS5, symbols, optional vectors, repo map, diagnostics, Git state, and `@` attachments
- **Skills** – force-attach playbooks with `/` or `@skill:id` in chat (up to 3 per message); workspace skills in `.mitii/skills/`
- **Ask / Plan / Agent** – read-only Q&A, structured plans, and controlled edits. Use the collapsible **Review** bar above chat (file count → Review) for structured working-tree findings via `emit_review_finding` — not a fourth mode. After findings appear, use **Dismiss**, **Fix**, or **Fix all** (Agent + `fix-review-findings` recipe).
- **FIM autocomplete** – optional inline ghost text from a low-latency OpenAI-compatible `prompt` + `suffix` endpoint
- **Safety** – configurable approvals, path containment, command policy, pre-write checkpoints, workspace trust
- **Providers** – Echo, Anthropic (Claude), Gemini, and OpenAI-compatible endpoints (DeepSeek, OpenRouter, Azure, Ollama, custom `/v1`)
- **MCP** – optional stdio servers (`mitii.mcp` / `.mitii/mcp.json`); off by default
- **Evidence** – session logs and audit-pack export (secrets redacted). Org SSO / RBAC / SIEM are not included

## Quick commands

| Command | Purpose |
|---|---|
| **Mitii: Open Chat** | Open the sidebar |
| **Mitii: Review Working Tree Changes** | Switch to Review mode and run a structured review |
| **Mitii: Index Workspace** | Rebuild repository index |
| **Mitii: Show Settings** | Provider, index, MCP, workspace |
| **Mitii: Toggle Autocomplete** | Enable or disable FIM inline suggestions |
| **Mitii: Set Provider API Key** | Store cloud API key in SecretStorage |
| **Mitii: Generate Commit Message** | SCM commit helper (force-attaches `git-commit-message`) |
| **Mitii: Generate PR Summary** | Draft PR body (force-attaches `git-pr-summary`) |
| **Mitii: Generate Changelog** | Keep a Changelog draft (force-attaches `release-changelog`) |
| **Mitii: Prepare Release Notes** | Release notes via `release-changelog` |
| **Mitii: Export Session Log** | Export session JSON |
| **Mitii: Export Audit Pack** | Redacted audit bundle |
| **Mitii: Export Shareable Diagnostic** | One redacted markdown file for pasting into online chat help |

## Requirements

- **VS Code 1.124+** (or compatible fork: Cursor, Windsurf, VSCodium)
- **Node.js 20+** on the system PATH (used for the agent runtime)
- A connected model provider (see [CLI Setup](/using/CLI/setup) for provider details)

## Next

- [Settings](./settings) — full configuration reference
- [Skills](./skills) — attaching skills and recipes
