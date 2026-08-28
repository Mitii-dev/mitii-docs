# LLM providers

Mitii supports eight provider types. Configure in the sidebar **Settings → Provider** page or VS Code settings under `mitii.provider.*`. The same settings work across VS Code, the CLI (`@mitii/cli`), and any custom host built on `@mitii/sdk`.

Providers plug into the **Agent Engine** (V8 module stack) through the `@mitii/sdk` host-neutral API. The SDK abstracts the transport so the same provider config works everywhere.

## Presets vs. types

The settings UI uses **presets** as the primary selector. A preset prefills the base URL, default model, and whether an API key is required. Under the hood the wire protocol is still a **type** (`mitii.provider.type`).

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

## Settings

| Setting | What it does |
|---------|-------------|
| `mitii.provider.preset` | Preset selector (prefills type, base URL, model) |
| `mitii.provider.type` | Wire protocol type (see table above) |
| `mitii.provider.baseUrl` | API base URL (saved as typed) |
| `mitii.provider.model` | Model name in chat requests (dropdown or custom) |
| `mitii.provider.contextWindow` | Hard cap for prompt trimming (tokens). `0` = use the model preset default. |
| `mitii.provider.maximumOutputTokens` | Output reserve. `0` derives ~20% of context window (floored at 10 240). |
| `mitii.provider.apiKey` | Stored in **VS Code SecretStorage** — never written to settings JSON. |

Use **Test connection** in settings before saving cloud providers. The test is a host probe that shows a status pill only — it is not a persisted setting.

## Token budget

The context window is the only token setting a user needs. Retrieval, compaction, mutation batches, verification checks, and the derived model-call cap all scale from that window.

- **Derived budget** (live preview): usable input, output reserve, model-call cap, files per mutation, verification checks, and a module-share bar. Updates as soon as the context window or max output changes.
- **Reset budgets to defaults**: clears `mitii.tokenBudget.*` overrides and restores built-in ratios for the current window.

## Profiles

Switch between multiple provider configurations without editing settings each time. Profiles are stored in `.mitii/profiles.json` in your workspace.

## CLI configuration

```bash
# Interactive setup — writes .mitii/config.json
mitii setup

# Or set env vars (never printed by --show)
export ANTHROPIC_API_KEY=sk-ant-...
export GEMINI_API_KEY=...
export OPENAI_API_KEY=...
export MITII_API_KEY=...

# Smoke test without a live model
mitii ask "What is recursion?" --echo

# Check current config (no secrets)
mitii setup --show
```

CLI flags: `--provider <id>`, `--model <id>`, `--base-url <url>`, `--mode <ask|plan|agent>`.

## SDK (custom hosts)

For custom applications, inject an `LlmPort` implementation via `@mitii/sdk`:

```ts
import { createMitiiClient, EchoLlmPort, AnthropicLlmPort, GeminiLlmPort, OpenAiCompatibleLlmPort } from "@mitii/sdk";

const client = createMitiiClient({
  llm: new AnthropicLlmPort({ apiKey: process.env.ANTHROPIC_API_KEY }),
});
```

Apps and tests use the SDK instead of importing V8 internals directly.

## Local: Ollama

```bash
ollama pull qwen3-coder:30b
ollama serve
```

```json
{
  "mitii.provider.preset": "ollama",
  "mitii.provider.type": "openai-compatible",
  "mitii.provider.baseUrl": "http://localhost:11434/v1",
  "mitii.provider.model": "qwen3-coder:30b",
  "mitii.provider.contextWindow": 32768
}
```

## Cloud: Anthropic

```json
{
  "mitii.provider.preset": "anthropic",
  "mitii.provider.type": "anthropic",
  "mitii.provider.model": "claude-sonnet-4-20250514",
  "mitii.provider.contextWindow": 200000
}
```

Add API key in settings (SecretStorage). Mitii uses the native Messages API with streaming and tool calling.

## Cloud: Gemini

```json
{
  "mitii.provider.preset": "gemini",
  "mitii.provider.type": "gemini",
  "mitii.provider.model": "gemini-2.0-flash",
  "mitii.provider.contextWindow": 1000000
}
```

## Plan vs Act model split

```json
{
  "mitii.provider.preset": "ollama",
  "mitii.provider.type": "openai-compatible",
  "mitii.provider.model": "qwen3-coder:30b",
  "mitii.agent.planModel": "qwen3.5:4b",
  "mitii.agent.actModel": "qwen3-coder:30b"
}
```

## Research subagent model

Faster model for read-only `spawn_research_agent` workers:

```json
{
  "mitii.agent.researchAgentModel": "qwen3.5:4b",
  "mitii.agent.researchAgentBaseUrl": ""
}
```

Empty `researchAgentBaseUrl` uses the main provider URL.

## Echo provider

Set `mitii.provider.preset` to `echo` to test UI, approvals, indexing, and tool routing without network calls. In the CLI, use the `--echo` flag.

## Privacy note

Mitii does not operate a central inference server. Chat requests go **only** to the endpoint you configure. API keys stay in VS Code SecretStorage (or env vars for CLI). Session logs and indexes stay in `.mitii/` on your machine.

## Codebase location

| Concern | Package |
|---------|--------|
| Provider transport (HTTP, streaming, tool calling) | `@mitii/sdk` (`LlmPort` implementations) |
| Provider config persistence | `apps/vscode` (SecretStorage) / `apps/cli` (`.mitii/config.json`) |
| Agent engine (uses provider output) | `@mitii/v8` |
| Indexing, checkpoints, memory (host services) | `@mitii/host` |

See [Connect a Model](/getting-started/connect-model) for troubleshooting.
