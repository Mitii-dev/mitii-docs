# LLM providers

Mitii routes all model calls through a configurable **provider** — the LLM backend that powers the agent. You can point Mitii at cloud APIs (Anthropic, OpenAI, Gemini, etc.) or a local inference server (Ollama, LM Studio, vLLM) without changing any other part of the setup.

Configuration lives in one place and works identically across all three surfaces:

| Surface | Where to configure |
|---------|-------------------|
| VS Code extension | Sidebar → **Settings → Provider** page, or `mitii.provider.*` in VS Code settings |
| CLI (`@mitii/cli`) | `mitii setup` (writes `.mitii/config.json`) or environment variables |
| Custom host (`@mitii/sdk`) | Inject an `LlmPort` implementation programmatically |

Under the hood, providers implement a transport layer (HTTP, streaming, tool calling) exposed through the `@mitii/sdk` `LlmPort` interface. The agent engine consumes model output without knowing which provider is behind it.

## Supported providers

The settings UI uses **presets** as the primary selector. A preset prefills the base URL, default model, and whether an API key is required. The underlying wire protocol is a **type** (`mitii.provider.type`) — you can override it if you need a non-standard endpoint.

| Preset | Type | Best for | API key | Default base URL |
|--------|------|----------|---------|------------------|
| Ollama | `openai-compatible` | Local LLMs (Ollama, LM Studio, vLLM) | Optional | `http://localhost:11434/v1` |
| OpenAI | `openai` | OpenAI GPT models | Required | `https://api.openai.com/v1` |
| Anthropic | `anthropic` | Claude | Required | `https://api.anthropic.com` |
| Gemini | `gemini` | Google Gemini | Required | `https://generativelanguage.googleapis.com` |
| DeepSeek | `deepseek` | DeepSeek Chat | Required | `https://api.deepseek.com/v1` |
| Cursor | `cursor` | Cursor API | Required | `https://api.cursor.com/v1` |
| Codex | `codex` | OpenAI Codex | Required | `https://api.openai.com/v1` |
| Echo | `echo` | UI testing (no network) | None | N/A |

## Getting started

1. **Pick a preset** in Settings → Provider (or run `mitii setup` in the CLI).
2. **Set the model** — choose from the dropdown or type a custom model name.
3. **Add your API key** — for cloud providers, enter it in the settings field (stored in VS Code SecretStorage, never written to settings JSON). For local providers, no key is needed.
4. **Test the connection** — click **Test connection** to verify the endpoint responds. This is a one-shot probe that shows a status indicator; it is not a persisted setting.
5. **Start using Mitii** — the agent will now route all model calls through your provider.

### Example: local Ollama

```bash
# Pull a model and start the server
ollama pull qwen3-coder:30b
ollama serve
```

Then in VS Code settings:

```json
{
  "mitii.provider.preset": "ollama",
  "mitii.provider.type": "openai-compatible",
  "mitii.provider.baseUrl": "http://localhost:11434/v1",
  "mitii.provider.model": "qwen3-coder:30b",
  "mitii.provider.contextWindow": 32768
}
```

### Example: Anthropic (Claude)

```json
{
  "mitii.provider.preset": "anthropic",
  "mitii.provider.type": "anthropic",
  "mitii.provider.model": "claude-sonnet-4-20250514",
  "mitii.provider.contextWindow": 200000
}
```

Add your API key in the settings field. Mitii uses the native Messages API with streaming and tool calling.

### Example: Gemini

```json
{
  "mitii.provider.preset": "gemini",
  "mitii.provider.type": "gemini",
  "mitii.provider.model": "gemini-2.0-flash",
  "mitii.provider.contextWindow": 1000000
}
```

## Configuration reference

| Setting | Description |
|---------|-------------|
| `mitii.provider.preset` | Preset selector — prefills type, base URL, and model |
| `mitii.provider.type` | Wire protocol type (see supported providers table) |
| `mitii.provider.baseUrl` | API base URL (saved exactly as typed) |
| `mitii.provider.model` | Model name sent in chat requests |
| `mitii.provider.contextWindow` | Hard cap for prompt trimming, in tokens. `0` uses the model's preset default. |
| `mitii.provider.maximumOutputTokens` | Reserved output tokens. `0` derives ~20% of context window (minimum 10 240). |
| `mitii.provider.apiKey` | API key. Stored in VS Code SecretStorage — never written to settings JSON. |

## Token budget

The context window is the single knob that controls how much information Mitii can work with in one turn. All internal budgets — retrieval depth, prompt compaction, mutation batch size, verification checks, and the per-call token cap — scale proportionally from that window.

In the settings UI you'll see a **derived budget** panel that updates live as you adjust the context window or max output. It shows:

- Usable input tokens
- Output reserve
- Model-call cap
- Files per mutation batch
- Verification check budget
- A module-share bar indicating how the window is divided

If you've manually tuned `mitii.tokenBudget.*` values and want to go back, use **Reset budgets to defaults** to clear those overrides and restore the built-in ratios for your current window.

## Profiles

If you work with multiple providers (e.g., a local model for quick edits and a cloud model for complex tasks), **profiles** let you save named configurations and switch between them without re-entering settings each time.

Profiles are stored in `.mitii/profiles.json` in your workspace root.

## CLI configuration

The CLI reads from `.mitii/config.json` (written by `mitii setup`) or environment variables:

```bash
# Interactive setup — walks you through provider, model, and key
mitii setup

# Or set env vars directly (never printed by --show)
export ANTHROPIC_API_KEY=sk-ant-...
export GEMINI_API_KEY=...
export OPENAI_API_KEY=...
export MITII_API_KEY=...

# Smoke test without a live model
mitii ask "What is recursion?" --echo

# Check current config (secrets are redacted)
mitii setup --show
```

Per-invocation flags override the saved config:

```
--provider <id>              Provider type (e.g. anthropic, openai-compatible)
--model <id>                 Model name
--base-url <url>             API base URL
--mode <ask|plan|agent>      Execution mode
```

## SDK (custom hosts)

If you're building a custom application on top of Mitii, inject an `LlmPort` implementation via `@mitii/sdk`. This keeps your app decoupled from the agent engine internals:

```ts
import { createMitiiClient, EchoLlmPort, AnthropicLlmPort, GeminiLlmPort, OpenAiCompatibleLlmPort } from "@mitii/sdk";

const client = createMitiiClient({
  llm: new AnthropicLlmPort({ apiKey: [REDACTED] }),
});
```

Available `LlmPort` implementations: `AnthropicLlmPort`, `GeminiLlmPort`, `OpenAiCompatibleLlmPort`, `EchoLlmPort` (for tests).

## Advanced: per-role model assignment

By default, all agent roles (planning, acting, research) use the same provider and model. You can assign different models to different roles to optimize for speed or cost:

### Plan vs. Act split

Use a smaller, faster model for planning (deciding what to do) and a larger model for acting (writing code):

```json
{
  "mitii.provider.preset": "ollama",
  "mitii.provider.type": "openai-compatible",
  "mitii.provider.model": "qwen3-coder:30b",
  "mitii.agent.planModel": "qwen3.5:4b",
  "mitii.agent.actModel": "qwen3-coder:30b"
}
```

### Research subagent

The `spawn_research_agent` tool spawns read-only workers that explore the codebase. Point them at a faster model to reduce latency:

```json
{
  "mitii.agent.researchAgentModel": "qwen3.5:4b",
  "mitii.agent.researchAgentBaseUrl": ""
}
```

An empty `researchAgentBaseUrl` means the research agent uses the same endpoint as the main provider.

## Echo provider (testing)

The Echo provider returns a fixed canned response without making any network calls. Use it to verify UI behavior, approval flows, indexing, and tool routing in isolation:

- **VS Code**: set `mitii.provider.preset` to `echo`
- **CLI**: pass the `--echo` flag

## Privacy

Mitii does not operate a central inference server. Chat requests go **only** to the endpoint you configure. API keys stay in VS Code SecretStorage (or environment variables for the CLI). Session logs and code indexes remain in `.mitii/` on your machine.

## Codebase location

| Concern | Package |
|---------|--------|
| Provider transport (HTTP, streaming, tool calling) | `@mitii/sdk` (`LlmPort` implementations) |
| Provider config persistence | `apps/vscode` (SecretStorage) / `apps/cli` (`.mitii/config.json`) |
| Agent engine (consumes provider output) | `@mitii/v8` |
| Indexing, checkpoints, memory (host services) | `@mitii/host` |

See [Connect a Model](/using/connect-model) for troubleshooting.
