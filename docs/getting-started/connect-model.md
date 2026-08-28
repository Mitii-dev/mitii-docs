# Connect a Model

### CLI setup

```bash
mitii setup                                    # interactive
mitii setup --provider anthropic --yes         # non-interactive
mitii setup --provider ollama --yes            # local Ollama
mitii setup --show                             # verify (no secrets printed)
mitii ask "ping" --echo                        # smoke test
```

Config → `.mitii/config.json` (project) or `~/.mitii/config.json` (`--global`). Keys stay in env vars.

Mitii supports eight provider types. Configure once and the same settings work across the VS Code extension, the CLI, and any custom host built on `@mitii/sdk`.

## Quick start (VS Code)

1. Open **Settings → Provider** in the Mitii sidebar (or follow the onboarding prompt).
2. Pick a **preset** (Ollama, Anthropic, Gemini, …) — it auto-fills base URL and model.
3. Add your API key if the provider requires one (local hosts usually don't).
4. Click **Test connection** → **Save**.

The preset is stored in `mitii.provider.preset` and persists across sessions.

## Quick start (CLI)

```bash
# Interactive setup — writes .mitii/config.json
mitii setup

# Or set an env var and go
export ANTHROPIC_API_KEY=sk-ant-...
mitii session

# Smoke test without a live model
mitii ask "What is recursion?" --echo
```

Supported environment variables: `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `MITII_API_KEY`.

## Provider presets

| Preset | Best for | API key | Default base URL |
|--------|----------|---------|------------------|
| Ollama | Local, free | None | `http://localhost:11434/v1` |
| OpenAI-compatible | vLLM, LM Studio, Together, Groq | Optional | — |
| OpenAI | GPT models | Required | `https://api.openai.com/v1` |
| Anthropic | Claude | Required | `https://api.anthropic.com` |
| Gemini | Google Gemini | Required | `https://generativelanguage.googleapis.com` |
| DeepSeek | DeepSeek Chat | Required | `https://api.deepseek.com/v1` |
| Cursor | Cursor API | Required | `https://api.cursor.com/v1` |
| Codex | OpenAI Codex | Required | `https://api.openai.com/v1` |
| Echo | UI testing (no LLM) | None | N/A |

Pick a preset in **Settings → Provider** and the base URL + model dropdown fill in automatically. You can still override any field manually.

## Ollama (recommended local)

1. [Install Ollama](https://ollama.com/)
2. Pull a coding model:

```bash
ollama pull qwen3-coder:30b
```

3. In Mitii **Settings → Provider**:

| Field | Value |
|-------|-------|
| Preset | Ollama |
| Base URL | `http://localhost:11434/v1` |
| Model | `qwen3-coder:30b` |

4. Click **Test connection** → **Save**

No API key needed.

## vLLM / LM Studio / self-hosted

Set preset to **OpenAI-compatible**. Point base URL at your server (include `/v1` if required). Add API key if your server needs one.

## Anthropic (Claude)

| Field | Value |
|-------|-------|
| Preset | Anthropic |
| Model | `claude-sonnet-4-20250514` |
| Context window | `200000` |

Add API key in settings. Mitii uses the native Messages API.

## Google Gemini

| Field | Value |
|-------|-------|
| Preset | Gemini |
| Model | `gemini-2.0-flash` |

Add API key in settings.

## OpenAI / DeepSeek / Cursor / Codex

Select the matching preset in settings. Defaults fill base URL and model name. Add API key and test connection.

## Cloud OpenAI-compatible

Works with Azure OpenAI, Together, Groq, or any chat-completions API:

```json
{
  "mitii.provider.preset": "openai-compatible",
  "mitii.provider.baseUrl": "https://your-endpoint/v1",
  "mitii.provider.model": "your-model"
}
```

## Token limits

| Setting | What it does |
|---------|-------------|
| `mitii.provider.contextWindow` | Hard cap for prompt trimming (tokens). `0` = use the model preset default. |
| `mitii.provider.maximumOutputTokens` | Max tokens per model response. `0` = derive ~20% of context window (min 10 240). |

The settings UI shows a **derived budget** preview: usable input tokens, output reserve, model-call cap, files per mutation batch, and verification checks. It updates live as you change the context window or max output.

Click **Reset budgets to defaults** to clear any custom `mitii.tokenBudget.*` overrides and restore built-in ratios.

## Plan vs Act models

Use a fast model for planning and a strong model for implementation:

```json
{
  "mitii.provider.model": "qwen3-coder:30b",
  "mitii.agent.planModel": "qwen3.5:4b",
  "mitii.agent.actModel": "qwen3-coder:30b"
}
```

Configure in **Settings → Agent**.

## Echo provider (no LLM)

Set preset to **Echo** to test UI, approvals, indexing, and tool routing without network calls.

CLI equivalent:

```bash
mitii ask "What is recursion?" --echo
```

## Profiles

Switch between multiple provider configurations without re-entering settings. Profiles are stored in `.mitii/profiles.json`. Use the profile switcher in the sidebar to jump between, say, a local Ollama setup and a cloud Anthropic key.

## SDK (programmatic)

If you're building a custom host, inject a provider port directly:

```ts
import { createMitiiClient, AnthropicLlmPort } from '@mitii/sdk';

const client = createMitiiClient({
  understandingLlm: new AnthropicLlmPort({ apiKey: process.env.ANTHROPIC_API_KEY }),
  runLlm: new AnthropicLlmPort({ apiKey: process.env.ANTHROPIC_API_KEY }),
  workspaceRoot: process.cwd(),
});
```

Available ports: `AnthropicLlmPort`, `GeminiLlmPort`, `OpenAiCompatibleLlmPort`, `EchoLlmPort`.

## Privacy

Mitii does not send code to a Mitii server. Traffic goes only to the endpoint you configure. API keys stay in VS Code SecretStorage (or env vars for CLI). Indexes and logs stay in `.mitii/` on your machine.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Connection refused | Start Ollama (`ollama serve`) or check base URL |
| Model not found | `ollama list` — use exact model tag |
| Anthropic/Gemini auth error | Verify API key in settings or env var |
| Slow responses | Smaller model or GPU for Ollama |
| Context trimmed | Increase `mitii.provider.contextWindow` |
| CLI: no provider configured | Run `mitii setup` or set `ANTHROPIC_API_KEY` / `MITII_API_KEY` |
| CLI: wrong model | `mitii setup --show` to verify, then re-run `mitii setup` |

[Full provider reference →](/implementation/providers) · [Configuration →](/configuration)
