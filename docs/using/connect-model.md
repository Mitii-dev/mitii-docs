# Connect a Model

Mitii routes all model calls through a configurable provider. You set this up once, and the same configuration works across the VS Code extension, the CLI, and any custom host built on `@mitii/sdk`.

Configuration is stored in `.mitii/config.json` (project-level) or `~/.mitii/config.json` (global). API keys are kept in environment variables or VS Code SecretStorage — they are never written to the config file.

## Getting Started

### VS Code

1. Open **Settings → Provider** in the Mitii sidebar (or follow the onboarding prompt on first launch).
2. Pick a **preset** — a preconfigured combination of base URL and model for a specific provider. Selecting a preset auto-fills the remaining fields.
3. Add your API key if the provider requires one (local providers like Ollama don't).
4. Click **Test connection**, then **Save**.

The preset is stored in `mitii.provider.preset` and persists across sessions.

### CLI

```bash
# Interactive setup — writes .mitii/config.json
mitii setup

# Non-interactive (CI, scripts)
mitii setup --provider anthropic --yes
mitii setup --provider ollama --yes

# Verify current configuration (no secrets printed)
mitii setup --show

# Smoke test without a live model
mitii ask "What is recursion?" --echo
```

You can also skip `mitii setup` entirely and set an environment variable directly:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
mitii session
```

Supported environment variables: `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `MITII_API_KEY`.

## Provider Presets

A preset bundles the base URL, default model, and API-key requirement for a given provider. Available presets:

| Preset | Best for | API key | Default base URL |
|--------|----------|---------|------------------|
| Ollama | Local, free | None | `http://localhost:11434/v1` |
| OpenAI-compatible | vLLM, LM Studio, Together, Groq, Azure | Optional | — |
| OpenAI | GPT models | Required | `https://api.openai.com/v1` |
| Anthropic | Claude | Required | `https://api.anthropic.com` |
| Gemini | Google Gemini | Required | `https://generativelanguage.googleapis.com` |
| DeepSeek | DeepSeek Chat | Required | `https://api.deepseek.com/v1` |
| Cursor | Cursor API | Required | `https://api.cursor.com/v1` |
| Codex | OpenAI Codex | Required | `https://api.openai.com/v1` |
| Echo | UI testing (no LLM) | None | N/A |

After selecting a preset you can override any field (base URL, model, context window) manually.

## Provider Setup

### Ollama (local, no API key)

The recommended option for local development.

1. [Install Ollama](https://ollama.com/) and start the server (`ollama serve`).
2. Pull a coding model:

   ```bash
   ollama pull qwen3-coder:30b
   ```

3. In Mitii **Settings → Provider**, select the **Ollama** preset. Base URL and model fill in automatically.
4. Click **Test connection** → **Save**.

No API key is needed.

### Anthropic (Claude)

Select the **Anthropic** preset. Default model: `claude-sonnet-4-20250514`, context window: `200000` tokens. Add your API key in settings. Mitii uses the native Messages API.

### Google Gemini

Select the **Gemini** preset. Default model: `gemini-2.0-flash`. Add your API key in settings.

### OpenAI / DeepSeek / Cursor / Codex

Select the matching preset. The base URL and model name fill in automatically. Add your API key and test the connection.

### Self-hosted or cloud OpenAI-compatible endpoints

For vLLM, LM Studio, Azure OpenAI, Together, Groq, or any other chat-completions API, use the **OpenAI-compatible** preset and point the base URL at your server:

```json
{
  "mitii.provider.preset": "openai-compatible",
  "mitii.provider.baseUrl": "https://your-endpoint/v1",
  "mitii.provider.model": "your-model"
}
```

Include `/v1` in the base URL if your server requires it. Add an API key if the endpoint needs one.

## Advanced Configuration

### Token limits

| Setting | What it does |
|---------|-------------|
| `mitii.provider.contextWindow` | Hard cap for prompt trimming (tokens). `0` = use the model preset default. |
| `mitii.provider.maximumOutputTokens` | Max tokens per model response. `0` = derive ~20% of context window (min 10 240). |

The settings UI shows a **derived budget** preview: usable input tokens, output reserve, model-call cap, files per mutation batch, and verification checks. It updates live as you change the context window or max output.

Click **Reset budgets to defaults** to clear any custom `mitii.tokenBudget.*` overrides and restore built-in ratios.

### Plan vs Act models

Mitii can use different models for the planning phase (analyzing the task, deciding on an approach) and the execution phase (writing code, running tools). This lets you pair a fast, cheap model for planning with a stronger model for implementation:

```json
{
  "mitii.provider.model": "qwen3-coder:30b",
  "mitii.agent.planModel": "qwen3.5:4b",
  "mitii.agent.actModel": "qwen3-coder:30b"
}
```

Configure in **Settings → Agent**.

### Profiles

Switch between multiple provider configurations without re-entering settings. Profiles are stored in `.mitii/profiles.json`. Use the profile switcher in the sidebar to jump between, for example, a local Ollama setup and a cloud Anthropic key.

### Echo provider (testing without a model)

Set the preset to **Echo** to exercise the UI, approval flow, indexing, and tool routing without any network calls or API key.

CLI equivalent:

```bash
mitii ask "What is recursion?" --echo
```

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

Mitii does not send code to a Mitii server. All traffic goes only to the endpoint you configure. API keys stay in VS Code SecretStorage (or environment variables for CLI). Indexes and logs remain in `.mitii/` on your machine.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Connection refused | Start Ollama (`ollama serve`) or check the base URL |
| Model not found | Run `ollama list` and use the exact model tag |
| Anthropic/Gemini auth error | Verify the API key in settings or the corresponding env var |
| Slow responses | Use a smaller model or run Ollama on a GPU |
| Context trimmed | Increase `mitii.provider.contextWindow` |
| CLI: no provider configured | Run `mitii setup` or set `ANTHROPIC_API_KEY` / `MITII_API_KEY` |
| CLI: wrong model | Run `mitii setup --show` to verify, then re-run `mitii setup` |

[Full provider reference →](/integrations/providers) · [Configuration →](/using/configuration)
