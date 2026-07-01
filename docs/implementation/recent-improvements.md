# Recent improvements

This page tracks major capabilities shipped in Mitii AI Agent v2.6.x. Settings use the `thunder.*` namespace in VS Code (historical internal name); the product brand is **Mitii**.

## UI panels wired end-to-end

Previously built but not visible in the chat UI — now fully integrated:

| Panel | What you see |
|-------|----------------|
| **Context debugger** | Retrieved vs included tokens, source breakdown, dropped items, request-size meter |
| **Memory browser** | Browse, delete, and clear long-term observations |
| **Checkpoint browser** | List pre-write snapshots; restore with one click |

Open them in the chat view below pinned context. Memory and checkpoints share a tabbed side panel.

## First-class LLM providers

Beyond generic OpenAI-compatible endpoints, Mitii now has native paths for:

| Provider | Type key | Notes |
|----------|----------|-------|
| OpenAI-compatible | `openai-compatible` | Ollama, LM Studio, vLLM, proxies |
| OpenAI | `openai` | `api.openai.com` defaults |
| Anthropic | `anthropic` | Native Messages API + streaming |
| Google Gemini | `gemini` | Native Gemini API |
| DeepSeek | `deepseek` | OpenAI-compatible preset |
| Cursor | `cursor` | OpenAI-compatible preset |
| OpenAI Codex | `codex` | OpenAI-compatible preset |
| Echo | `echo` | UI/testing stub |

Configure in **Settings → Model**. Use **Test connection** before saving.

## Separate Plan vs Act models

Optional overrides in **Settings → Agent**:

- `thunder.agent.planModel` + `planBaseUrl` — cheaper model for planning
- `thunder.agent.actModel` + `actBaseUrl` — stronger model for implementation

Leave blank to use the main provider model for both modes.

## Differentiated autonomy presets

`safe`, `guided`, `builder`, `pilot`, and `enterprise` now have **distinct behavior** — not identical logic:

- **Safe / Enterprise** — network off (`fetch_web` blocked), full review
- **Guided** — `ask_edits` approval mode, network on for docs fetch
- **Builder** — auto-approve writes, review mutating shell
- **Pilot** — high write autonomy, shell still gated

Selector available in **Settings → Safety**.

## MCP remote transports

MCP servers support three transports:

| Transport | Config |
|-----------|--------|
| **stdio** | `command`, `args`, `env` (local `npx` servers) |
| **sse** | `url`, `headers` (remote SSE) |
| **streamable-http** | `url`, `headers` (MCP Streamable HTTP spec) |

OAuth / bearer tokens via `headers.Authorization` or `oauth.accessToken` in server config. Edit in **Settings → Integrations**.

## Git-stash checkpoints

Checkpoint strategy is configurable (`thunder.agent.checkpointStrategy`):

- **`git-stash`** (default) — `git stash push` before writes when repo available
- **`shadow-git`** — shadow stash with distinct message prefix
- **`file-copy`** — copies to `.mitii/checkpoints/` (fallback)

Restore from the **Checkpoints** panel or via controller API.

## Inline diff accept/reject

When a write or patch awaits approval:

1. **View in editor** on the approval card opens inline decorations
2. Run **Mitii: Accept Inline Diff** or **Mitii: Reject Inline Diff** from the command palette
3. Optional **diff preview tabs** still available via `thunder.agent.showDiffPreview`

## Browser tool (`fetch_web`)

HTTP fetch for external docs and API references:

- 30s timeout, 50k char cap, HTML stripped to text
- Gated by `thunder.safety.allowNetwork` / autonomy preset
- Blocked in **safe** and **enterprise** presets

## Workspace path migration: `.thunder/` → `.mitii/`

All new workspace data uses **`.mitii/`**:

| Path | Contents |
|------|----------|
| `mitii.sqlite` | Index, sessions, memory, plans, checkpoints |
| `logs/` | JSONL session logs |
| `checkpoints/` | File-copy snapshots |
| `tasks/` | Plan JSON files |
| `mcp.json` | Workspace MCP servers |
| `skills/` | `SKILL.md` skill definitions |
| `diff-preview/` | Temporary diff preview files |

Legacy `.thunder/` paths are still ignored for backward compatibility.

## Test coverage

New Vitest suites cover providers, autonomy presets, MCP auth, plan/act config, checkpoint strategy, `fetch_web` policy, and planning skill routing (`test/features.test.ts`, `test/plan-skill-routing.test.ts`).

## Cursor-style Plan mode UI

Plan mode now uses a dedicated **Planner** panel (above chat) instead of duplicating the plan in chat prose:

| UI element | What it shows |
|------------|----------------|
| **Planning pipeline** | Live status: discovery → requirement analysis → compile |
| **Requirement analysis** | Collapsible section streamed into the panel |
| **Skill chips** | Applied playbooks (`planning-and-task-breakdown`, etc.) |
| **Phased steps** | Diagnostics / Review / Execute / Verify groups |
| **Step details** | Objective, tools, success criteria, dependencies, risk |

Chat shows a short summary when the plan is ready; the panel is the single source of truth.

## Planning skills integration

Previously, `use_skill` was allowed during planning but never prompted or auto-loaded — the model often searched source code instead of loading playbooks.

Now:

1. **PlanOrchestrator** resolves skills by intent and pre-loads playbook content
2. **Discovery / analysis / compiler prompts** include skill guidance and injected playbooks
3. **Plan nudges** mention `use_skill` when grounding is missing
4. **Quality gate** expects verification-oriented success criteria on multi-step plans

Bundled skills install to `.mitii/skills/` on workspace scaffold (8 playbooks including `planning-and-task-breakdown` and `using-agent-skills`).
